
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

// This is a global cache for the Firebase client app instance.
// The `getApps().length` check prevents re-initializing the app on hot reloads.
let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

function getFirebase() {
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApp();
  }
  auth = getAuth(firebaseApp);
  firestore = getFirestore(firebaseApp);
  return { firebaseApp, auth, firestore };
}

export { getFirebase };
