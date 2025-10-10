'use client';

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, Loader2, LogOut, MessageSquare } from "lucide-react";
import { useAuth, useUser } from "@/firebase";

export default function AppHeader() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const handleSignOut = () => {
    if (auth) {
      auth.signOut();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
        {isUserLoading ? (
            <Loader2 className="h-6 w-6 animate-spin"/>
        ) : (
            <Link href="/profile">
                <Avatar>
                    <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? 'User'} />
                    <AvatarFallback>{user?.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
                </Avatar>
            </Link>
        )}
        <h1 className="font-headline text-xl font-bold text-primary">
          Proximity
        </h1>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <MessageSquare className="h-5 w-5" />
            <span className="sr-only">Messages</span>
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          {user && (
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Sign Out</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
