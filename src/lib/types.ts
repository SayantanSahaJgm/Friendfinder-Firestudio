export type User = {
  id: string;
  name: string;
  avatarUrl: string;
  bio?: string;
  interests: string[];
};

export type Story = {
  id: string;
  user: User;
};

export type Post = {
  id: string;
  user: User;
  content: string;
  imageUrl?: string;
  likes: number;
  commentsCount: number;
  timestamp: string;
};
