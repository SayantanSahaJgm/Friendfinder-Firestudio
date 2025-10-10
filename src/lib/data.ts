import type { User, NearbyUser } from './types';

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


export const nearbyUsersData: NearbyUser[] = [
    {
        id: '1',
        username: 'Girish Kumar',
        profilePictureUrl: 'https://picsum.photos/seed/girish/200/200',
        distance: '3m',
        locationName: 'Jawahar Nagar, Bharatpur'
    },
    {
        id: '2',
        username: 'Rushi_Doiphode',
        profilePictureUrl: 'https://picsum.photos/seed/rushi/200/200',
        distance: '10m',
        locationName: 'Powai, Mumbai'
    },
    {
        id: '3',
        username: 'Mayank Lande',
        profilePictureUrl: 'https://picsum.photos/seed/mayank/200/200',
        distance: '12m',
        locationName: 'Andheri, Mumbai'
    },
    {
        id: '4',
        username: 'Uday',
        profilePictureUrl: 'https://picsum.photos/seed/Uday/200/200',
        distance: '15m',
        locationName: 'Kharagpur'
    },
     {
        id: '5',
        username: 'Roshan',
        profilePictureUrl: 'https://picsum.photos/seed/Roshan/200/200',
        distance: '25m',
        locationName: 'Midnapore'
    }
]
