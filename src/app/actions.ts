'use server';

import { suggestRelevantConnections } from '@/ai/flows/suggest-relevant-connections';
import { potentialUsers } from '@/lib/data';
import { getFirebaseAdmin } from '@/firebase/admin';
import { cookies } from 'next/headers';
import {DecodedIdToken} from 'firebase-admin/auth';
import { firestore } from 'firebase-admin';

async function getCurrentUser(): Promise<DecodedIdToken> {
    const cookieStore = cookies();
    const session = cookieStore.get('__session')?.value || '';
    if (!session) {
      throw new Error("User not authenticated");
    }
    const admin = await getFirebaseAdmin();
    return admin.auth().verifySessionCookie(session, true);
}


export async function addFriend(targetUserId: string) {
    const user = await getCurrentUser();
    if (user.uid === targetUserId) {
        throw new Error("Cannot add yourself as a friend.");
    }

    const admin = await getFirebaseAdmin();
    const db = admin.firestore();

    const requestRef = db.collection('friendRequests').doc(`${user.uid}_${targetUserId}`);
    const existingRequest = await requestRef.get();

    if (existingRequest.exists) {
        throw new Error("Friend request already sent.");
    }

    await requestRef.set({
        from: user.uid,
        to: targetUserId,
        status: 'pending',
        createdAt: firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
}


export async function getSuggestions() {
  try {
    const suggestions = await suggestRelevantConnections({
      userProfile: {
        interests: [], // This should be replaced with the current user's interests from Firestore
        pastConnections: [],
      },
      potentialConnections: potentialUsers.map(u => ({ username: u.name, interests: u.interests })),
    });
    return suggestions;
  } catch (error) {
    console.error("Error calling GenAI flow:", error);
    // In a real app, you'd want more robust error handling.
    // For this scaffold, we'll return an empty array on failure.
    return { suggestedConnections: [] };
  }
}
