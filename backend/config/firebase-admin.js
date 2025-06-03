// config/firebase-admin.js
const admin = require('firebase-admin');

const serviceAccount = {
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  clientEmail: `firebase-adminsdk-fbsvc@${process.env.VITE_FIREBASE_PROJECT_ID}.iam.gserviceaccount.com`,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.VITE_FIREBASE_PROJECT_ID}.firebaseio.com`
  });
}

// ✅ This must come after initialization
const db = admin.firestore();

module.exports = { admin, db };

