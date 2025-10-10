// This file is now mostly deprecated. Data is fetched from Firestore.
// The `potentialUsers` array is kept for the AI suggestion feature demo,
// but in a real application, this would also come from your backend.

export const potentialUsers: { name: string, interests: string[] }[] = [
    { name: 'Ben Carter', interests: ['tech', 'AI', 'startups'] },
    { name: 'Chloe Davis', interests: ['reading', 'book clubs', 'writing'] },
    { name: 'David Evans', interests: ['hiking', 'mountaineering', 'outdoors'] },
    { name: 'Frank Green', interests: ['pop music', 'live shows'] },
    { name: 'Grace Hall', interests: ['classic rock', 'vinyl collecting'] },
];
