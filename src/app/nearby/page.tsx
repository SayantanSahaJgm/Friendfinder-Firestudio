import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { users } from "@/lib/data";
import { Bluetooth, UserPlus, Wifi } from "lucide-react";

function UserGrid() {
  // Use a shuffled and sliced list of users to simulate different scan results
  const discoveredUsers = [...users].sort(() => 0.5 - Math.random()).slice(0, 4);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {discoveredUsers.map((user) => (
        <Card key={user.id} className="text-center transition-transform hover:scale-105 hover:shadow-lg">
          <CardContent className="p-4">
            <Avatar className="mx-auto h-20 w-20">
              <AvatarImage src={user.avatarUrl} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <p className="mt-3 font-semibold truncate">{user.name}</p>
            <p className="mt-1 text-xs text-muted-foreground truncate">{user.interests.slice(0, 2).join(', ')}</p>
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
