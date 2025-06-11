const express = require('express');
const { db, admin } = require('../config/firebase-admin');
const { authenticate, requireAdmin } = require('../middlewares/authMiddleware');
const {
  sendCourseNotification,
  sendGlobalNotification
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

// List all courses (public view, no classLink)
router.get('/public/courses', async (req, res) => {
  try {
    const snapshot = await db.collection('courses').get();

    const courses = snapshot.docs.map(doc => {
      const { classLink, ...rest } = doc.data(); // Remove classLink
      return rest;
    });

    res.json({ success: true, courses });
  } catch (err) {
    console.error('Get Courses Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Public: Get a single course by title
router.post('/course-by-title', async (req, res) => {
  try {
    const { courseTitle } = req.body;

    if (!courseTitle) {
      return res.status(400).json({ error: 'courseTitle is required' });
    }

    const snapshot = await db.collection('courses')
      .where('courseTitle', '==', courseTitle)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    res.json({
      success: true,
      courseTitle: data.courseTitle,
      courseId: data.courseId
    });
  } catch (err) {
    console.error('Get Course By Title Error:', err);
    res.status(500).json({ error: err.message });
  }
});


// Protect all routes below this line
router.use(authenticate);
router.use(requireAdmin);

// List all courses
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

// Update a course
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

// Delete a course
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

// Get students and their subcollection enrollments
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

router.post('/send-notification', async (req, res) => {
  try {
    const { message, recipientId, isGlobal, courseId } = req.body;
    const senderId = req.user.uid;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (isGlobal) {
      const result = await sendGlobalNotification(message, senderId);
      return res.json({ 
        success: true, 
        message: `Global notification sent to ${result.count} students`
      });
    } else if (courseId) {
      // Existing course notification logic
      const result = await sendCourseNotification(courseId, message, senderId);
      return res.json({ 
        success: true, 
        message: `Notification sent to ${result.count} students in course`
      });
    } else if (recipientId) {
  // Handle individual notification(s)
  if (Array.isArray(recipientId)) {
        // Multiple recipients
        const batch = db.batch();
        const notificationsRef = db.collection('notifications');
        const timestamp = admin.firestore.FieldValue.serverTimestamp();

        recipientId.forEach(uid => {
          // Verify each recipient is a valid student
          batch.set(notificationsRef.doc(), {
            message,
            senderId,
            recipientId: uid,
            type: 'individual',
            createdAt: timestamp,
            read: false
          });
        });

        await batch.commit();
        return res.json({ 
          success: true, 
          message: `Notification sent to ${recipientId.length} recipients`
        });
      } else {
        // Single recipient
        // First verify the recipient exists
        const recipientRef = db.collection('students').doc(recipientId);
        const recipientSnap = await recipientRef.get();
        
        if (!recipientSnap.exists) {
          return res.status(404).json({ error: 'Recipient not found' });
        }

        await db.collection('notifications').add({
          message,
          senderId,
          recipientId,
          type: 'individual',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          read: false
        });
        return res.json({ success: true, message: 'Notification sent' });
      }
    } else {
      return res.status(400).json({ error: 'Invalid recipient specification' });
    }
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
