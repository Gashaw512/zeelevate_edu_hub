const express = require('express');
const { db, admin } = require('../config/firebase-admin');
const { authenticate, requireAdmin } = require('../middlewares/authMiddleware');
const {
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
  sendIndividualNotification, // Import the new service function
  getStudentById,
  getAllStudents,
  updateStudentProfile,
  getAdminProfile,
  updateAdminProfile
} = require('../services/adminService');

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

// Public: Get all programs
router.get('/public/programs', async (req, res) => {
  try {
    const programs = await getAllPrograms(); // Use the service function
    res.json({ success: true, programs });
  } catch (err) {
    console.error('Get Public Programs Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Public: Get a single program by title
router.post('/public/program-by-title', async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Program title is required' });
    }

    const snapshot = await db.collection('programs')
      .where('title', '==', title)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Program not found' });
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    res.json({
      success: true,
      programId: doc.id, // Use doc.id for the programId
      title: data.title,
      price: data.price,
      badge: data.badge,
      status: data.status,
      classStartDate: data.classStartDate,
      registrationDeadline: data.registrationDeadline,
      order: data.order,
      features: data.features
      // Omit sensitive data if any
    });
  } catch (err) {
    console.error('Get Program By Title Error:', err);
    res.status(500).json({ error: err.message });
  }
});


// Public: Get all courses (without classLink)
router.get('/public/courses', async (req, res) => {
  try {
    const snapshot = await db.collection('courses').get();

    const courses = snapshot.docs.map(doc => {
      const { classLink, ...rest } = doc.data(); // Remove classLink
      return rest;
    });

    res.json({ success: true, courses });
  } catch (err) {
    console.error('Get Public Courses Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Public: Get courses by Program ID (without classLink)
router.get('/public/programs/:programId/courses', async (req, res) => {
  try {
    const { programId } = req.params;

    const snapshot = await db.collection('courses')
      .where('programIds', 'array-contains', programId)
      .get();

    const courses = snapshot.docs.map(doc => {
      const { classLink, ...rest } = doc.data(); // Remove classLink
      return rest;
    });

    res.json({ success: true, courses });
  } catch (err) {
    console.error('Get Public Courses by Program ID Error:', err);
    res.status(500).json({ error: err.message });
  }
});


// Protect all routes below this line
router.use(authenticate);
router.use(requireAdmin);

// Admin: Program Management Routes
// Get all programs
router.get('/programs', async (req, res) => {
  try {
    const programs = await getAllPrograms();
    res.json({ success: true, programs });
  } catch (err) {
    console.error('Admin Get Programs Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add a program
router.post('/add-program', async (req, res) => {
  try {
    const programId = await addProgram(req.body);
    res.json({ success: true, programId });
  } catch (err) {
    console.error('Admin Add Program Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update a program
router.put('/programs/:id', async (req, res) => {
  try {
    const programId = req.params.id;
    const updates = req.body;
    await updateProgram(programId, updates);
    res.json({ success: true, message: 'Program updated successfully' });
  } catch (err) {
    console.error('Admin Update Program Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a program
router.delete('/programs/:id', async (req, res) => {
  try {
    const programId = req.params.id;
    await deleteProgram(programId);
    res.json({ success: true, message: 'Program deleted successfully' });
  } catch (err) {
    console.error('Admin Delete Program Error:', err);
    res.status(500).json({ error: err.message });
  }
});


// Admin: Course Management Routes
router.get('/courses', async (req, res) => {
  try {
    const courses = await getAllCourses(); // Use the service function
    res.json({ success: true, courses });
  } catch (err) {
    console.error('Admin Get Courses Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add a course
router.post('/add-course', async (req, res) => {
  try {
    // The service layer handles ID generation and program name fetching
    const courseId = await addCourse(req.body);
    res.json({ success: true, courseId });
  } catch (err) {
    console.error('Admin Add Course Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update a course
router.put('/courses/:id', async (req, res) => {
  try {
    const courseId = req.params.id;
    const updates = req.body;
    await updateCourse(courseId, updates); // Use the service function
    res.json({ success: true, message: 'Course updated successfully' });
  } catch (err) {
    console.error('Admin Update Course Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a course
router.delete('/courses/:id', async (req, res) => {
  try {
    const courseId = req.params.id;
    await deleteCourse(courseId); // Use the service function
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (err) {
    console.error('Admin Delete Course Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Existing student and notification routes (no changes needed for logic)
// Get students and their subcollection enrollments
router.get('/students', async (req, res) => {
  try {
    const students = await getAllStudents();
    res.json({ success: true, students });
  } catch (err) {
    console.error('Get Students Error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/students/:uid', async (req, res) => {
  try {
    const student = await getStudentById(req.params.uid);
    res.json(student);
  } catch (err) {
    console.error('Get student by ID error:', err);
    res.status(err.message.includes('not found') ? 404 : 500).json({ error: err.message });
  }
});

router.put('/students/:uid/profile', async (req, res) => {
  try {
    const result = await updateStudentProfile(req.params.uid, req.body);
    res.json(result);
  } catch (err) {
    console.error('Update student profile error:', err);
    res.status(err.message.includes('not found') ? 404 : 500).json({ error: err.message });
  }
});

// ADMIN PROFILE ROUTES
router.get('/profile', async (req, res) => {
  try {
    const adminProfile = await getAdminProfile(req.user.uid);
    res.json(adminProfile);
  } catch (err) {
    console.error('Get admin profile error:', err);
    res.status(err.message.includes('not found') || err.message.includes('unauthorized') ? 404 : 500).json({ error: err.message });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const result = await updateAdminProfile(req.user.uid, req.body);
    res.json(result);
  } catch (err) {
    console.error('Update admin profile error:', err);
    res.status(err.message.includes('not found') || err.message.includes('unauthorized') ? 404 : 500).json({ error: err.message });
  }
});

// REVERTED NOTIFICATION ROUTE
router.post('/send-notification', async (req, res) => {
  try {
    const { message, isGlobal, programId, recipientId } = req.body;
    const senderId = req.user.uid;

    if (!message) {
      return res.status(400).json({ error: 'Notification message is required' });
    }

    let result;
    if (isGlobal) {
      // Global notification
      result = await sendGlobalNotification(senderId, message);
    } else if (programId) {
      // Program-specific notification (formerly course)
      result = await sendProgramNotification(senderId, programId, message);
    } else if (recipientId) {
      // Individual notification (can be single or array of UIDs)
      result = await sendIndividualNotification(senderId, recipientId, message, programId, 'individual'); // programId might be present for contextual individual notifications
    } else {
      return res.status(400).json({ error: 'Invalid notification type. Specify isGlobal, programId, or recipientId.' });
    }

    res.json(result);
  } catch (err) {
    console.error('Send Notification Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all sent notifications (for admin dashboard)
router.get('/sent-notifications', async (req, res) => {
  try {
    const snapshot = await db.collection('notifications')
      .where('senderId', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .get();

    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate() // Convert Firestore timestamp to JS Date
    }));

    res.json({ success: true, notifications });
  } catch (err) {
    console.error('Get Sent Notifications Error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;