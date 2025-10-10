'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFirebase, useUser } from "@/firebase";
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { UserCheck, UserX, Loader2, Users } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/lib/types";

interface FriendRequest {
    id: string;
    from: string;
    fromUsername: string;
    fromProfilePictureUrl: string;
}

interface Friend extends User {}

export default function FriendsPage() {
    const { firestore } = useFirebase();
    const { user: currentUser } = useUser();
    const { toast } = useToast();
    
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [friends, setFriends] = useState<Friend[]>([]);
    const [isLoading, setIsLoading] = useState<'requests' | 'friends' | 'action' | boolean>(true);

    const fetchRequests = useCallback(async () => {
        if (!currentUser || !firestore) return;
        setIsLoading('requests');
        try {
            const q = query(collection(firestore, 'friendRequests'), where('to', '==', currentUser.uid), where('status', '==', 'pending'));
            const querySnapshot = await getDocs(q);
            
            const requestPromises = querySnapshot.docs.map(async (requestDoc) => {
                const requestData = requestDoc.data();
                const userDocSnapshot = await getDocs(query(collection(firestore, 'users'), where('id', '==', requestData.from)));

                if (!userDocSnapshot.empty) {
                    const userData = userDocSnapshot.docs[0].data() as User;
                    return {
                        id: requestDoc.id,
                        from: requestData.from,
                        fromUsername: userData.username,
                        fromProfilePictureUrl: userData.profilePictureUrl || `https://picsum.photos/seed/${requestData.from}/200/200`
                    };
                }
                return null;
            });

            const settledRequests = (await Promise.all(requestPromises)).filter(r => r !== null) as FriendRequest[];
            setRequests(settledRequests);

        } catch (error) {
            console.error("Error fetching friend requests:", error);
            toast({ title: "Error", description: "Could not fetch friend requests.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [currentUser, firestore, toast]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleRequest = async (requestId: string, fromId: string, accepted: boolean) => {
        if (!currentUser || !firestore) return;
        setIsLoading('action');
        
        try {
            const requestRef = doc(firestore, 'friendRequests', requestId);
            if (accepted) {
                await updateDoc(requestRef, { status: 'accepted' });
                // In a real app, you'd create a friendship document or update user friend lists.
                toast({ title: "Friend Added!", description: "You are now friends." });
            } else {
                await deleteDoc(requestRef);
                toast({ title: "Request Declined", description: "The request has been removed." });
            }
            // Refresh requests
            fetchRequests();
        } catch (error) {
            console.error("Error handling request:", error);
            toast({ title: "Error", description: "Could not process the request.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }


    return (
        <div className="container mx-auto max-w-2xl px-4 py-8 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Friend Requests</CardTitle>
                    <CardDescription>Accept or decline requests from other users.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading === 'requests' && <div className="flex justify-center items-center h-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
                    {!isLoading && requests.length === 0 && <p className="text-muted-foreground text-center">No new requests.</p>}
                    <div className="space-y-4">
                        {requests.map(req => (
                            <div key={req.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary">
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src={req.fromProfilePictureUrl} />
                                        <AvatarFallback>{req.fromUsername.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-semibold">{req.fromUsername}</span>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="icon" variant="outline" className="text-green-500 hover:text-green-500 hover:bg-green-100" onClick={() => handleRequest(req.id, req.from, true)} disabled={isLoading === 'action'}>
                                        <UserCheck className="h-5 w-5" />
                                    </Button>
                                    <Button size="icon" variant="outline" className="text-red-500 hover:text-red-500 hover:bg-red-100" onClick={() => handleRequest(req.id, req.from, false)} disabled={isLoading === 'action'}>
                                        <UserX className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Your Friends</CardTitle>
                    <CardDescription>Your connected friends.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground py-8">
                        <Users className="h-10 w-10 mx-auto" />
                        <p className="mt-2">Friend list feature coming soon.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
