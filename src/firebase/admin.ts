'use server';
import { initializeApp, getApps, getApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

let app: App;

export async function getFirebaseAdmin() {
  if (!getApps().length) {
    app = initializeApp({
        projectId: firebaseConfig.projectId,
    });
  } else {
    app = getApp();
  }

  const auth = getAuth(app);
  const firestore = getFirestore(app);

  return { app, auth, firestore };
}
