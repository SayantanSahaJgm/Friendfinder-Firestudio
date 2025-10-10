'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ImagePlus, Send, Loader2, History, FileUp } from 'lucide-react';
import { useFirebase, useUser } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function AddPostPage() {
  const [postContent, setPostContent] = useState('');
  const [isLoading, setIsLoading] = useState<'post' | 'story' | false>(false);
  const { firestore } = useFirebase();
  const { user: currentUser } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const handlePublish = async (type: 'post' | 'story') => {
    if (!currentUser || !firestore) {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to create content.',
        variant: 'destructive',
      });
      return;
    }
    if (postContent.trim().length < 1) {
        toast({
            title: 'Empty Content',
            description: 'You cannot publish empty content.',
            variant: 'destructive',
        });
        return;
    }

    setIsLoading(type);

    const collectionName = type === 'post' ? 'posts' : 'stories';
    const targetCollection = collection(firestore, collectionName);
    
    const data = {
        text: postContent,
        userId: currentUser.uid,
        timestamp: serverTimestamp(),
        user: {
            username: currentUser.displayName || `user_${currentUser.uid.substring(0, 6)}`,
            profilePictureUrl: currentUser.photoURL || `https://picsum.photos/seed/${currentUser.uid}/200/200`
        },
        ...(type === 'post' && { likeIds: [], commentIds: [] })
    };

    try {
        await addDocumentNonBlocking(targetCollection, data);

      toast({
        title: `${type === 'post' ? 'Post' : 'Story'} Published!`,
        description: `Your ${type} is now live.`,
      });
      router.push('/');
    } catch (error) {
        console.error(`Error publishing ${type}`, error);
        toast({
            title: 'Error',
            description: `There was an error publishing your ${type}. Please try again.`,
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
          <CardTitle>Create New Content</CardTitle>
          <CardDescription>Share a permanent post or a temporary 24-hour story.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="What's on your mind?"
            className="min-h-[150px] resize-none"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            disabled={!!isLoading}
          />
          <Button variant="outline" className="w-full" disabled={!!isLoading}>
            <ImagePlus className="mr-2 h-4 w-4" /> Add Photo or Video
          </Button>
        </CardContent>
        <CardFooter className="grid grid-cols-2 gap-4">
          <Button size="lg" onClick={() => handlePublish('post')} disabled={!!isLoading}>
            {isLoading === 'post' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...
              </>
            ) : (
              <>
                <FileUp className="mr-2 h-4 w-4" /> Publish as Post
              </>
            )}
          </Button>
          <Button size="lg" variant="secondary" onClick={() => handlePublish('story')} disabled={!!isLoading}>
            {isLoading === 'story' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publishing...
              </>
            ) : (
              <>
                <History className="mr-2 h-4 w-4" /> Publish as Story
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
