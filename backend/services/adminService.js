const { admin, db } = require('../config/firebase-admin');
const crypto = require('crypto');

// PROGRAM MANAGEMENT FUNCTIONS
async function getAllPrograms() {
  const snapshot = await db.collection('programs').get();
  return snapshot.docs.map(doc => doc.data());
}

async function addProgram(programData) {
  const {
    title,
    price,
    badge,
    status = 'available', // default status
    classStartDate,
    registrationDeadline,
    order,
    features
  } = programData;

  const id = crypto.randomUUID();

  const programRef = db.collection('programs').doc(id);
  await programRef.set({
    programId: id,
    title,
    price: Number(price), // Ensure price is stored as a number
    badge,
    status,
    classStartDate,
    registrationDeadline,
    order: Number(order), // Ensure order is stored as a number
    features,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return id;
}

async function updateProgram(programId, updatedData) {
  const ref = db.collection('programs').doc(programId);
  const doc = await ref.get();
  if (!doc.exists) throw new Error('Program not found');

  // Convert price and order to numbers if they exist in updatedData
  if (updatedData.price !== undefined) {
    updatedData.price = Number(updatedData.price);
  }
  if (updatedData.order !== undefined) {
    updatedData.order = Number(updatedData.order);
  }

  await ref.update(updatedData);
}

async function deleteProgram(programId) {
  const ref = db.collection('programs').doc(programId);
  const doc = await ref.get();
  if (!doc.exists) throw new Error('Program not found');

  // Optional: Add logic to check if any courses are associated with this program
  // For now, directly delete the program
  await ref.delete();
}

// COURSE MANAGEMENT FUNCTIONS (MODIFIED)
async function getAllCourses() {
  const snapshot = await db.collection('courses').get();
  return snapshot.docs.map(doc => doc.data());
}

async function addCourse(courseData) {
  const {
    name, // Changed from courseTitle
    description, // Changed from courseDetails
    duration, // New field
    difficulty, // New field
    imageUrl, // New field
    classLink,
    status = 'active', // default to 'active' if not provided
    order, // New field
    programIds = [], // New field, array of program IDs
  } = courseData;

  // Fetch program names for the provided programIds
  const programNames = [];
  if (programIds.length > 0) {
    const programsSnapshot = await db.collection('programs')
      .where(admin.firestore.FieldPath.documentId(), 'in', programIds)
      .get();
    
    programsSnapshot.docs.forEach(doc => {
      programNames.push(doc.data().title);
    });
  }

  const id = crypto.randomUUID();

  const courseRef = db.collection('courses').doc(id);
  await courseRef.set({
    courseId: id,
    name,
    description,
    duration: Number(duration),
    difficulty,
    imageUrl,
    classLink,
    status,
    order: Number(order),
    programIds,
    programNames, // Store program names for easier querying/display
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return id;
}


async function updateCourse(courseId, updatedData) {
  const ref = db.collection('courses').doc(courseId);
  const doc = await ref.get();
  if (!doc.exists) throw new Error('Course not found');

  // If programIds are being updated, re-fetch program names
  if (updatedData.programIds && Array.isArray(updatedData.programIds)) {
    const programNames = [];
    if (updatedData.programIds.length > 0) {
      const programsSnapshot = await db.collection('programs')
        .where(admin.firestore.FieldPath.documentId(), 'in', updatedData.programIds)
        .get();
      programsSnapshot.docs.forEach(programDoc => {
        programNames.push(programDoc.data().title);
      });
    }
    updatedData.programNames = programNames;
  }

  // Ensure duration and order are stored as numbers if updated
  if (updatedData.duration !== undefined) {
    updatedData.duration = Number(updatedData.duration);
  }
  if (updatedData.order !== undefined) {
    updatedData.order = Number(updatedData.order);
  }

  updatedData.updatedAt = admin.firestore.FieldValue.serverTimestamp(); // Update timestamp

  await ref.update(updatedData);
}

async function deleteCourse(courseId) {
  const ref = db.collection('courses').doc(courseId);
  const doc = await ref.get();
  if (!doc.exists) throw new Error('Course not found');

  await ref.delete();
}

// Existing student and notification functions (no changes needed based on new requirements)
async function getAllStudents() {
  const snapshot = await db.collection('enrollments').get();
  return snapshot.docs.map(doc => doc.data());
}

async function getStudentsByCourse(courseId) {
  const enrollmentsSnapshot = await db.collectionGroup('enrollments')
    .where('course_id', '==', courseId)
    .get();
  
  const studentIds = [...new Set(enrollmentsSnapshot.docs.map(doc => doc.ref.parent.parent.id))];
  
  if (studentIds.length === 0) return [];
  
  const studentsSnapshot = await db.collection('students')
    .where(admin.firestore.FieldPath.documentId(), 'in', studentIds)
    .get();
  
  return studentsSnapshot.docs.map(doc => ({
    uid: doc.id,
    ...doc.data()
  }));
}

async function sendGlobalNotification(message, senderId) {
  try {
    // Get all student IDs
    const studentsSnapshot = await db.collection('students').get();
    const studentIds = studentsSnapshot.docs.map(doc => doc.id);

    if (studentIds.length === 0) {
      throw new Error('No students found in the system');
    }

    // Batch write notifications
    const batch = db.batch();
    const notificationsRef = db.collection('notifications');
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    studentIds.forEach(studentId => {
      batch.set(notificationsRef.doc(), {
        message,
        senderId,
        recipientId: studentId,
        type: 'global',
        createdAt: timestamp,
        read: false
      });
    });

    await batch.commit();
    return { success: true, count: studentIds.length };
  } catch (err) {
    console.error('Global notification error:', err);
    throw err;
  }
}
async function sendCourseNotification(courseId, message, senderId) {
  try {
    // Verify course exists
    const courseRef = db.collection('courses').doc(courseId);
    const courseSnap = await courseRef.get();
    
    if (!courseSnap.exists) {
      throw new Error('Course not found');
    }

    // Get all students with enrollments in this course
    const enrollmentsQuery = db.collectionGroup('enrollments')
      .where('course_id', '==', courseId);

    const enrolledStudents = new Set();
    const batch = db.batch();
    const notificationsRef = db.collection('notifications');
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    // Process in batches to avoid memory issues
    let querySnapshot = await enrollmentsQuery.get();
    
    querySnapshot.forEach(doc => {
      const studentId = doc.ref.parent.parent.id;
      enrolledStudents.add(studentId);
      
      // Add notification for each student
      batch.set(notificationsRef.doc(), {
        message,
        senderId,
        recipientId: studentId,
        courseId,
        type: 'course',
        createdAt: timestamp,
        read: false,
        courseTitle: courseSnap.data().courseTitle // Include course title for reference
      });
    });

    if (enrolledStudents.size === 0) {
      throw new Error('No students enrolled in this course');
    }

    await batch.commit();
    return { 
      success: true, 
      count: enrolledStudents.size,
      courseTitle: courseSnap.data().courseTitle
    };
  } catch (err) {
    console.error('Course notification error:', err);
    
    // Fallback method if collectionGroup query fails
    if (err.code === 9 || err.message.includes('FAILED_PRECONDITION')) {
      return await fallbackCourseNotification(courseId, message, senderId);
    }
    throw err;
  }
}

async function fallbackCourseNotification(courseId, message, senderId) {
  const studentsSnapshot = await db.collection('students').get();
  const enrolledStudents = [];
  const batch = db.batch();
  const notificationsRef = db.collection('notifications');
  const timestamp = admin.firestore.FieldValue.serverTimestamp();

  // Get course data for notification
  const courseSnap = await db.collection('courses').doc(courseId).get();
  if (!courseSnap.exists) {
    throw new Error('Course not found');
  }

  // Check each student's enrollments
  for (const studentDoc of studentsSnapshot.docs) {
    const enrollmentSnap = await db.collection('students')
      .doc(studentDoc.id)
      .collection('enrollments')
      .where('course_id', '==', courseId)
      .limit(1)
      .get();
    
    if (!enrollmentSnap.empty) {
      enrolledStudents.push(studentDoc.id);
      
      batch.set(notificationsRef.doc(), {
        message,
        senderId,
        recipientId: studentDoc.id,
        courseId,
        type: 'course',
        createdAt: timestamp,
        read: false,
        courseTitle: courseSnap.data().courseTitle
      });
    }
  }

  if (enrolledStudents.length === 0) {
    throw new Error('No students enrolled in this course');
  }

  await batch.commit();
  return { 
    success: true, 
    count: enrolledStudents.length,
    courseTitle: courseSnap.data().courseTitle,
    usedFallback: true
  };
}


module.exports = {
  // Programs
  getAllPrograms,
  addProgram,
  updateProgram,
  deleteProgram,
  // Courses
  getAllCourses,
  addCourse,
  updateCourse,
  deleteCourse,
  // Students and Notifications
  getAllStudents,
  getStudentsByCourse,
  sendCourseNotification,
  sendGlobalNotification,
  fallbackCourseNotification
};