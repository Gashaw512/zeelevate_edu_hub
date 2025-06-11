const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const {
  registerUserAndEnroll,
  getEnrollmentsByUID,
  getStudentNotifications,
  markNotificationAsRead,
  clearAllUserNotifications
} = require('../services/userService');

const { admin, db } = require('../config/firebase-admin');

// POST /register-user
router.post('/register-user', async (req, res) => {
  try {
    const { token } = req.body;
    const result = await registerUserAndEnroll(token);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Register User Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /get-enrollments/:uid
router.post('/get-enrollments', async (req, res) => {
  try {
    const { uid } = req.body;
    const data = await getEnrollmentsByUID(uid);
    res.json({ enrollments: data });
  } catch (err) {
    console.error('Get Enrollments Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get notifications for current student
router.get('/notifications', authenticate, async (req, res) => {
  try {
    const notifications = await getStudentNotifications(req.user.uid);
    res.json({ success: true, notifications });
  } catch (err) {
    console.error('Get Notifications Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', authenticate, async (req, res) => {
  try {
    const result = await markNotificationAsRead(req.params.id, req.user.uid);
    res.json({ ...result, message: 'Notification marked as read' });
  } catch (err) {
    console.error('Mark Notification Read Error:', err);
    res.status(err.message.includes('Unauthorized') ? 403 : 
               err.message.includes('not found') ? 404 : 500)
      .json({ error: err.message });
  }
});

// Clear all notifications for current user
router.delete('/clear-notifications', authenticate, async (req, res) => {
  try {
    const result = await clearAllUserNotifications(req.user.uid);
    res.json({ 
      success: true, 
      message: `Cleared ${result.count} notifications` 
    });
  } catch (err) {
    console.error('Clear Notifications Error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;