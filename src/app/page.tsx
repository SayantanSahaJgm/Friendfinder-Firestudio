'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Camera, Loader2, Plus, WifiOff } from 'lucide-react';
import { PostCard } from '@/components/post-card';
import { SmartSuggestions } from '@/components/smart-suggestions';
import { useAuth, useCollection, useFirebase, useUser, useMemoFirebase } from '@/firebase';
import { useEffect, useMemo, useState } from 'react';
import { collection, query, orderBy, getDocs, limit, serverTimestamp, doc } from 'firebase/firestore';
import type { Post } from '@/lib/types';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';


function Stories() {
  // This is a placeholder for story functionality.
  // In a real app, you would fetch stories from Firestore.
  return (
    <div className="flex items-center space-x-4 overflow-x-auto pb-4">
      <div className="flex-shrink-0 text-center">
        <div className="relative">
          <Avatar className="h-16 w-16 border-2 border-dashed border-muted-foreground">
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <Button size="icon" className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 text-xs font-medium text-muted-foreground">Your Story</p>
      </div>
    </div>
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
  const { auth, firestore, isUserLoading } = useFirebase();
  const { user } = useUser();

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
          <h2 id="stories-heading" className="sr-only">
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
                <Link href="/add-post" passHref>
                  <Button variant="ghost" size="icon" asChild>
                    <a>
                      <Camera className="h-5 w-5 text-muted-foreground" />
                    </a>
                  </Button>
                </Link>
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
