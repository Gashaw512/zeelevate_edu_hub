const express = require('express');
const router = express.Router();
const {
  registerUserAndEnroll,
  getEnrollmentsByUID
} = require('../services/userService');

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


module.exports = router;
