// paymentService.js
const square = require('../config/square-client');
const { admin, db } = require('../config/firebase-admin');
const crypto = require('crypto');

async function createPaymentLink(data) {

const { customerDetails, enrollmentDetails} = data;
const { programId } = enrollmentDetails;

  const {
    firstName,
    lastName,
    email,
    password,
    phoneNumber
  } = customerDetails;

  const customerName = `${firstName} ${lastName}`;

  // ✅ 1. Check if email is already registered (no change)
  try {
    await admin.auth().getUserByEmail(email);
    throw new Error('Email is already registered');
  } catch (err) {
    if (err.code !== 'auth/user-not-found') {
      throw err;
    }
  }

  // ✅ 2. Fetch PROGRAM details from Firestore (CHANGED)
  const programDoc = await db.collection('programs').doc(programId).get();
  if (!programDoc.exists) {
    throw new Error('Program not found');
  }

  const programData = programDoc.data();
  const { title, price } = programData; // Use 'title' and 'price' from program

  if (!title || price === undefined) { // Check for price directly
    throw new Error('Program data is incomplete (title or price missing)');
  }

  // ✅ 3. Save pending registration (CHANGED to store programId)
  await db.collection('pending_registrations').doc(token).set({
    customerDetails: {
      firstName,
      lastName,
      email,
      authPassword: password,
      phone: phoneNumber || ''
    },
    programId, // Store programId instead of courseId
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // 4. Create Square payment link (CHANGED to use program title and price)
  const response = await square.checkoutApi.createPaymentLink({
    idempotencyKey: crypto.randomUUID(),
    quickPay: {
      name: title.substring(0, 50), // Use program title
      description: `Enrollment for ${title}`,
      priceMoney: {
        amount: Math.round(Number(price) * 100),
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
    }
  });

  return {
    paymentUrl: response.result.paymentLink.url,
    token
  };
}

module.exports = { createPaymentLink };