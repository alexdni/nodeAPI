const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK
let firebaseApp;

try {
  // Check if running in Vercel environment
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    // Decode base64 service account for Vercel deployment
    const serviceAccount = JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8')
    );
    
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
    // Use individual environment variables
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL
    };
    
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
  } else {
    console.error('Firebase configuration not found. Please set up environment variables.');
    process.exit(1);
  }
  
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  process.exit(1);
}

// Export Firebase services
const auth = admin.auth();
const db = admin.firestore();

module.exports = {
  admin,
  auth,
  db,
  firebaseApp
}; 