'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
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
import { Slider } from '@/components/ui/slider';
import {
  ArrowLeft,
  Heart,
  LocateFixed,
  Loader2,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirebase } from '@/firebase';
import { doc, serverTimestamp, getDocs, collection, query, where, Timestamp, limit } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { User } from '@/lib/types';
import haversine from 'haversine-distance';

export default function MapPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const { firestore } = useFirebase();
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isSharing, setIsSharing] = useState(true);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [distance, setDistance] = useState(50); // Default distance in km

  const fetchNearbyUsers = useCallback(async () => {
    if (!firestore || !user) return;
    setIsLoading(true);

    try {
        const oneHourAgo = Timestamp.fromMillis(Date.now() - 60 * 60 * 1000);
        const usersQuery = query(
            collection(firestore, 'users'), 
            where('locationEnabled', '==', true),
            where('lastLogin', '>', oneHourAgo),
            limit(50) // Fetch more users to allow for client-side filtering
        );

        const querySnapshot = await getDocs(usersQuery);
        const fetchedUsers = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as User))
            .filter(u => u.id !== user.uid);
        
        setAllUsers(fetchedUsers);
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

          if (user && firestore) {
            const userRef = doc(firestore, 'users', user.uid);
            setDocumentNonBlocking(
              userRef,
              {
                location: { latitude, longitude },
                lastLogin: serverTimestamp(),
                locationEnabled: true,
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
  }, [user, firestore, fetchNearbyUsers, toast]);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const nearbyUsers = useMemo(() => {
    if (!location) return [];
    return allUsers.filter(u => {
        if (!u.location) return false;
        const userLocation = { lat: u.location.latitude, lon: u.location.longitude };
        const myLocation = { lat: location.latitude, lon: location.longitude };
        const distMeters = haversine(userLocation, myLocation);
        const distKm = distMeters / 1000;
        return distKm <= distance;
    });
  }, [allUsers, location, distance]);


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
    <div className="h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)] flex flex-col bg-white">
      <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
        <Button variant="ghost" size="icon" className="bg-background/50 rounded-full hover:bg-muted">
          <ArrowLeft />
        </Button>
        <Button onClick={toggleSharing} className="bg-background/50 rounded-full hover:bg-muted backdrop-blur-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${isSharing ? 'text-blue-500' : 'text-muted-foreground'}`} viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
          {isSharing ? 'Sharing Location' : 'Location Paused'}
        </Button>
        <Button variant="ghost" size="icon" onClick={requestLocation} className="bg-background/50 rounded-full hover:bg-muted">
          <RefreshCw className={isLoading ? 'animate-spin' : ''} />
        </Button>
      </header>

      <div className="flex-grow relative">
        {user && (
            <div className="absolute top-[30%] left-[25%] text-center">
                <Avatar className="w-12 h-12 border-2 border-blue-400">
                    <AvatarImage src={user?.photoURL ?? `https://picsum.photos/seed/${user?.uid}/200/200`} />
                    <AvatarFallback>{user?.displayName?.charAt(0) ?? 'Y'}</AvatarFallback>
                </Avatar>
                <div className="bg-background/70 text-foreground text-xs rounded-full px-2 py-1 mt-1">You</div>
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
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-background/80 backdrop-blur-sm rounded-t-2xl cursor-pointer p-2 border-t">
            <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto" />
            <div className="p-4">
                 <div className="relative">
                    <Input placeholder="Search for friends..." className="bg-muted border-none h-12 pl-10" />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
                 </div>
            </div>
          </div>
        </SheetTrigger>
        <SheetContent side="bottom" className="bg-background text-foreground border-none rounded-t-2xl h-[80vh]">
          <SheetHeader>
            <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto mb-4" />
            <SheetTitle className="text-center text-lg">People Nearby</SheetTitle>
          </SheetHeader>
          <div className="p-4 space-y-4">
            <div className='flex items-center gap-4'>
                <label htmlFor="distance-slider" className='text-sm font-medium text-muted-foreground whitespace-nowrap'>Distance: {distance} km</label>
                <Slider
                    id="distance-slider"
                    min={1}
                    max={100}
                    step={1}
                    value={[distance]}
                    onValueChange={(value) => setDistance(value[0])}
                />
            </div>
            <div className="space-y-4 overflow-y-auto max-h-[calc(80vh-14rem)]">
                {isLoading && <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8" /></div>}
                {!isLoading && nearbyUsers.length === 0 && <p className="text-center text-muted-foreground">No users found within {distance}km. Try expanding your search radius!</p>}
                {!isLoading && nearbyUsers.map(nearbyUser => (
                    <div key={nearbyUser.id} className="flex items-center gap-4">
                        <Avatar className="h-14 w-14">
                            <AvatarImage src={nearbyUser.profilePictureUrl} alt={nearbyUser.username} />
                            <AvatarFallback>{nearbyUser.username.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                            <p className="font-semibold">{nearbyUser.username}</p>
                            <p className="text-sm text-muted-foreground">Active recently</p>
                        </div>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-muted rounded-full">
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
