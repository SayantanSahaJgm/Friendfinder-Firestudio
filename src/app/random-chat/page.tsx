'use client';

import { useEffect, useRef, useState } from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Mic,
  Send,
  SkipForward,
  Video,
  VideoOff,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type ChatMode = 'video' | 'text' | 'audio';
type ConnectionStatus = 'idle' | 'searching' | 'connected';

export default function RandomChatPage() {
  const [mode, setMode] = useState<ChatMode>('video');
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | undefined
  >(undefined);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (mode === 'video' || mode === 'audio') {
      const getCameraPermission = async () => {
        try {
          // Request both video and audio
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          setHasCameraPermission(true);

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera/mic:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Media Access Denied',
            description:
              'Please enable camera and microphone permissions in your browser settings.',
          });
        }
      };

      getCameraPermission();

      // Cleanup function to stop media tracks when component unmounts or mode changes
      return () => {
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach((track) => track.stop());
        }
      };
    }
  }, [mode, toast]);

  const handleStartSearching = () => {
    if ((mode === 'video' || mode === 'audio') && !hasCameraPermission) {
      toast({
        variant: 'destructive',
        title: 'Permissions Required',
        description: 'Camera and microphone access is needed to start.',
      });
      return;
    }
    setStatus('searching');
    // In a real app, this would initiate a connection to a signaling server.
    // For now, we'll just simulate a search.
    setTimeout(() => {
        if(mode === 'text') {
            toast({
                title: "No user found",
                description: "Connecting you with an AI bot."
            })
        }
        setStatus('connected');
    }, 3000);
  };

  const handleSkip = () => {
    setStatus('idle');
    // Here you would signal to disconnect and find a new partner.
    toast({
        title: 'Skipped!',
        description: "Searching for a new chat partner."
    });
    handleStartSearching();
  };

  const renderContent = () => {
    if (status === 'searching') {
      return (
        <div className="flex h-full flex-col items-center justify-center text-center">
          <Loader2 className="mb-4 h-16 w-16 animate-spin text-primary" />
          <h3 className="text-2xl font-bold">Finding a partner...</h3>
          <p className="mt-2 text-muted-foreground">
            Please wait while we connect you with someone.
          </p>
        </div>
      );
    }
    
    if (mode === 'video' || mode === 'audio') {
      return (
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full aspect-video rounded-md bg-muted object-cover"
            autoPlay
            muted // Mute our own video to prevent feedback
          />
          {mode === 'audio' && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white">
                <Mic className="h-16 w-16" />
                <p className="mt-4 text-lg">Audio Chat in Progress</p>
             </div>
          )}
          {hasCameraPermission === false && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
                <VideoOff className="h-16 w-16 text-destructive" />
                <p className="mt-4 text-center text-white">
                    Camera access is disabled.
                </p>
             </div>
          )}
        </div>
      );
    }

    // Text chat UI
    return (
        <div className="space-y-4">
            <div className="h-64 overflow-y-auto rounded-md border p-4 bg-muted/50">
                {/* AI greeting */}
                <div className="flex items-end gap-2">
                    <div className="rounded-lg bg-primary px-3 py-2 text-primary-foreground">
                        <p className="text-sm">Hello! I'm an AI assistant. What would you like to talk about?</p>
                    </div>
                </div>
            </div>
             <div className="flex w-full items-center space-x-2">
                <Input type="text" placeholder="Say something nice..." />
                <Button type="submit">
                    <Send className="h-4 w-4"/>
                    <span className="sr-only">Send</span>
                </Button>
            </div>
        </div>
    );
  };

  return (
    <div className="container mx-auto flex h-full max-w-2xl flex-col items-center justify-center p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Random Chat</CardTitle>
          <CardDescription>
            {status === 'idle' && 'Connect with someone new. Start a conversation!'}
            {status === 'searching' && 'Looking for a chat partner...'}
            {status === 'connected' && `Connected for a ${mode} chat.`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AspectRatio ratio={16 / 9} className="rounded-lg bg-muted">
            {renderContent()}
          </AspectRatio>
          {hasCameraPermission === false && (mode === 'video' || mode === 'audio') && (
            <Alert variant="destructive">
              <AlertTitle>Camera & Mic Access Required</AlertTitle>
              <AlertDescription>
                Please allow camera and microphone access in your browser settings to use this feature.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          {status === 'idle' ? (
            <div className='w-full space-y-2'>
                <p className='text-center text-sm text-muted-foreground'>Choose your chat mode</p>
                <div className="grid grid-cols-3 gap-2">
                    <Button variant={mode === 'video' ? 'default' : 'outline'} onClick={() => setMode('video')}>
                        <Video className="mr-2 h-4 w-4" /> Video
                    </Button>
                    <Button variant={mode === 'audio' ? 'default' : 'outline'} onClick={() => setMode('audio')}>
                        <Mic className="mr-2 h-4 w-4" /> Audio
                    </Button>
                    <Button variant={mode === 'text' ? 'default' : 'outline'} onClick={() => setMode('text')}>
                        <Send className="mr-2 h-4 w-4" /> Text
                    </Button>
                </div>
                 <Button className="w-full" size="lg" onClick={handleStartSearching}>
                    Start Searching
                </Button>
            </div>
          ) : (
            <Button className="w-full" size="lg" onClick={handleSkip}>
              <SkipForward className="mr-2 h-4 w-4" /> Next Person
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
