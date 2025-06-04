const square = require('../config/square-client');
const { admin, db } = require('../config/firebase-admin');
const crypto = require('crypto');

async function createPaymentLink(data) {
  const { customerDetails, courseDetails } = data;
  const token = crypto.randomUUID();

  const {
    firstName,
    lastName,
    email,
    password,
    phoneNumber // optional field
  } = customerDetails;

  const customerName = `${firstName} ${lastName}`;

  // ✅ 1. Check if email is already registered
  try {
    await admin.auth().getUserByEmail(email);
    throw new Error('Email is already registered');
  } catch (err) {
    if (err.code !== 'auth/user-not-found') {
      throw err; // Rethrow unexpected errors
    }
    // Email not found, continue
  }

  // ✅ 2. Save pending registration
  await db.collection('pending_registrations').doc(token).set({
    customerDetails: {
      firstName,
      lastName,
      email,
      authPassword: password,
      phone: phoneNumber || ''
    },
    courseId: courseDetails.courseId,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // ✅ 3. Create Square payment link
  const response = await square.checkoutApi.createPaymentLink({
    idempotencyKey: crypto.randomUUID(),
    quickPay: {
      name: courseDetails.title.substring(0, 50),
      priceMoney: {
        amount: Math.round(Number(courseDetails.price) * 100),
        currency: 'USD'
      },
      locationId: process.env.SQUARE_LOCATION_ID
    },
    checkoutOptions: {
      redirectUrl: `${process.env.FRONTEND_URL}/payment-success?token=${token}`,
      prePopulatedData: {
        buyerEmail: email,
        buyerFullName: customerName
      }
    },
    paymentLinkType: 'DIRECT',
    description: `Enrollment for ${courseDetails.title}`
  });

  return {
    paymentUrl: response.result.paymentLink.url,
    token
  };
}

module.exports = { createPaymentLink };
