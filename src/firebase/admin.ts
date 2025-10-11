
import * as admin from 'firebase-admin';

// This is a global cache for the Firebase admin app instance.
// The check `!admin.apps.length` prevents re-initializing the app on hot reloads.
let firebaseAdmin: admin.app.App;

async function getFirebaseAdmin() {
  if (firebaseAdmin) {
    return firebaseAdmin;
  }

  if (admin.apps.length > 0) {
    return admin.app();
  }

  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT environment variable is not set.'
    );
  }

  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  firebaseAdmin = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  return firebaseAdmin;
}

export { getFirebaseAdmin };
