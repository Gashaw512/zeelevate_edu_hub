const express = require('express');
const { db, admin } = require('../config/firebase-admin');
const { authenticate, requireAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Optional: Keep /create-admin open during setup
router.post('/create-admin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: 'Admin User'
    });

    // Save role in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email,
      role: 'admin'
    });

    res.json({ success: true, uid: userRecord.uid, message: 'Admin created successfully' });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 🔐 Protect all routes below this line
router.use(authenticate);
router.use(requireAdmin);

/** ========== COURSE ROUTES ========== **/

// ➕ Add a course
router.post('/add-course', async (req, res) => {
  try {
    const {
      courseTitle,
      courseDetails,
      price,
      registrationDeadline,
      classStartDate,
      classLink,
      classDuration
    } = req.body;

    const courseId = crypto.randomUUID();

    await db.collection('courses').doc(courseId).set({
      courseId,
      courseTitle,
      courseDetails,
      price,
      registrationDeadline,
      classStartDate,
      classLink,
      classDuration
    });

    res.json({ success: true, courseId });
  } catch (err) {
    console.error('Add Course Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 📝 Update a course
router.put('/courses/:id', async (req, res) => {
  try {
    const courseId = req.params.id;
    const updates = req.body;

    await db.collection('courses').doc(courseId).update(updates);
    res.json({ success: true, message: 'Course updated successfully' });
  } catch (err) {
    console.error('Update Course Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ❌ Delete a course
router.delete('/courses/:id', async (req, res) => {
  try {
    const courseId = req.params.id;

    await db.collection('courses').doc(courseId).delete();
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (err) {
    console.error('Delete Course Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 📄 List all courses
router.get('/courses', async (req, res) => {
  try {
    const snapshot = await db.collection('courses').get();
    const courses = snapshot.docs.map(doc => doc.data());
    res.json({ success: true, courses });
  } catch (err) {
    console.error('Get Courses Error:', err);
    res.status(500).json({ error: err.message });
  }
});

/** ========== STUDENT ROUTES ========== **/

// 📄 Get students and their subcollection enrollments
router.get('/students', async (req, res) => {
  try {
    const studentsSnap = await db.collection('students').get();

    const students = [];

    for (const doc of studentsSnap.docs) {
      const studentData = doc.data();
      const uid = studentData.uid;

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

    res.json({ success: true, students });
  } catch (err) {
    console.error('Get Students Error:', err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
