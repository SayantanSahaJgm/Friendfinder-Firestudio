'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Text, Video as VideoIcon, Mic, RefreshCw, Send, Sparkles, User, Bot } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { enhanceRandomChat } from '@/ai/flows/enhance-random-chat-with-ai';
import VideoChat from './videochat';
import SelfieCapture from './selficapture';

type ChatMode = 'text' | 'audio' | 'video';
type ChatStatus = 'idle' | 'capturingSelfie' | 'searching' | 'connected' | 'error';

export default function RandomChatClient() {
  const [mode, setMode] = useState<ChatMode>('text');
  const [status, setStatus] = useState<ChatStatus>('idle');
  const [aiDecision, setAiDecision] = useState<string | null>(null);
  const [selfieDataUri, setSelfieDataUri] = useState<string | null>(null);
  const [isBotChat, setIsBotChat] = useState(false);

  const startSearch = async () => {
    setStatus('searching');
    setAiDecision(null);
    setIsBotChat(false);

    try {
      // AI analysis for ICE candidates (privacy check)
      const currentUserProfile = "Loves hiking, technology, and Italian food. Based in New York.";
      const otherUserProfile = "Art student from San Francisco, enjoys photography and indie music.";
      const result = await enhanceRandomChat({ currentUserProfile, otherUserProfile });
      setAiDecision(result.iceCandidateDecision);
      
      // Simulate searching for a user
      const searchTimeout = setTimeout(() => {
        // If mode is text and no user is found, connect to a bot
        if (mode === 'text') {
          setIsBotChat(true);
          setStatus('connected');
        } else {
          // For audio/video, we could show a "no user found" message or keep searching
          // For this example, we'll just connect to a simulated user.
          setStatus('connected');
        }
      }, 3000); // 3-second search timeout

      // For demonstration, we'll just "find" a user after 1.5s if not text mode
      if (mode !== 'text') {
        setTimeout(() => {
          clearTimeout(searchTimeout); // Found a user, cancel the bot timeout
          setStatus('connected');
        }, 1500);
      }

    } catch (error) {
      console.error('AI analysis failed:', error);
      setStatus('error');
    }
  };

  const handleSelfieCaptured = (dataUri: string) => {
    setSelfieDataUri(dataUri);
    setStatus('idle'); // Go back to idle to show the start button
    startSearch(); // Immediately start searching after selfie
  };

  const handleStartClick = () => {
    if (mode === 'video') {
      setStatus('capturingSelfie');
    } else {
      startSearch();
    }
  };

  const nextChat = () => {
    setStatus('idle');
    setAiDecision(null);
    setSelfieDataUri(null);
    setIsBotChat(false);
    // After a short delay, go back to searching or selfie capture
    setTimeout(() => {
        if (mode === 'video') {
            setStatus('capturingSelfie');
        } else {
            startSearch();
        }
    }, 100);
  }

  const stopChat = () => {
    setStatus('idle');
    setAiDecision(null);
    setSelfieDataUri(null);
    setIsBotChat(false);
  }

  const renderIdle = () => (
    <Card className="text-center w-full max-w-md">
      <CardHeader>
        <CardTitle className="font-headline">Choose Your Chat Mode</CardTitle>
        <CardDescription>Connect with someone new</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <Tabs defaultValue="text" onValueChange={(value) => setMode(value as ChatMode)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text"><Text className="h-5 w-5 mr-2" />Text</TabsTrigger>
            <TabsTrigger value="audio"><Mic className="h-5 w-5 mr-2" />Audio</TabsTrigger>
            <TabsTrigger value="video"><VideoIcon className="h-5 w-5 mr-2" />Video</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button size="lg" onClick={handleStartClick} className="mt-4 w-full">
          Start Chatting
        </Button>
      </CardContent>
    </Card>
  );

  const renderSelfieCapture = () => (
    <SelfieCapture 
        onSelfieCaptured={handleSelfieCaptured} 
        onCancel={stopChat}
    />
  );

  const renderSearching = () => (
    <Card className="text-center w-full max-w-md">
      <CardHeader>
        <CardTitle className="font-headline">Finding a Match...</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <RefreshCw className="h-16 w-16 animate-spin text-primary" />
        <p className="text-muted-foreground">Please wait while we connect you.</p>
        <Button variant="destructive" onClick={stopChat} className="mt-4">Cancel</Button>
        {aiDecision && (
            <Alert className="text-left animate-in fade-in mt-4">
                <Sparkles className="h-4 w-4" />
                <AlertTitle className="font-bold">AI Privacy Check</AlertTitle>
                <AlertDescription>
                    {aiDecision}
                </AlertDescription>
            </Alert>
        )}
      </CardContent>
    </Card>
  );

  const renderConnected = () => (
    <div className="w-full h-full flex flex-col">
       {mode === 'video' ? (
         <VideoChat onNext={nextChat} onStop={stopChat} />
       ) : (
        <Card className="h-[70vh] w-full max-w-2xl mx-auto flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between border-b">
                <div className="flex items-center gap-2">
                    {isBotChat ? <Bot className="h-6 w-6 text-primary" /> : <User className="h-6 w-6" />}
                    <CardTitle className="text-lg font-headline">
                        {isBotChat ? "Connected with AI Assistant" : `Connected (${mode})`}
                    </CardTitle>
                </div>
                 <div className='flex gap-2'>
                    <Button onClick={nextChat} variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2"/>
                        Next
                    </Button>
                    <Button onClick={stopChat} variant="destructive">
                        Stop
                    </Button>
                 </div>
            </CardHeader>
            <CardContent className="flex-1 p-4 text-center">
                <p className="text-muted-foreground">
                    { isBotChat 
                        ? "You couldn't be matched with a user, so you're talking to our AI. Ask it anything!" 
                        : "Text/Audio Chat UI coming soon!"
                    }
                </p>
            </CardContent>
        </Card>
       )}
    </div>
  );

  const renderError = () => (
      <Card className="w-full max-w-md">
          <CardHeader>
              <CardTitle>Connection Error</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
              <p>Could not connect to a user. Please try again.</p>
              <Button onClick={() => setStatus('idle')}>Try Again</Button>
          </CardContent>
      </Card>
  );

  switch (status) {
    case 'idle':
      return renderIdle();
    case 'capturingSelfie':
      return renderSelfieCapture();
    case 'searching':
      return renderSearching();
    case 'connected':
      return renderConnected();
    case 'error':
        return renderError();
    default:
      return null;
  }
}

    