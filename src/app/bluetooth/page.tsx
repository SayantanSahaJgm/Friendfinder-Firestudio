'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bluetooth, Loader2, UserPlus, X, Scan } from 'lucide-react';
import { useFirebase, useUser } from '@/firebase';
import { collection, getDocs, limit, query, where, Timestamp } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { addFriend } from '../actions';

export default function BluetoothPage() {
  const { firestore } = useFirebase();
  const { user: currentUser } = useUser();
  const { toast } = useToast();
  
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredUsers, setDiscoveredUsers] = useState<User[]>([]);
  const [requesting, setRequesting] = useState<string | null>(null);

  const startScan = async () => {
    if (!currentUser || !firestore) {
      toast({ title: "Please log in", description: "You need to be logged in to scan for nearby users.", variant: "destructive" });
      return;
    }
    
    setIsScanning(true);
    setDiscoveredUsers([]); // Clear previous results

    // Simulate a 3-second scan
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    try {
      const oneHourAgo = Timestamp.fromMillis(Date.now() - 60 * 60 * 1000);
      const usersQuery = query(
        collection(firestore, 'users'),
        where('lastLogin', '>', oneHourAgo),
        limit(10)
      );
      const querySnapshot = await getDocs(usersQuery);
      const fetchedUsers = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as User))
        .filter(user => user.id !== currentUser.uid);

      setDiscoveredUsers(fetchedUsers);
    } catch (error) {
      console.error("Error fetching users for Bluetooth scan:", error);
      toast({ title: "Scan Error", description: "Could not fetch nearby users.", variant: "destructive" });
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddFriend = async (targetUserId: string) => {
    if (!currentUser) return;
    setRequesting(targetUserId);
    try {
      await addFriend(targetUserId);
      toast({ title: "Friend Request Sent!", description: "Your request has been sent." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not send friend request.", variant: "destructive" });
    } finally {
      setRequesting(null);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bluetooth className="h-6 w-6 text-primary" />
            <CardTitle>Proximity Scan</CardTitle>
          </div>
          <CardDescription>Find and connect with people in your immediate vicinity using Bluetooth.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {!isScanning && discoveredUsers.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-8">
                <div className="p-4 bg-primary/10 rounded-full">
                    <Scan className="h-12 w-12 text-primary" />
                </div>
              <p className="text-muted-foreground">Click the button to start scanning for nearby devices.</p>
              <Button size="lg" onClick={startScan}>
                <Bluetooth className="mr-2 h-5 w-5" /> Start Scanning
              </Button>
            </div>
          )}

          {isScanning && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <p className="text-lg font-semibold">Scanning for devices...</p>
              <p className="text-muted-foreground">This may take a moment.</p>
              <Button variant="outline" onClick={() => setIsScanning(false)}>
                <X className="mr-2 h-5 w-5" /> Cancel
              </Button>
            </div>
          )}

          {!isScanning && discoveredUsers.length > 0 && (
            <div className="space-y-4">
                <Button onClick={startScan} className="w-full">
                    <Bluetooth className="mr-2 h-5 w-5" /> Scan Again
                </Button>
                {discoveredUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                        <div className="flex items-center gap-4 text-left">
                            <Avatar>
                                <AvatarImage src={user.profilePictureUrl} />
                                <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{user.username}</p>
                                <p className="text-sm text-muted-foreground">{user.bio?.substring(0, 30)}...</p>
                            </div>
                        </div>
                        <Button size="sm" onClick={() => handleAddFriend(user.id)} disabled={!!requesting && requesting === user.id}>
                            {requesting === user.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                            Connect
                        </Button>
                    </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
