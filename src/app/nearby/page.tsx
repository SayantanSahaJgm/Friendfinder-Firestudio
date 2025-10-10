'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bluetooth, UserPlus, Wifi, Loader2 } from "lucide-react";
import { useFirebase } from "@/firebase";
import { collection, getDocs, limit, query } from "firebase/firestore";
import type { User } from "@/lib/types";
import { useEffect, useState } from "react";

function UserGrid() {
  const { firestore } = useFirebase();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!firestore) return;

    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const usersQuery = query(collection(firestore, 'users'), limit(8));
        const querySnapshot = await getDocs(usersQuery);
        const fetchedUsers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        
        // Simulate discovery by shuffling
        const discoveredUsers = [...fetchedUsers].sort(() => 0.5 - Math.random());
        setUsers(discoveredUsers);

      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [firestore]);


  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
            <Button size="sm" className="mt-4 w-full">
              <UserPlus className="mr-2 h-4 w-4" />
              Connect
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function NearbyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Discover Nearby</CardTitle>
          <CardDescription>
            Find and connect with people in your immediate vicinity. This is a simulation of Bluetooth and WiFi scanning.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="bluetooth" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="bluetooth">
                <Bluetooth className="mr-2 h-4 w-4" />
                Bluetooth
              </TabsTrigger>
              <TabsTrigger value="wifi">
                <Wifi className="mr-2 h-4 w-4" />
                WiFi
              </TabsTrigger>
            </TabsList>
            <TabsContent value="bluetooth" className="mt-6">
              <UserGrid />
            </TabsContent>
            <TabsContent value="wifi" className="mt-6">
              <UserGrid />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
