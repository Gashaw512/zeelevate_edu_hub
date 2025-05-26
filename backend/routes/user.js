// Register User After Payment
const express = require("express");
const router = express.Router();
const admin = require("../config/firebaseAdmin");

router.post("/register-user", async (req, res) => {
  const { uid, email, name, phone } = req.body;

  try {
    await admin.auth().createUser({
      uid,
      email,
      displayName: name,
      phoneNumber: phone,
    });

    await admin.firestore().collection("users").doc(uid).set({
      email,
      name,
      phone,
      createdAt: new Date(),
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Registration failed:", err.message);
    res.status(500).json({ error: "Registration failed" });
  }
});

module.exports = router;