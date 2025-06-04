const { db } = require('../config/firebase-admin');
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
    classDuration
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
    classDuration
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

module.exports = {
  getAllCourses,
  addCourse,
  updateCourse,
  deleteCourse,
  getAllStudents
};
