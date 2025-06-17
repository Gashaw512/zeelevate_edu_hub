const { admin, db } = require('../config/firebase-admin');
const crypto = require('crypto');

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

  await ref.delete();
}

// COURSE MANAGEMENT FUNCTIONS
async function getAllCourses() {
  const snapshot = await db.collection('courses').get();
  return snapshot.docs.map(doc => doc.data());
}

async function addCourse(courseData) {
  const {
    name, // Changed from courseTitle to name
    description, // Changed from courseDetails to description
    duration, // New field
    difficulty, // New field
    imageUrl, // New field
    classLink,
    status = 'active',
    order, // New field
    programIds // New field for associating with programs
  } = courseData;

  const id = crypto.randomUUID();

  const courseRef = db.collection('courses').doc(id);
  await courseRef.set({
    courseId: id, // Changed from courseId to id consistently
    name,
    description,
    duration: Number(duration),
    difficulty,
    imageUrl,
    classLink,
    status,
    order: Number(order),
    programIds: programIds || [], // Ensure it's an array, default to empty
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return id;
}


async function updateCourse(courseId, updatedData) {
  const ref = db.collection('courses').doc(courseId);
  const doc = await ref.get();
  if (!doc.exists) throw new Error('Course not found');

  // Ensure duration and order are numbers if present in updatedData
  if (updatedData.duration !== undefined) {
    updatedData.duration = Number(updatedData.duration);
  }
  if (updatedData.order !== undefined) {
    updatedData.order = Number(updatedData.order);
  }

  // Update `updatedAt` timestamp
  updatedData.updatedAt = admin.firestore.FieldValue.serverTimestamp();

  await ref.update(updatedData);
}

async function deleteCourse(courseId) {
  const ref = db.collection('courses').doc(courseId);
  const doc = await ref.get();
  if (!doc.exists) throw new Error('Course not found');

  await ref.delete();
}

// STUDENT MANAGEMENT FUNCTIONS
async function getAllStudents() {
  const snapshot = await db.collection('students').get();
  return snapshot.docs.map(doc => ({
    uid: doc.id,
    ...doc.data()
  }));
}

async function getStudentById(uid) {
  const studentRef = db.collection('students').doc(uid);
  const doc = await studentRef.get();
  if (!doc.exists) throw new Error('Student not found');
  return { uid: doc.id, ...doc.data() };
}

async function updateStudentProfile(uid, updatedData) {
  const studentRef = db.collection('students').doc(uid);
  const doc = await studentRef.get();
  if (!doc.exists) throw new Error('Student not found');

  await studentRef.update(updatedData);
  return { success: true, message: 'Student profile updated successfully' };
}

// ADMIN PROFILE MANAGEMENT FUNCTIONS
async function getAdminProfile(uid) {
  const adminRef = db.collection('users').doc(uid);
  const doc = await adminRef.get();
  if (!doc.exists) throw new Error('Admin not found or unauthorized');
  // Ensure the user is an admin before returning profile
  if (doc.data().role !== 'admin') {
    throw new Error('Unauthorized: User is not an admin');
  }
  return { uid: doc.id, ...doc.data() };
}

async function updateAdminProfile(uid, updatedData) {
  const adminRef = db.collection('users').doc(uid);
  const doc = await adminRef.get();
  if (!doc.exists) throw new Error('Admin not found');
  if (doc.data().role !== 'admin') { // Extra check for security
    throw new Error('Unauthorized to update this profile');
  }
  await adminRef.update(updatedData);
  return { success: true, message: 'Admin profile updated successfully' };
}

// NOTIFICATION FUNCTIONS

// Renamed from sendCourseNotification to sendProgramNotification
async function sendProgramNotification(senderId, programId, message) {
  const studentsSnapshot = await db.collection('students').get();
  const notificationsRef = db.collection('notifications');
  const timestamp = admin.firestore.FieldValue.serverTimestamp();
  const batch = db.batch();
  let notifiedStudentsCount = 0;

  // Get program data for notification
  const programSnap = await db.collection('programs').doc(programId).get();
  if (!programSnap.exists) {
    throw new Error('Program not found');
  }
  const programTitle = programSnap.data().title; // Get program title

  for (const studentDoc of studentsSnapshot.docs) {
    const studentUid = studentDoc.id;

    // Check if the student is enrolled in the specific program
    const enrollmentSnap = await db.collection('students')
      .doc(studentUid)
      .collection('enrollments')
      .where('programId', '==', programId)
      .limit(1)
      .get();

    if (!enrollmentSnap.empty) {
      batch.set(notificationsRef.doc(), {
        message,
        senderId,
        recipientId: studentUid,
        programId, // Include programId
        programTitle, // Include programTitle
        type: 'program', // Type is 'program'
        createdAt: timestamp,
        read: false,
      });
      notifiedStudentsCount++;
    }
  }

  if (notifiedStudentsCount === 0) {
    throw new Error('No students enrolled in this program');
  }

  await batch.commit();
  return {
    success: true,
    count: notifiedStudentsCount,
    programTitle, // Return program title
  };
}


async function sendGlobalNotification(senderId, message) {
  const notificationsRef = db.collection('notifications');
  const timestamp = admin.firestore.FieldValue.serverTimestamp();

  await notificationsRef.add({
    message,
    senderId,
    isGlobal: true, // Mark as global notification
    createdAt: timestamp,
    read: false,
  });

  return { success: true, message: 'Global notification sent successfully' };
}

module.exports = {
  getAllPrograms,
  addProgram,
  updateProgram,
  deleteProgram,
  getAllCourses,
  addCourse,
  updateCourse,
  deleteCourse,
  getAllStudents,
  getStudentById,
  updateStudentProfile,
  getAdminProfile,
  updateAdminProfile,
  sendProgramNotification,
  sendGlobalNotification,
};