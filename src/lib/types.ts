import type { Timestamp } from 'firebase/firestore';

export type User = {
  id: string;
  username: string;
  email: string;
  bio?: string;
  profilePictureUrl?: string;
  locationEnabled?: boolean;
  lastLogin?: Timestamp;
  interests?: string[];
  location?: {
    latitude: number;
    longitude: number;
  }
};

export type Story = {
  id: string;
  userId: string;
  text: string;
  mediaUrl?: string;
  timestamp: Timestamp;
  user: {
    username: string;
    profilePictureUrl?: string;
  }
};

export type Post = {
  id: string;
  userId: string;
  text: string;
  mediaUrl?: string;
  timestamp: Timestamp;
  likeIds: string[];
  commentIds: string[];
  user: {
    username: string;
    profilePictureUrl?: string;
  }
};

export type NearbyUser = {
    id: string;
    username: string;
    profilePictureUrl: string;
    distance: string;
    locationName: string;
}
