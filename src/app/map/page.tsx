'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Heart,
  LocateFixed,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirebase } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { nearbyUsersData } from '@/lib/data';
import type { User } from '@/lib/types';


export default function MapPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const { firestore } = useFirebase();
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isSharing, setIsSharing] = useState(true);

  const requestLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          toast({
            title: 'Location Updated',
            description: 'Your current location has been fetched.',
          });

          // Update user's location in Firestore
          if (user && firestore) {
            const userRef = doc(firestore, 'users', user.uid);
            setDocumentNonBlocking(
              userRef,
              {
                location: { latitude, longitude },
                lastLogin: serverTimestamp(),
                locationEnabled: isSharing,
              },
              { merge: true }
            );
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast({
            variant: 'destructive',
            title: 'Location Error',
            description:
              'Could not get your location. Please enable location services.',
          });
        }
      );
    } else {
      toast({
        variant: 'destructive',
        title: 'Unsupported Browser',
        description: 'Your browser does not support geolocation.',
      });
    }
  };

  useEffect(() => {
    requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSharing = () => {
    setIsSharing(!isSharing);
    if (user && firestore) {
      const userRef = doc(firestore, 'users', user.uid);
      setDocumentNonBlocking(
        userRef,
        { locationEnabled: !isSharing },
        { merge: true }
      );
    }
    toast({
      title: isSharing ? 'Location Sharing Paused' : 'Location Sharing Enabled',
    });
  };

  return (
    <div className="h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)] bg-gray-800 flex flex-col text-white">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
        <Button variant="ghost" size="icon" className="bg-gray-900/50 rounded-full hover:bg-gray-800">
          <ArrowLeft />
        </Button>
        <Button onClick={toggleSharing} className="bg-gray-900/50 rounded-full hover:bg-gray-800 backdrop-blur-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${isSharing ? 'text-blue-400' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
          {isSharing ? 'Sharing Location' : 'Location Paused'}
        </Button>
        <Button variant="ghost" size="icon" onClick={requestLocation} className="bg-gray-900/50 rounded-full hover:bg-gray-800">
          <RefreshCw />
        </Button>
      </header>

      {/* Map Area */}
      <div className="flex-grow relative">
        <Image
          src="https://picsum.photos/seed/darkmap/1200/1600"
          layout="fill"
          objectFit="cover"
          alt="Dark map"
          className="opacity-40"
          data-ai-hint="dark map"
        />
        <div className="absolute top-1/2 right-4 flex flex-col gap-4">
           <Button variant="ghost" size="icon" onClick={requestLocation} className="bg-gray-900/50 rounded-full hover:bg-gray-800">
             <LocateFixed />
           </Button>
        </div>
        {/* Mock user avatars on map */}
        <div className="absolute top-[30%] left-[25%] text-center">
            <Avatar className="w-12 h-12 border-2 border-blue-400">
                <AvatarImage src={user?.photoURL ?? `https://picsum.photos/seed/${user?.uid}/200/200`} />
                <AvatarFallback>{user?.displayName?.charAt(0) ?? 'Y'}</AvatarFallback>
            </Avatar>
            <div className="bg-gray-900/70 text-white text-xs rounded-full px-2 py-1 mt-1">You Now</div>
        </div>
        <div className="absolute top-[20%] left-[60%] text-center">
            <Avatar className="w-10 h-10">
                <AvatarImage src="https://picsum.photos/seed/Roshan/200/200" />
                <AvatarFallback>R</AvatarFallback>
            </Avatar>
            <div className="bg-gray-900/70 text-white text-xs rounded-full px-2 py-1 mt-1">Roshan 41m</div>
        </div>
        <div className="absolute top-[45%] left-[10%] text-center">
            <Avatar className="w-10 h-10">
                <AvatarImage src="https://picsum.photos/seed/Uday/200/200" />
                <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="bg-gray-900/70 text-white text-xs rounded-full px-2 py-1 mt-1">Uday 5h</div>
        </div>
      </div>

      {/* Bottom Sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gray-900 rounded-t-2xl cursor-pointer p-2">
            <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto" />
            {/* Peek content */}
            <div className="p-4">
                 <div className="relative">
                    <Input placeholder="Search for friends..." className="bg-gray-800 border-gray-700 h-12 pl-10" />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500"/>
                    <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                        <SlidersHorizontal />
                    </Button>
                </div>
            </div>
          </div>
        </SheetTrigger>
        <SheetContent side="bottom" className="bg-gray-900 text-white border-none rounded-t-2xl h-[80vh]">
          <SheetHeader>
            <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto mb-4" />
            <SheetTitle className="sr-only">Nearby Friends</SheetTitle>
          </SheetHeader>
          <div className="p-4 space-y-4">
            <div className="relative">
                <Input placeholder="Search for friends..." className="bg-gray-800 border-gray-700 h-12 pl-10" />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500"/>
                <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                    <SlidersHorizontal />
                </Button>
            </div>
            <div className="space-y-4 overflow-y-auto max-h-[calc(80vh-10rem)]">
                {nearbyUsersData.map(nearbyUser => (
                    <div key={nearbyUser.id} className="flex items-center gap-4">
                        <Avatar className="h-14 w-14">
                            <AvatarImage src={nearbyUser.profilePictureUrl} alt={nearbyUser.username} />
                            <AvatarFallback>{nearbyUser.username.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                            <p className="font-semibold">{nearbyUser.username}</p>
                            <p className="text-sm text-gray-400">{nearbyUser.distance} &bull; {nearbyUser.locationName}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full">
                            <Heart className="h-6 w-6" />
                        </Button>
                    </div>
                ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
