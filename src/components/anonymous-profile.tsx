'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Sparkles } from "lucide-react";

export default function AnonymousProfile() {
  return (
    <Card className="text-center">
      <CardHeader>
        <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit">
            <User className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="mt-4">You're Browsing Anonymously</CardTitle>
        <CardDescription>
          Sign up to create your profile, connect with friends, and unlock all features.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button size="lg" asChild className="w-full">
            <Link href="/login">
                <Sparkles className="mr-2 h-5 w-5" />
                Sign Up & Join the Community
            </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
