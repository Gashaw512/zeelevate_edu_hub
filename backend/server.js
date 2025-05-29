require('dotenv').config();
const express = require('express');
const { Client, Environment } = require('square');
const cors = require('cors');
const crypto = require('crypto');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    clientEmail: `firebase-adminsdk-xxxx@${process.env.VITE_FIREBASE_PROJECT_ID}.iam.gserviceaccount.com`,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
  }),
  databaseURL: `https://${process.env.VITE_FIREBASE_PROJECT_ID}.firebaseio.com`
});

const db = admin.firestore();

// Initialize Express
const app = express();
app.use(cors());
app.use(express.json());

// Square client
const square = new Client({
  environment: process.env.SQUARE_ENV === 'production' ? Environment.Production : Environment.Sandbox,
  accessToken: process.env.SQUARE_ACCESS_TOKEN
});

// Create payment link
app.post('/create-payment', async (req, res) => {
  const { courseType, customerDetails, courseDetails } = req.body;

  if (!courseDetails?.price || !process.env.SQUARE_LOCATION_ID) {
    return res.status(400).json({ error: 'Missing price or Square location ID.' });
  }

  try {
    const { firstName, lastName, email, authPassword } = customerDetails || {};
    const customerName = `${firstName || ''} ${lastName || ''}`.trim();

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
        redirectUrl: `${process.env.FRONTEND_URL}/payment-success?firstname=${encodeURIComponent(firstName)}&lastname=${encodeURIComponent(lastName)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(authPassword)}&amount=${courseDetails.price}&course=${encodeURIComponent(courseDetails.title)}&courseId=${courseType}&orderId=ORDER_ID_PLACEHOLDER`,
        prePopulatedData: {
          buyerEmail: email,
          buyerFullName: customerName
        }
      },
      paymentLinkType: 'DIRECT',
      description: `Enrollment for ${courseDetails.title}`,
      metadata: {
        course_id: courseType,
        user_email: email
      }
    });

    // Replace placeholder with actual order ID
    const link = response.result.paymentLink;
    const finalRedirectUrl = `${process.env.FRONTEND_URL}/payment-success?firstname=${encodeURIComponent(firstName)}&lastname=${encodeURIComponent(lastName)}&email=${encodeURIComponent(email)}&amount=${courseDetails.price}&course=${encodeURIComponent(courseDetails.title)}&courseId=${courseType}&orderId=${link.orderId}`;

    // Update link (Square API doesn't allow editing the link after creation, so this is informational only)
    console.log('Generated link:', link.url);

    res.json({
      success: true,
      paymentUrl: link.url,
      orderId: link.orderId
    });

  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({
      error: 'Failed to create payment link',
      details: error.message
    });
  }
});

// ✅ Register user after successful payment
// server.js or routes.js
app.post('/register-user', async (req, res) => {
  try {
    const { userDetails, orderId } = req.body;

    // Optional: validate orderId with Square API if needed

    // Register user in Firebase Auth (optional if you're just storing)
    const userRecord = await admin.auth().createUser({
      email: userDetails.email,
      password: userDetails.password,
      displayName: `${userDetails.firstname} ${userDetails.lastname}`,
    });

    // Save to Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      firstname: userDetails.firstname,
      lastname: userDetails.lastname,
      email: userDetails.email,
      amount: userDetails.amount,
      course: userDetails.course,
      courseId: userDetails.courseId,
      orderId: orderId,
      createdAt: new Date()
    });

    res.json({ userId: userRecord.uid });

  } catch (error) {
    console.error('Register-user error:', error);
    res.status(500).json({ error: error.message });
  }
});


// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
