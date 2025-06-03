const { admin, db } = require('../config/firebase-admin');

async function registerUserAndEnroll(token) {
  const pendingRef = db.collection('pending_registrations').doc(token);
  const pendingSnap = await pendingRef.get();

  if (!pendingSnap.exists) throw new Error('Registration token not found');
  const { customerDetails, courseId } = pendingSnap.data();

  // ✅ Use actual courseId to fetch course
  const courseSnap = await db.collection('courses').doc(courseId).get();
  if (!courseSnap.exists) throw new Error('Course not found');

  const courseData = courseSnap.data();

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
    phone_number: customerDetails.phone || '',
    registration_date: new Date()
  });

  // Calculate expiry = classStartDate + classDuration
  const startDate = new Date(courseData.classStartDate);
  const expiry = new Date(startDate);
  expiry.setDate(startDate.getDate() + parseInt(courseData.classDuration));

  await studentRef.collection('enrollments').add({
    course_id: courseId,
    course_title: courseData.courseTitle,
    courseDetails: courseData.courseDetails,
    classLink: courseData.classLink,
    classStartDate: courseData.classStartDate,
    classDuration: courseData.classDuration,
    expiry
  });

  await db.collection('users').doc(userRecord.uid).set({
    email: customerDetails.email,
    role: 'student'
  });

  await pendingRef.delete();

  return {
    uid: userRecord.uid,
    email: customerDetails.email,
    password: customerDetails.authPassword
  };
}

async function getEnrollmentsByUID(uid) {
  const snapshot = await db.collection('students').doc(uid).collection('enrollments').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

module.exports = { registerUserAndEnroll, getEnrollmentsByUID };
