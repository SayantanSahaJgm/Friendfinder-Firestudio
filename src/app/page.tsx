import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Camera, Plus } from "lucide-react";

import { stories, posts, currentUser } from "@/lib/data";
import { PostCard } from "@/components/post-card";
import { SmartSuggestions } from "@/components/smart-suggestions";

export default function Home() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="space-y-8">
        {/* Stories Section */}
        <section aria-labelledby="stories-heading">
          <h2 id="stories-heading" className="sr-only">Stories</h2>
          <div className="flex items-center space-x-4 overflow-x-auto pb-4">
            <div className="flex-shrink-0 text-center">
               <div className="relative">
                <Avatar className="h-16 w-16 border-2 border-dashed border-muted-foreground">
                  <AvatarImage src={currentUser.avatarUrl} alt="Your Story" />
                  <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                 <Button size="icon" className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary">
                   <Plus className="h-4 w-4" />
                 </Button>
               </div>
              <p className="mt-2 text-xs font-medium text-muted-foreground">Your Story</p>
            </div>
            {stories.map((story) => (
              <div key={story.id} className="flex-shrink-0 text-center">
                <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-0.5">
                  <Avatar className="h-full w-full border-2 border-background">
                    <AvatarImage src={story.user.avatarUrl} alt={story.user.name} />
                    <AvatarFallback>{story.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
                <p className="mt-2 w-16 truncate text-xs font-medium">{story.user.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Create Post Section */}
        <section aria-labelledby="create-post-heading">
          <h2 id="create-post-heading" className="sr-only">Create a new post</h2>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <Link href="/profile">
                  <Avatar>
                    <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Link>
                <Input placeholder="What's on your mind?" className="flex-1 bg-muted" />
                <Button variant="ghost" size="icon">
                  <Camera className="h-5 w-5 text-muted-foreground" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Smart Suggestions Section */}
        <SmartSuggestions />

        {/* Feed Section */}
        <section aria-labelledby="feed-heading">
          <h2 id="feed-heading" className="sr-only">Feed</h2>
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
