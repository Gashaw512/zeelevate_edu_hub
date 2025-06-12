const { admin, db } = require('../config/firebase-admin');
const crypto = require('crypto');

async function getAllCourses() {
  const snapshot = await db.collection('courses').get();
  return snapshot.docs.map(doc => doc.data());
}

async function addCourse(courseData) {
  const {
    courseTitle,
    courseDetails,
    price,
    registrationDeadline,
    classStartDate,
    classLink,
    classDuration,
    status = 'active' // default to 'active' if not provided
  } = courseData;

  const id = crypto.randomUUID();

  const courseRef = db.collection('courses').doc(id);
  await courseRef.set({
    courseId: id,
    courseTitle,
    courseDetails,
    price,
    registrationDeadline,
    classStartDate,
    classLink,
    classDuration,
    status
  });

  return id;
}


async function updateCourse(courseId, updatedData) {
  const ref = db.collection('courses').doc(courseId);
  const doc = await ref.get();
  if (!doc.exists) throw new Error('Course not found');

  await ref.update(updatedData);
}

async function deleteCourse(courseId) {
  const ref = db.collection('courses').doc(courseId);
  const doc = await ref.get();
  if (!doc.exists) throw new Error('Course not found');

  await ref.delete();
}

async function getAllStudents() {
  const snapshot = await db.collection('enrollments').get();
  return snapshot.docs.map(doc => doc.data());
}

// Get students enrolled in a specific course

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

// Fallback method for when collectionGroup query fails
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
  getAllCourses,
  addCourse,
  updateCourse,
  deleteCourse,
  getAllStudents,
  getStudentsByCourse,
  sendCourseNotification,
  sendGlobalNotification,
  fallbackCourseNotification
};