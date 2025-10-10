'use client';

import { useEffect, useState, useCallback } from 'react';
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
import { doc, serverTimestamp, getDocs, collection, query, where, Timestamp, limit } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
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
  const [nearbyUsers, setNearbyUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNearbyUsers = useCallback(async () => {
    if (!firestore || !user) return;
    setIsLoading(true);

    try {
        const oneHourAgo = Timestamp.fromMillis(Date.now() - 60 * 60 * 1000);
        const usersQuery = query(
            collection(firestore, 'users'), 
            where('locationEnabled', '==', true),
            where('lastLogin', '>', oneHourAgo),
            limit(10)
        );

        const querySnapshot = await getDocs(usersQuery);
        const fetchedUsers = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as User))
            .filter(u => u.id !== user.uid);
        
        setNearbyUsers(fetchedUsers);
    } catch (error) {
        console.error("Error fetching nearby users:", error);
        toast({
            title: "Error",
            description: "Could not fetch nearby users. Please check your connection and security rules.",
            variant: "destructive",
        })
    } finally {
        setIsLoading(false);
    }
  }, [firestore, user, toast]);

  const requestLocation = useCallback(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          toast({
            title: 'Location Updated',
            description: 'Your current location has been fetched.',
          });

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
          fetchNearbyUsers();
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
  }, [user, firestore, isSharing, fetchNearbyUsers, toast]);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const toggleSharing = () => {
    const newSharingStatus = !isSharing;
    setIsSharing(newSharingStatus);
    if (user && firestore) {
      const userRef = doc(firestore, 'users', user.uid);
      setDocumentNonBlocking(
        userRef,
        { locationEnabled: newSharingStatus },
        { merge: true }
      );
    }
    toast({
      title: newSharingStatus ? 'Location Sharing Enabled' : 'Location Sharing Paused',
    });
  };

  return (
    <div className="h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)] bg-gray-800 flex flex-col text-white">
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
          <RefreshCw className={isLoading ? 'animate-spin' : ''} />
        </Button>
      </header>

      <div className="flex-grow relative">
        <Image
          src="https://picsum.photos/seed/darkmap/1200/1600"
          fill
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
        {user && (
            <div className="absolute top-[30%] left-[25%] text-center">
                <Avatar className="w-12 h-12 border-2 border-blue-400">
                    <AvatarImage src={user?.photoURL ?? `https://picsum.photos/seed/${user?.uid}/200/200`} />
                    <AvatarFallback>{user?.displayName?.charAt(0) ?? 'Y'}</AvatarFallback>
                </Avatar>
                <div className="bg-gray-900/70 text-white text-xs rounded-full px-2 py-1 mt-1">You</div>
            </div>
        )}
        {nearbyUsers[0] && (
            <div className="absolute top-[20%] left-[60%] text-center">
                <Avatar className="w-10 h-10">
                    <AvatarImage src={nearbyUsers[0].profilePictureUrl} />
                    <AvatarFallback>{nearbyUsers[0].username.charAt(0)}</AvatarFallback>
                </Avatar>
            </div>
        )}
         {nearbyUsers[1] && (
            <div className="absolute top-[45%] left-[10%] text-center">
                <Avatar className="w-10 h-10">
                    <AvatarImage src={nearbyUsers[1].profilePictureUrl} />
                    <AvatarFallback>{nearbyUsers[1].username.charAt(0)}</AvatarFallback>
                </Avatar>
            </div>
        )}
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gray-900 rounded-t-2xl cursor-pointer p-2">
            <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto" />
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
            <SheetTitle className="text-center text-lg">People Nearby</SheetTitle>
          </SheetHeader>
          <div className="p-4 space-y-4">
            <div className="space-y-4 overflow-y-auto max-h-[calc(80vh-10rem)]">
                {isLoading && <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8" /></div>}
                {!isLoading && nearbyUsers.length === 0 && <p className="text-center text-gray-400">No users found nearby. Make sure your location sharing is on!</p>}
                {!isLoading && nearbyUsers.map(nearbyUser => (
                    <div key={nearbyUser.id} className="flex items-center gap-4">
                        <Avatar className="h-14 w-14">
                            <AvatarImage src={nearbyUser.profilePictureUrl} alt={nearbyUser.username} />
                            <AvatarFallback>{nearbyUser.username.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                            <p className="font-semibold">{nearbyUser.username}</p>
                            <p className="text-sm text-gray-400">Active recently</p>
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
