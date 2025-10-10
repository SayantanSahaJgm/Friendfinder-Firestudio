'use client';

import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Video, VideoOff, RefreshCw, X, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface VideoChatProps {
    onNext: () => void;
    onStop: () => void;
}

export default function VideoChat({ onNext, onStop }: VideoChatProps) {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const myVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    let stream: MediaStream | null = null;
    const getCameraPermission = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = stream;
        }
        setHasCameraPermission(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    };

    getCameraPermission();

    return () => {
        // Stop all tracks on cleanup
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [toast]);

  return (
    <Card className="w-full h-full flex flex-col relative overflow-hidden">
      <div className="grid flex-1 grid-cols-1 md:grid-cols-2 gap-2 p-2">
        {/* Remote Video */}
        <div className="relative bg-secondary rounded-lg overflow-hidden flex items-center justify-center">
          <video ref={remoteVideoRef} className="w-full h-full object-cover" autoPlay playsInline />
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white p-4">
              <VideoOff className="h-12 w-12 mb-4" />
              <p className="font-semibold">Stranger's Video</p>
              <p className="text-sm text-center">Waiting for user to connect...</p>
          </div>
          <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded-md text-sm">Stranger</div>
        </div>
        
        {/* Local Video */}
        <div className="relative bg-secondary rounded-lg overflow-hidden flex items-center justify-center">
          {hasCameraPermission === null && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-secondary-foreground">
                <Camera className="h-12 w-12 mb-4 animate-pulse" />
                <p>Starting your camera...</p>
            </div>
          )}
          <video ref={myVideoRef} className={`w-full h-full object-cover transition-opacity ${hasCameraPermission ? 'opacity-100' : 'opacity-0'}`} autoPlay muted playsInline />
          {hasCameraPermission === false && (
            <Alert variant="destructive" className="absolute m-4 max-w-sm">
              <Video className="h-4 w-4" />
              <AlertTitle>Camera Access Required</AlertTitle>
              <AlertDescription>
                Please allow camera access to use this feature.
              </AlertDescription>
            </Alert>
          )}
          <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded-md text-sm">You</div>
        </div>
      </div>
      
      <div className="flex justify-center items-center p-4 gap-4 bg-background border-t">
        <Button onClick={onStop} variant="destructive" size="lg" className="rounded-full h-14 w-28 text-base">
            <X className="h-5 w-5 mr-2" /> Stop
        </Button>
        <Button onClick={onNext} size="lg" className="rounded-full h-14 w-28 text-base">
            <RefreshCw className="h-5 w-5 mr-2" /> Next
        </Button>
      </div>
    </Card>
  );
}
