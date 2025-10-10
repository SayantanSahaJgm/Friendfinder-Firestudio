import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Send } from "lucide-react";

export default function AddPostPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create a New Post</CardTitle>
          <CardDescription>Share what's on your mind with your friends.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Start writing your post here..."
            className="min-h-[150px] resize-none"
          />
          <Button variant="outline" className="w-full">
            <ImagePlus className="mr-2 h-4 w-4" /> Add Photo or Video
          </Button>
        </CardContent>
        <CardFooter>
          <Button className="w-full" size="lg">
            <Send className="mr-2 h-4 w-4" /> Publish Post
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
