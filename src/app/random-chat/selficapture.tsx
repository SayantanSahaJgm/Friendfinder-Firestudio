'use client';

import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Camera, RefreshCw, Send, Sparkles, Video, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { detectFace } from '@/ai/flows/face-detection-flow';
import type { FaceDetectionOutput } from '@/ai/flows/face-detection-types';
import { Progress } from '@/components/ui/progress';

interface SelfieCaptureProps {
    onSelfieCaptured: (dataUri: string) => void;
    onCancel: () => void;
}

type CaptureStatus = 'initializing' | 'previewing' | 'capturing' | 'verifying' | 'failed';

export default function SelfieCapture({ onSelfieCaptured, onCancel }: SelfieCaptureProps) {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [status, setStatus] = useState<CaptureStatus>('initializing');
  const [verificationResult, setVerificationResult] = useState<FaceDetectionOutput | null>(null);
  const [progress, setProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    let stream: MediaStream | null = null;
    const getCameraPermission = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCameraPermission(true);
        setStatus('previewing');
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        setStatus('failed');
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    };

    getCameraPermission();

    return () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [toast]);

  const captureAndVerify = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setStatus('capturing');
    setProgress(10);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    const dataUri = canvas.toDataURL('image/jpeg');
    
    setStatus('verifying');

    const progressInterval = setInterval(() => {
        setProgress(p => (p < 90 ? p + 5 : 90));
    }, 100);

    try {
        const result = await detectFace({ photoDataUri: dataUri });
        setVerificationResult(result);
        if (result.faceDetected) {
            setProgress(100);
            setTimeout(() => onSelfieCaptured(dataUri), 500);
        } else {
            setStatus('failed');
        }
    } catch (error) {
        console.error('Face detection failed:', error);
        setStatus('failed');
        setVerificationResult({ faceDetected: false, reason: 'Could not connect to verification service.' });
    } finally {
        clearInterval(progressInterval);
    }
  };

  const renderStatus = () => {
    switch (status) {
        case 'initializing':
            return <p className='flex items-center gap-2'><RefreshCw className="h-4 w-4 animate-spin"/> Initializing camera...</p>;
        case 'previewing':
            return <p>Center your face in the frame and click Capture.</p>;
        case 'capturing':
        case 'verifying':
            return (
                <div className='w-full'>
                    <Progress value={progress} className="w-full mb-2" />
                    <p>{status === 'capturing' ? 'Capturing...' : 'Verifying with AI...'}</p>
                </div>
            );
        case 'failed':
            return (
                <Alert variant="destructive">
                    <XCircle className="h-4 w-4"/>
                    <AlertTitle>Verification Failed</AlertTitle>
                    <AlertDescription>{verificationResult?.reason || 'Please try again.'}</AlertDescription>
                </Alert>
            );
        default:
            return null;
    }
  }

  return (
    <Card className="w-full max-w-md">
        <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
                <Camera className='h-6 w-6' />
                Video Chat Verification
            </CardTitle>
            <CardDescription>
                To ensure a safe community, we need to quickly verify your face before connecting.
            </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
            <div className="w-full aspect-video bg-secondary rounded-md overflow-hidden relative flex items-center justify-center">
                 <video ref={videoRef} className={`w-full aspect-video rounded-md transition-opacity duration-300 ${status === 'previewing' ? 'opacity-100' : 'opacity-60'}`} autoPlay muted playsInline />
                 {status !== 'previewing' && <div className="absolute inset-0 bg-black/20" />}
                 {hasCameraPermission === false && <p className='text-destructive-foreground'>Camera not available.</p>}
            </div>
            
            <canvas ref={canvasRef} className="hidden" />

            <div className='w-full text-center p-2 bg-muted/50 rounded-md min-h-[4rem] flex items-center justify-center'>
               {renderStatus()}
            </div>

            <div className='w-full flex gap-2'>
                <Button variant="outline" onClick={onCancel} className="w-full">Cancel</Button>
                {status === 'failed' ? (
                     <Button onClick={() => setStatus('previewing')} className="w-full">
                        <RefreshCw className="mr-2" /> Try Again
                    </Button>
                ) : (
                    <Button onClick={captureAndVerify} disabled={status !== 'previewing'} className="w-full">
                        {status === 'verifying' ? <RefreshCw className="animate-spin mr-2"/> : <Send className="mr-2" />}
                        Capture & Connect
                    </Button>
                )}
            </div>
        </CardContent>
    </Card>
  );
}
