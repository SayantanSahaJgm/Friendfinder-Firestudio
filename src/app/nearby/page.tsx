'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Loader2, Users } from "lucide-react";
import { useFirebase } from "@/firebase";
import { collection, getDocs, limit, query, where, Timestamp } from "firebase/firestore";
import type { User } from "@/lib/types";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { addFriend } from "../actions";
import { useUser, errorEmitter, FirestorePermissionError } from "@/firebase";


function UserGrid() {
  const { firestore } = useFirebase();
  const { user: currentUser } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [requesting, setRequesting] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!firestore || !currentUser) return;

    const fetchUsers = () => {
      setIsLoading(true);
      // Fetch users who were active in the last hour and are not the current user
      const oneHourAgo = Timestamp.fromMillis(Date.now() - 60 * 60 * 1000);
      const usersQuery = query(
          collection(firestore, 'users'), 
          where('lastLogin', '>', oneHourAgo),
          limit(20)
      );

      getDocs(usersQuery).then(querySnapshot => {
        const fetchedUsers = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as User))
            .filter(user => user.id !== currentUser.uid); // Exclude current user

        setUsers(fetchedUsers);
      }).catch(serverError => {
        const permissionError = new FirestorePermissionError({
            path: 'users',
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
      }).finally(() => {
        setIsLoading(false);
      });
    };

    fetchUsers();
  }, [firestore, currentUser, toast]);

  const handleAddFriend = async (targetUserId: string) => {
    if (!currentUser) {
        toast({ title: "You must be logged in.", variant: "destructive" });
        return;
    }
    setRequesting(targetUserId);
    try {
        await addFriend(targetUserId);
        toast({
            title: "Friend Request Sent!",
            description: "Your request has been sent.",
        });
    } catch (error) {
        console.error(error);
        toast({
            title: "Error",
            description: "Could not send friend request.",
            variant: "destructive"
        });
    } finally {
        setRequesting(null);
    }
  }


  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  if (users.length === 0) {
    return (
        <div className="text-center py-16 text-muted-foreground">
            <Users className="mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-semibold">No one is online</h3>
            <p className="mt-2 text-sm">Check back later to find new friends.</p>
        </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {users.map((user) => (
        <Card key={user.id} className="text-center transition-transform hover:scale-105 hover:shadow-lg">
          <CardContent className="p-4">
            <Avatar className="mx-auto h-20 w-20">
              <AvatarImage src={user.profilePictureUrl} alt={user.username} />
              <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
            </Avatar>
            <p className="mt-3 font-semibold truncate">{user.username}</p>
            <p className="mt-1 text-xs text-muted-foreground truncate">{user.interests?.slice(0, 2).join(', ')}</p>
            <Button size="sm" className="mt-4 w-full" onClick={() => handleAddFriend(user.id)} disabled={!!requesting}>
              {requesting === user.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              {requesting === user.id ? 'Sending...' : 'Add Friend'}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function OnlineUsersPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <CardTitle>Online Users</CardTitle>
          </div>
          <CardDescription>
            Discover and connect with people who are currently active.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserGrid />
        </CardContent>
      </Card>
    </div>
  );
}
