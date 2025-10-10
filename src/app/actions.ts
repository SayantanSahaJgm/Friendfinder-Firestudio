'use server';

import { suggestRelevantConnections } from '@/ai/flows/suggest-relevant-connections';
import { currentUser, potentialUsers } from '@/lib/data';

export async function getSuggestions() {
  try {
    const suggestions = await suggestRelevantConnections({
      userProfile: {
        interests: currentUser.interests,
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
