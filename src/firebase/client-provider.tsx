
'use client';

import React, { useMemo } from 'react';
import { FirebaseProvider } from './provider';
import { getFirebase } from './client';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { firebaseApp, auth, firestore } = useMemo(() => getFirebase(), []);

  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      auth={auth}
      firestore={firestore}
    >
        <FirebaseErrorListener />
        {children}
    </FirebaseProvider>
  );
}
