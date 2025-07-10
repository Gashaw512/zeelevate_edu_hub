const { db, admin } = require('../config/firebase-admin');
const crypto = require('crypto');

// Helper to validate and get program details
async function getProgramDetails(programId) {
  const programRef = db.collection('programs').doc(programId);
  const programSnap = await programRef.get();
  if (!programSnap.exists) {
    throw new Error('Program not found');
  }
  return { id: programSnap.id, ...programSnap.data() };
}

// Helper to get student details
async function getStudentDetails(uid) {
  const studentRef = db.collection('students').doc(uid);
  const studentSnap = await studentRef.get();
  if (!studentSnap.exists) {
    throw new Error(`Student with UID ${uid} not found`);
  }
  return { id: studentSnap.id, ...studentSnap.data() };
}

// PROGRAM MANAGEMENT FUNCTIONS
async function getAllPrograms() {
  // Get all programs
  const programsSnapshot = await db.collection('programs').orderBy('order').get();
  const programs = programsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
 
  const coursesSnapshot = await db.collection('courses').get();
  const allCourses = coursesSnapshot.docs.map(doc => ({
    id: doc.id,
    programIds: doc.data().programIds || [],
    duration: Number(doc.data().duration) || 0 
  }));
  
  return programs.map(program => {
    const programCourses = allCourses.filter(course => 
      course.programIds.includes(program.id)
    );
    
    const totalDays = programCourses.reduce(
      (sum, course) => sum + course.duration, 
      0
    );
    
    return {
      ...program,
      duration: totalDays
    };
  });
}

async function addProgram(programData) {
  const newProgramRef = await db.collection('programs').add({
    ...programData,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  return newProgramRef.id;
}

async function updateProgram(programId, updates) {
  const programRef = db.collection('programs').doc(programId);
  await programRef.update({
    ...updates,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

async function deleteProgram(programId) {
  const programRef = db.collection('programs').doc(programId);
  await programRef.delete();
}

// COURSE MANAGEMENT FUNCTIONS
async function getAllCourses() {
  const snapshot = await db.collection('courses').get();
  const courses = [];
  for (const doc of snapshot.docs) {
    const courseData = { id: doc.id, ...doc.data() };
    // Fetch program names for each programId in the course
    if (courseData.programIds && courseData.programIds.length > 0) {
      const programNames = [];
      for (const programId of courseData.programIds) {
        try {
          const programDetails = await getProgramDetails(programId);
          programNames.push(programDetails.title);
        } catch (error) {
          console.warn(`Program with ID ${programId} not found for course ${doc.id}`);
          // Optionally, handle programs that no longer exist, e.g., filter them out
        }
      }
      courseData.programNames = programNames;
    } else {
      courseData.programNames = [];
    }
    courses.push(courseData);
  }
  return courses;
}

async function addCourse(courseData) {
  const newCourseRef = db.collection('courses').doc(); // Generate ID upfront
  const courseId = newCourseRef.id;

  // Resolve program names from programIds
  const programNames = [];
  if (courseData.programIds && Array.isArray(courseData.programIds)) {
    for (const programId of courseData.programIds) {
      try {
        const programDetails = await getProgramDetails(programId);
        programNames.push(programDetails.title);
      } catch (error) {
        console.warn(`Program with ID ${programId} not found during course addition.`);
      }
    }
  }

  await newCourseRef.set({
    ...courseData,
    courseId: courseId, // Store the ID within the document
    programNames: programNames, // Store resolved program names
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  return courseId;
}


async function updateCourse(courseId, updates) {
  const courseRef = db.collection('courses').doc(courseId);
  const courseSnap = await courseRef.get();

  if (!courseSnap.exists) {
    throw new Error('Course not found');
  }

  // If programIds are being updated, resolve new program names
  if (updates.programIds && Array.isArray(updates.programIds)) {
    const programNames = [];
    for (const programId of updates.programIds) {
      try {
        const programDetails = await getProgramDetails(programId);
        programNames.push(programDetails.title);
      } catch (error) {
        console.warn(`Program with ID ${programId} not found during course update.`);
      }
    }
    updates.programNames = programNames;
  }

  await courseRef.update({
    ...updates,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

async function deleteCourse(courseId) {
  const courseRef = db.collection('courses').doc(courseId);
  await courseRef.delete();
}

// NOTIFICATION FUNCTIONS
async function sendProgramNotification(senderId, programId, message) {
  const programDetails = await getProgramDetails(programId);
  const programTitle = programDetails.title;

  const studentsSnapshot = await db.collection('students')
    .where('enrolledProgramIds', 'array-contains', programId)
    .get();

  const batch = db.batch();
  const notificationsRef = db.collection('notifications');
  const timestamp = admin.firestore.FieldValue.serverTimestamp();
  let sentCount = 0;

  studentsSnapshot.docs.forEach(doc => {
    const studentUid = doc.id;
    batch.set(notificationsRef.doc(), {
      message,
      senderId,
      recipientId: studentUid,
      programId,
      programTitle,
      type: 'program',
      createdAt: timestamp,
      read: false
    });
    sentCount++;
  });

  await batch.commit();
  return { success: true, count: sentCount, message: `Notification sent to ${sentCount} students in program '${programTitle}'` };
}

async function sendGlobalNotification(senderId, message) {
  const studentsSnapshot = await db.collection('students').get();

  const batch = db.batch();
  const notificationsRef = db.collection('notifications');
  const timestamp = admin.firestore.FieldValue.serverTimestamp();
  let sentCount = 0;

  studentsSnapshot.docs.forEach(doc => {
    const studentUid = doc.id;
    batch.set(notificationsRef.doc(), {
      message,
      senderId,
      recipientId: studentUid,
      type: 'global',
      createdAt: timestamp,
      read: false
    });
    sentCount++;
  });

  await batch.commit();
  return { success: true, count: sentCount, message: `Global notification sent to ${sentCount} students` };
}

async function sendIndividualNotification(senderId, recipientId, message, programId = null, type = 'individual') {
  const notificationsRef = db.collection('notifications');
  const timestamp = admin.firestore.FieldValue.serverTimestamp();
  let sentCount = 0;

  // If programId is provided and type is 'program', fetch program details
  let programTitle = null;
  if (type === 'program' && programId) {
    const programSnap = await db.collection('programs').doc(programId).get();
    if (!programSnap.exists) {
      throw new Error('Program not found');
    }
    programTitle = programSnap.data().title;
  }

  if (Array.isArray(recipientId)) {
    // Multiple recipients (batch write)
    const batch = db.batch();
    for (const uid of recipientId) {
      // Optional: Verify each recipient is a valid student if needed,
      // but for batch, we might skip individual checks for performance unless critical.
      const notificationData = {
        message,
        senderId,
        recipientId: uid,
        type: type,
        createdAt: timestamp,
        read: false
      };
      if (programId && type === 'program') {
        notificationData.programId = programId;
        notificationData.programTitle = programTitle;
      }
      batch.set(notificationsRef.doc(), notificationData);
      sentCount++;
    }
    await batch.commit();
  } else {
    // Single recipient
    const recipientRef = db.collection('students').doc(recipientId);
    const recipientSnap = await recipientRef.get();

    if (!recipientSnap.exists) {
      throw new Error('Recipient not found');
    }

    const notificationData = {
      message,
      senderId,
      recipientId,
      type: type,
      createdAt: timestamp,
      read: false
    };
    if (programId && type === 'program') {
      notificationData.programId = programId;
      notificationData.programTitle = programTitle;
    }

    await notificationsRef.add(notificationData);
    sentCount = 1;
  }

  return { success: true, count: sentCount, message: `Notification sent to ${sentCount} recipient(s)` };
}

// STUDENT MANAGEMENT FUNCTIONS
async function getAllStudents() {
  const studentsSnap = await db.collection('students').get();
  const students = [];

  for (const doc of studentsSnap.docs) {
    const studentData = doc.data();
    const uid = doc.id; // Use doc.id as the UID

    // Fetch enrollments from subcollection
    const enrollmentsSnap = await db
      .collection('students')
      .doc(uid)
      .collection('enrollments')
      .get();

    const enrollments = enrollmentsSnap.docs.map(e => ({
      id: e.id,
      ...e.data()
    }));

    students.push({
      uid,
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      email: studentData.email,
      phone: studentData.phone || '',
      enrollments
    });
  }
  return students;
}

async function getStudentById(uid) {
  const studentData = await getStudentDetails(uid);

  // Fetch enrollments from subcollection
  const enrollmentsSnap = await db
    .collection('students')
    .doc(uid)
    .collection('enrollments')
    .get();

  const enrollments = enrollmentsSnap.docs.map(e => ({
    id: e.id,
    ...e.data()
  }));

  return { ...studentData, enrollments };
}

async function updateStudentProfile(uid, updates) {
  const studentRef = db.collection('students').doc(uid);
  const studentSnap = await studentRef.get();

  if (!studentSnap.exists) {
    throw new Error('Student not found');
  }

  await studentRef.update({
    ...updates,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  return { success: true, message: 'Student profile updated successfully' };
}

// ADMIN PROFILE MANAGEMENT
async function getAdminProfile(adminId) {
  const adminRef = db.collection('users').doc(adminId);
  const adminSnap = await adminRef.get();

  if (!adminSnap.exists || adminSnap.data().role !== 'admin') {
    throw new Error('Admin profile not found or unauthorized');
  }
  return { id: adminSnap.id, ...adminSnap.data() };
}

async function updateAdminProfile(adminId, updates) {
  const adminRef = db.collection('users').doc(adminId);
  const adminSnap = await adminRef.get();

  if (!adminSnap.exists || adminSnap.data().role !== 'admin') {
    throw new Error('Admin profile not found or unauthorized');
  }

  await adminRef.update({
    ...updates,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  return { success: true, message: 'Admin profile updated successfully' };
}


module.exports = {
  getAllCourses,
  addCourse,
  updateCourse,
  deleteCourse,
  getAllPrograms,
  addProgram,
  updateProgram,
  deleteProgram,
  sendProgramNotification,
  sendGlobalNotification,
  sendIndividualNotification, // Export the new function
  getAllStudents,
  getStudentById,
  updateStudentProfile,
  getAdminProfile,
  updateAdminProfile
};