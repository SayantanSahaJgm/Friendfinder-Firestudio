'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ImagePlus, Send, Loader2 } from 'lucide-react';
import { useAuth, useFirebase, useUser } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';

export default function AddPostPage() {
  const [postContent, setPostContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { firestore } = useFirebase();
  const { user: currentUser } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const handlePublish = async () => {
    if (!currentUser || !firestore) {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to create a post.',
        variant: 'destructive',
      });
      return;
    }
    if (postContent.trim().length < 1) {
        toast({
            title: 'Empty Post',
            description: 'You cannot publish an empty post.',
            variant: 'destructive',
        });
        return;
    }

    setIsLoading(true);

    const postsCollection = collection(firestore, `posts`);
    
    try {
        await addDocumentNonBlocking(postsCollection, {
        text: postContent,
        userId: currentUser.uid,
        timestamp: serverTimestamp(),
        likeIds: [],
        commentIds: [],
        user: {
            username: currentUser.displayName || `user_${currentUser.uid.substring(0, 6)}`,
            profilePictureUrl: currentUser.photoURL || `https://picsum.photos/seed/${currentUser.uid}/200/200`
        }
      });

      toast({
        title: 'Post Published!',
        description: 'Your post is now live.',
      });
      router.push('/');
    } catch (error) {
        console.error("Error publishing post", error);
        toast({
            title: 'Error',
            description: 'There was an error publishing your post. Please try again.',
            variant: 'destructive',
          });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create a New Post</CardTitle>
          <CardDescription>Share what's on your mind with your friends.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Start writing your post here..."
            className="min-h-[150px] resize-none"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            disabled={isLoading}
          />
          <Button variant="outline" className="w-full" disabled={isLoading}>
            <ImagePlus className="mr-2 h-4 w-4" /> Add Photo or Video
          </Button>
        </CardContent>
        <CardFooter>
          <Button className="w-full" size="lg" onClick={handlePublish} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" /> Publish Post
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
