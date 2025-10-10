"use client";

import { useState } from "react";
import { getSuggestions } from "@/app/actions";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { users } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Loader2, UserPlus } from "lucide-react";
import Link from "next/link";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { useToast } from "@/hooks/use-toast";


export function SmartSuggestions() {
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGetSuggestions = async () => {
    setLoading(true);
    try {
      const result = await getSuggestions();
      setSuggestions(result.suggestedConnections);
    } catch (error) {
        toast({
            title: "Error fetching suggestions",
            description: "Could not connect to the AI service. Please try again later.",
            variant: "destructive"
        })
    } finally {
        setLoading(false);
    }
  };

  const suggestedUsers = suggestions ? users.filter(u => suggestions.includes(u.name)) : [];

  return (
    <section aria-labelledby="smart-suggestions-heading">
      <Card>
        <CardHeader>
          <CardTitle id="smart-suggestions-heading">Discover New Connections</CardTitle>
          <CardDescription>
            Let our AI suggest people who share your interests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : suggestions ? (
            <ScrollArea>
              <div className="flex space-x-4 pb-4">
              {suggestedUsers.map((user) => (
                <div key={user.id} className="w-36 flex-shrink-0">
                  <Card className="overflow-hidden text-center">
                    <CardContent className="p-4">
                      <Link href={`/profile`}>
                        <Avatar className="mx-auto h-16 w-16">
                          <AvatarImage src={user.avatarUrl} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <p className="mt-2 font-semibold truncate">{user.name}</p>
                      </Link>
                      <p className="text-xs text-muted-foreground truncate">{user.interests.join(', ')}</p>
                      <Button size="sm" className="mt-4 w-full">
                        <UserPlus className="mr-2 h-4 w-4" /> Connect
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ))}
              </div>
               <ScrollBar orientation="horizontal" />
            </ScrollArea>
          ) : (
            <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed">
                <p className="text-muted-foreground">Suggestions will appear here.</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleGetSuggestions} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Thinking...
              </>
            ) : suggestions ? 'Refresh Suggestions' : 'Get Suggestions'}
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}
