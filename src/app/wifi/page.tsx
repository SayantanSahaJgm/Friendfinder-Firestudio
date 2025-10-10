
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WifiPage() {
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
        <CardContent>
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="p-4 bg-primary/10 rounded-full">
              <Wifi className="h-12 w-12 text-primary" />
            </div>
            <p className="text-muted-foreground">Click the button to start scanning your network.</p>
            <Button size="lg">
                Scan for Users
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
