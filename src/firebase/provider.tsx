
'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Auth, User } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';

// Define the shape of the context data
interface FirebaseContextValue {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
}

// Create the context
const FirebaseContext = createContext<FirebaseContextValue | undefined>(
  undefined
);

// Custom hook to access the Firebase context
export function useFirebase() {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
}

// Custom hooks for specific Firebase services
export function useFirebaseApp() {
  return useFirebase().firebaseApp;
}

export function useAuth() {
  return useFirebase().auth;
}

export function useFirestore() {
  return useFirebase().firestore;
}

/**
 * A memoization hook for Firestore references and queries.
 * This is crucial to prevent infinite re-renders when using `useDoc` or `useCollection`
 * with dynamically generated references (e.g., `doc(db, 'users', userId)`),
 * as it stabilizes the reference object between renders.
 *
 * @template T
 * @param {() => T | null} factory - A function that creates the Firestore reference or query.
 * @param {React.DependencyList} deps - Dependencies that should trigger a re-creation of the reference.
 * @returns {T | null} The memoized Firestore reference or query.
 */
export function useMemoFirebase<T>(factory: () => T | null, deps: React.DependencyList): T | null {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(factory, deps);
}


// Provider component
export function FirebaseProvider({
  children,
  firebaseApp,
  auth,
  firestore,
}: {
  children: React.ReactNode;
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
}) {

  const value = useMemo(
    () => ({
      firebaseApp,
      auth,
      firestore,
    }),
    [firebaseApp, auth, firestore]
  );

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
}
