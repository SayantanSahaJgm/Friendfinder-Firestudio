import type { User, Story, Post } from './types';

export const users: User[] = [
  { id: '1', name: 'Olivia Martin', avatarUrl: 'https://picsum.photos/seed/avatar1/200/200', interests: ['hiking', 'photography', 'coffee'] },
  { id: '2', name: 'Liam Garcia', avatarUrl: 'https://picsum.photos/seed/avatar2/200/200', interests: ['music', 'concerts', 'guitar'] },
  { id: '3', name: 'Sophia Rodriguez', avatarUrl: 'https://picsum.photos/seed/avatar3/200/200', interests: ['art', 'painting', 'museums'] },
  { id: '4', name: 'Noah Smith', avatarUrl: 'https://picsum.photos/seed/avatar4/200/200', interests: ['gaming', 'esports', 'streaming'] },
  { id: '5', name: 'Ava Johnson', avatarUrl: 'https://picsum.photos/seed/avatar5/200/200', interests: ['baking', 'cooking', 'food blogging'] },
  { id: '6', name: 'Ethan Williams', avatarUrl: 'https://picsum.photos/seed/avatar6/200/200', interests: ['travel', 'backpacking', 'cultures'] },
];

export const currentUser: User = {
  id: '0',
  name: 'Alex Doe',
  avatarUrl: 'https://picsum.photos/seed/currentuser/200/200',
  bio: 'Discovering the world, one connection at a time. Tech enthusiast and avid reader.',
  interests: ['tech', 'reading', 'hiking', 'music'],
};

export const stories: Story[] = users.slice(0, 5).map(user => ({
  id: `story-${user.id}`,
  user,
}));

export const posts: Post[] = [
  {
    id: 'post-1',
    user: users[0],
    content: 'Had an amazing time hiking this weekend! The views were breathtaking. 🌲☀️ #hiking #nature',
    imageUrl: 'https://picsum.photos/seed/post1/600/400',
    likes: 128,
    commentsCount: 12,
    timestamp: '2h ago',
  },
  {
    id: 'post-2',
    user: users[1],
    content: 'Just dropped a new track on SoundCloud! Let me know what you think. 🎶 Link in bio.',
    likes: 340,
    commentsCount: 45,
    timestamp: '5h ago',
  },
  {
    id: 'post-3',
    user: users[3],
    content: 'Spent the whole weekend gaming. That new update is 🔥. Who wants to team up?',
    imageUrl: 'https://picsum.photos/seed/post2/600/400',
    likes: 512,
    commentsCount: 89,
    timestamp: '1d ago',
  },
  {
    id: 'post-4',
    user: users[2],
    content: 'Feeling inspired after a visit to the local art gallery. So much talent!',
    imageUrl: 'https://picsum.photos/seed/post3/600/400',
    likes: 210,
    commentsCount: 23,
    timestamp: '2d ago',
  },
];

export const potentialUsers: Omit<User, 'id' | 'avatarUrl' | 'bio'>[] = [
    { name: 'Ben Carter', interests: ['tech', 'AI', 'startups'] },
    { name: 'Chloe Davis', interests: ['reading', 'book clubs', 'writing'] },
    { name: 'David Evans', interests: ['hiking', 'mountaineering', 'outdoors'] },
    { name: 'Frank Green', interests: ['pop music', 'live shows'] },
    { name: 'Grace Hall', interests: ['classic rock', 'vinyl collecting'] },
];
