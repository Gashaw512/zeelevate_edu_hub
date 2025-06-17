const express = require("express");
const router = express.Router();
const { createPaymentLink } = require("../services/paymentService");

router.post("/create-payment", async (req, res) => {
  try {
    const { customerDetails, enrollmentDetails } = req.body;
    if (
      !customerDetails ||
      !enrollmentDetails ||
      !enrollmentDetails.programId
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing customerDetails or programId in enrollmentDetails",
      });
    }

    const result = await createPaymentLink(req.body);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error("Create Payment Error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
