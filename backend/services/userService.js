const { admin, db } = require('../config/firebase-admin');

async function registerUserAndEnroll(token) {
  const pendingRef = db.collection('pending_registrations').doc(token);
  const pendingSnap = await pendingRef.get();

  if (!pendingSnap.exists) {
    throw new Error('Registration token not found');
  }

  const { customerDetails, programId } = pendingSnap.data();

  const programSnap = await db.collection('programs').doc(programId).get();
  if (!programSnap.exists) {
    throw new Error('Program not found');
  }

  const programData = programSnap.data();

  // Register user
  let userRecord;
  try {
    userRecord = await admin.auth().createUser({
      email: customerDetails.email,
      password: customerDetails.authPassword,
      displayName: `${customerDetails.firstName} ${customerDetails.lastName}`
    });
  } catch (err) {
    if (err.code === 'auth/email-already-exists') {
      userRecord = await admin.auth().getUserByEmail(customerDetails.email);
    } else {
      throw err;
    }
  }

  // Save student data in 'students' collection
  const studentRef = db.collection('students').doc(userRecord.uid);
  await studentRef.set({
    uid: userRecord.uid,
    firstname: customerDetails.firstName,
    lastname: customerDetails.lastName,
    email: customerDetails.email,
    phone: customerDetails.phone || ''
    // Add any other student-specific details here
  });

  // Register user with 'student' role in 'users' collection
  await db.collection('users').doc(userRecord.uid).set({
    email: customerDetails.email,
    role: 'student'
  });

  // Save enrollment
  await db.collection('students').doc(userRecord.uid).collection('enrollments').add({
    programId: programData.programId,
    programTitle: programData.title,
    enrollmentDate: admin.firestore.FieldValue.serverTimestamp(),
    status: 'enrolled',
  });

  // Delete pending registration
  await pendingRef.delete();

  return {
    success: true,
    uid: userRecord.uid,
    email: customerDetails.email,
    password: customerDetails.authPassword,
    programTitle: programData.title
  };
}

async function getEnrollmentsByUID(uid) {
  const enrollmentsSnapshot = await db.collection('students')
    .doc(uid)
    .collection('enrollments')
    .orderBy('enrollmentDate', 'desc')
    .get();

  const enrollmentsWithDetails = await Promise.all(enrollmentsSnapshot.docs.map(async doc => {
    const enrollmentData = doc.data();
    let programDetails = {};
    let enrolledCourses = []; // Initialize array for course details

    // Fetch Program Details
    if (enrollmentData.programId) {
      const programSnap = await db.collection('programs').doc(enrollmentData.programId).get();
      if (programSnap.exists) {
        const data = programSnap.data();
        programDetails = {
          programClassLink: data.classLink || null,
          programTitle: data.title
          // Add any other program details from the 'programs' collection you want to expose
        };

        // Fetch Courses associated with this ProgramId
        const coursesSnapshot = await db.collection('courses')
          .where('programIds', 'array-contains', enrollmentData.programId)
          .get();

        enrolledCourses = coursesSnapshot.docs.map(courseDoc => {
          const courseData = courseDoc.data();
          // Selectively include relevant course details from the course document
          return {
            courseId: courseData.courseId,
            name: courseData.name,
            description: courseData.description,
            duration: courseData.duration,
            difficulty: courseData.difficulty,
            imageUrl: courseData.imageUrl,
            classLink: courseData.classLink, // Include classLink from course
            status: courseData.status,
            // You can add more course-specific fields here if needed
          };
        });
      }
    }

    return {
      id: doc.id,
      ...enrollmentData,
      enrollmentDate: enrollmentData.enrollmentDate.toDate(), // Convert Timestamp to Date
      ...programDetails, // Merged program details
      courses: enrolledCourses // Merged associated course details
    };
  }));

  return enrollmentsWithDetails;
}

async function getStudentNotifications(userId) {
  const notificationsRef = db.collection('notifications');
  const querySnapshot = await notificationsRef
    .where('recipientId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();

  const globalNotificationsSnapshot = await notificationsRef
    .where('isGlobal', '==', true)
    .orderBy('createdAt', 'desc')
    .get();

  return [
    ...querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate()
    })),
    ...globalNotificationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate()
    }))
  ].sort((a, b) => b.createdAt - a.createdAt);
}

async function markNotificationAsRead(notificationId, userId) {
  const notificationRef = db.collection('notifications').doc(notificationId);
  const notificationSnap = await notificationRef.get();

  if (!notificationSnap.exists) {
    throw new Error('Notification not found');
  }

  const notification = notificationSnap.data();

  if ((!notification.isGlobal && notification.recipientId !== userId)) {
    throw new Error('Unauthorized to mark this notification as read');
  }

  await notificationRef.update({ read: true });
  return { success: true };
}

async function clearAllUserNotifications(userId) {
  try {
    // Get all notifications for this user
    const notificationsRef = db.collection('notifications');
    const querySnapshot = await notificationsRef
      .where('recipientId', '==', userId)
      .get();

    // Batch delete all matching notifications
    const batch = db.batch();
    querySnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    return { success: true, count: querySnapshot.size };
  } catch (err) {
    console.error('Clear notifications error:', err);
    throw err;
  }
}

module.exports = {
  registerUserAndEnroll,
  getEnrollmentsByUID,
  getStudentNotifications,
  markNotificationAsRead,
  clearAllUserNotifications
};