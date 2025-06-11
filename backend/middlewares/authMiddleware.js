const { admin, db } = require('../config/firebase-admin');

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;

    // Get user role from Firestore
    const userDoc = await db.collection('users').doc(decoded.uid).get();
    if (!userDoc.exists) {
      return res.status(403).json({ error: 'User record not found' });
    }
    
    // Add role to the request user object
    req.user.role = userDoc.data().role;
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    res.status(403).json({ error: 'Invalid token' });
  }
}

async function requireAdmin(req, res, next) {
  if (!req.user?.uid) return res.status(401).json({ error: 'Unauthorized' });

  // Now we can just check the role that was already added in authenticate
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
}

module.exports = { authenticate, requireAdmin };