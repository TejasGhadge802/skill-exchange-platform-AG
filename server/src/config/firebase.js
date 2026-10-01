const admin = require('firebase-admin');
const config = require('./env');

let firebaseApp = null;
let auth = null;

if (config.firebase.projectId && config.firebase.clientEmail && config.firebase.privateKey) {
  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.firebase.projectId,
        clientEmail: config.firebase.clientEmail,
        privateKey: config.firebase.privateKey,
      }),
    });
    auth = admin.auth();
    console.log('[Firebase Admin] Initialized successfully with service account credentials');
  } catch (error) {
    console.warn('[Firebase Admin Warning] Initialization failed with provided credentials:', error.message);
  }
} else {
  console.warn('[Firebase Admin Info] Firebase Admin credentials not fully configured in environment. Using development/mock fallback mode.');
}

module.exports = {
  admin,
  firebaseApp,
  auth,
};

