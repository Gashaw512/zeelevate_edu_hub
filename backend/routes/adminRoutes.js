// routes/adminRoutes.js
const express = require('express');
const admin = require('firebase-admin');
const { db } = require('../config/firebase-admin');

const router = express.Router();

// ✅ Create Admin User (One-time use)
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

module.exports = router;
