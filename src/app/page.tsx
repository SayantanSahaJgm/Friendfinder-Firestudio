'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Camera, Loader2, Plus, WifiOff, Users } from 'lucide-react';
import { PostCard } from '@/components/post-card';
import { SmartSuggestions } from '@/components/smart-suggestions';
import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, serverTimestamp, doc } from 'firebase/firestore';
import type { Post, Story } from '@/lib/types';
import { useCollection, useFirebase, useMemoFirebase, useUser } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

function Stories() {
  const { firestore } = useFirebase();
  
  const storiesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // Simplified query: Order by timestamp and get the latest 20.
    // The previous query with where() and orderBy() on the same field was invalid.
    return query(
        collection(firestore, 'stories'), 
        orderBy('timestamp', 'desc'),
        limit(20)
    );
  }, [firestore]);

  const { data: allStories, isLoading } = useCollection<Story>(storiesQuery);

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex items-center space-x-4 pb-4">
        <Link href="/add-post" className="flex-shrink-0 text-center">
            <div className="relative">
            <Avatar className="h-16 w-16 border-2 border-dashed border-muted-foreground">
                <AvatarFallback>
                    <Plus className="h-6 w-6" />
                </AvatarFallback>
            </Avatar>
            </div>
            <p className="mt-2 text-xs font-medium text-muted-foreground">Your Story</p>
        </Link>
        
        {isLoading && Array.from({length: 5}).map((_, i) => (
            <div key={i} className="flex-shrink-0 text-center animate-pulse">
                <div className="h-16 w-16 rounded-full bg-muted"></div>
                <div className="h-2 w-12 mt-2 rounded bg-muted mx-auto"></div>
            </div>
        ))}

        {!isLoading && allStories && allStories.map(story => (
            <div key={story.id} className="flex-shrink-0 text-center">
                <Avatar className="h-16 w-16 border-2 border-primary">
                    <AvatarImage src={story.user?.profilePictureUrl} />
                    <AvatarFallback>{story.user?.username?.charAt(0) ?? '?'}</AvatarFallback>
                </Avatar>
                <p className="mt-2 text-xs font-medium text-foreground truncate w-16">{story.user?.username}</p>
            </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

function Feed() {
  const { firestore } = useFirebase();
  const postsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'posts'), orderBy('timestamp', 'desc'), limit(20));
  }, [firestore]);

  const { data: posts, isLoading } = useCollection<Post>(postsQuery);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
        <div className="text-center py-16 text-muted-foreground">
            <WifiOff className="mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-semibold">No posts yet</h3>
            <p className="mt-2 text-sm">Be the first to share something!</p>
        </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

export default function Home() {
  const { auth, firestore } = useFirebase();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && !user && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [isUserLoading, user, auth]);

  // When a new user signs in, create a user document for them in Firestore.
  useEffect(() => {
    if (user && firestore) {
      const userRef = doc(firestore, 'users', user.uid);
      setDocumentNonBlocking(userRef, {
        email: user.email || '',
        username: user.displayName || `user_${user.uid.substring(0, 6)}`,
        id: user.uid,
        profilePictureUrl: user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`,
        bio: 'Just joined Proximity!',
        lastLogin: serverTimestamp(),
        locationEnabled: false,
        interests: [],
      }, { merge: true });
    }
  }, [user, firestore]);

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="space-y-8">
        <section aria-labelledby="stories-heading">
          <h2 id="stories-heading" className="text-lg font-semibold tracking-tight">
            Stories
          </h2>
          <Stories />
        </section>

        <section aria-labelledby="create-post-heading">
          <h2 id="create-post-heading" className="sr-only">
            Create a new post
          </h2>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <Link href="/profile">
                  <Avatar>
                    <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? 'User'} />
                    <AvatarFallback>{user?.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
                  </Avatar>
                </Link>
                <Input placeholder="What's on your mind?" className="flex-1 bg-muted" />
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/add-post">
                    <Camera className="h-5 w-5 text-muted-foreground" />
                    <span className="sr-only">Add Post</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* <SmartSuggestions /> */}

        <section aria-labelledby="feed-heading">
          <h2 id="feed-heading" className="sr-only">
            Feed
          </h2>
          <Feed />
        </section>
      </div>
    </div>
  );
}
