const express = require('express');
const router = express.Router();
const { createPaymentLink, addCourse } = require('../services/paymentService');

router.post('/create-payment', async (req, res) => {
  try {
    const result = await createPaymentLink(req.body);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Create Payment Error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/add-course', async (req, res) => {
  try {
    const courseId = await addCourse(req.body);
    res.json({ success: true, courseId });
  } catch (err) {
    console.error('Add Course Error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
