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

  // Save student and enrollment
  const studentRef = db.collection('students').doc(userRecord.uid);
  await studentRef.set({
    uid: userRecord.uid,
    firstname: customerDetails.firstName,
    lastname: customerDetails.lastName,
    email: customerDetails.email,
    phone: customerDetails.phone || ''
    // Add any other student-specific details here
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

  // --- MODIFICATION HERE: ADDING EMAIL AND PASSWORD TO THE RETURN OBJECT ---
  return {
    success: true,
    uid: userRecord.uid, // Changed from userId to uid for consistency with Firebase
    email: customerDetails.email,
    password: customerDetails.authPassword, // Returning the password passed for auth
    programTitle: programData.title
  };
}

// Keep other functions as they were (getEnrollmentsByUID, getStudentNotifications, etc.)
async function getEnrollmentsByUID(uid) {
  const enrollmentsSnapshot = await db.collection('students')
    .doc(uid)
    .collection('enrollments')
    .orderBy('enrollmentDate', 'desc')
    .get();

  return enrollmentsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    enrollmentDate: doc.data().enrollmentDate.toDate()
  }));
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
    const notificationsRef = db.collection('notifications');
    const querySnapshot = await notificationsRef
      .where('recipientId', '==', userId)
      .get();

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