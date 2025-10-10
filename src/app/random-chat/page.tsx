import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mic, Send, SkipForward, Video } from "lucide-react";

export default function RandomChatPage() {
  return (
    <div className="container mx-auto flex h-full max-w-2xl flex-col items-center justify-center p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Random Chat</CardTitle>
          <CardDescription>Connect with someone new. Start a conversation!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AspectRatio ratio={16 / 9} className="rounded-lg bg-muted">
            <div className="flex h-full items-center justify-center">
              <Video className="h-16 w-16 text-muted-foreground" />
            </div>
          </AspectRatio>
          <div className="flex w-full items-center space-x-2">
            <Input type="text" placeholder="Say something nice..." />
            <Button type="submit">
                <Send className="h-4 w-4"/>
                <span className="sr-only">Send</span>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="grid grid-cols-2 gap-4 md:flex md:justify-between">
          <div className="col-span-2 flex justify-center space-x-2 md:col-auto">
            <Button variant="outline">
                <Video className="mr-2 h-4 w-4" /> Video Call
            </Button>
            <Button variant="outline">
                <Mic className="mr-2 h-4 w-4" /> Audio Call
            </Button>
          </div>
          <Button className="col-span-2 w-full md:col-auto md:w-auto" size="lg">
            <SkipForward className="mr-2 h-4 w-4" /> Next Person
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
