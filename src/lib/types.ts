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
};

export type Story = {
  id: string;
  userId: string;
  mediaUrl: string;
  timestamp: Timestamp;
};

export type Post = {
  id: string;
  userId: string;
  text: string;
  mediaUrl?: string;
  timestamp: Timestamp;
  likeIds: string[];
  commentIds: string[];
};
