
'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wifi, Loader2, UserPlus, X } from 'lucide-react';
import { useFirebase, useUser } from '@/firebase';
import { collection, getDocs, limit, query, where, Timestamp } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { addFriend } from '../actions';
import { errorEmitter, FirestorePermissionError } from '@/firebase';

export default function WifiPage() {
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
    
    const oneHourAgo = Timestamp.fromMillis(Date.now() - 60 * 60 * 1000);
    const usersQuery = query(
      collection(firestore, 'users'),
      where('lastLogin', '>', oneHourAgo),
      limit(10)
    );
    
    getDocs(usersQuery).then(querySnapshot => {
        const fetchedUsers = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as User))
            .filter(user => user.id !== currentUser.uid);
        setDiscoveredUsers(fetchedUsers);
    }).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: 'users',
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({ title: "Scan Error", description: "Could not fetch nearby users.", variant: "destructive" });
    }).finally(() => {
        setIsScanning(false);
    });
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
            <Wifi className="h-6 w-6 text-primary" />
            <CardTitle>WiFi Discovery</CardTitle>
          </div>
          <CardDescription>Find other users on the same WiFi network.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {!isScanning && discoveredUsers.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-8">
                <div className="p-4 bg-primary/10 rounded-full">
                    <Wifi className="h-12 w-12 text-primary" />
                </div>
              <p className="text-muted-foreground">Click the button to start scanning your network.</p>
              <Button size="lg" onClick={startScan}>
                <Wifi className="mr-2 h-5 w-5" /> Start Scanning
              </Button>
            </div>
          )}

          {isScanning && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <p className="text-lg font-semibold">Scanning for users on your network...</p>
              <p className="text-muted-foreground">This may take a moment.</p>
              <Button variant="outline" onClick={() => setIsScanning(false)}>
                <X className="mr-2 h-5 w-5" /> Cancel
              </Button>
            </div>
          )}

          {!isScanning && discoveredUsers.length > 0 && (
            <div className="space-y-4">
                <Button onClick={startScan} className="w-full">
                    <Wifi className="mr-2 h-5 w-5" /> Scan Again
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
