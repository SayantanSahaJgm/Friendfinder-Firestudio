'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser, useDoc, useMemoFirebase } from "@/firebase";
import { doc, getFirestore } from "firebase/firestore";
import { Edit, Loader2 } from "lucide-react";
import type { User } from '@/lib/types';
import { Skeleton } from "@/components/ui/skeleton";

function ProfileSkeleton() {
    return (
        <Card>
            <CardHeader className="items-center text-center">
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-8 w-48 mt-4" />
                <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <h3 className="text-sm font-semibold text-muted-foreground">Interests</h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                            <Skeleton className="h-6 w-20 rounded-full" />
                            <Skeleton className="h-6 w-24 rounded-full" />
                            <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" disabled>
                    <Edit className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
            </CardFooter>
        </Card>
    )
}


export default function ProfilePage() {
    const { user, isUserLoading } = useUser();
    const firestore = getFirestore();

    const userDocRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, "users", user.uid);
    }, [user, firestore]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<User>(userDocRef);

    const isLoading = isUserLoading || isProfileLoading;

    if (isLoading) {
        return (
            <div className="container mx-auto max-w-2xl px-4 py-8">
                <ProfileSkeleton />
            </div>
        );
    }
    
    if (!userProfile) {
        return (
            <div className="container mx-auto max-w-2xl px-4 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Profile not found</CardTitle>
                        <CardDescription>
                            We couldn't find your profile data. It might still be getting created.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader className="items-center text-center">
          <Avatar className="h-24 w-24 border-4 border-background shadow-md">
            <AvatarImage src={userProfile.profilePictureUrl} alt={userProfile.username} />
            <AvatarFallback className="text-3xl">{userProfile.username?.charAt(0)}</AvatarFallback>
          </Avatar>
          <CardTitle className="pt-4 text-3xl">{userProfile.username}</CardTitle>
          <CardDescription>{userProfile.bio}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">Interests</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {userProfile.interests?.map((interest: string) => (
                  <Badge key={interest} variant="secondary" className="text-sm">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">
            <Edit className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
