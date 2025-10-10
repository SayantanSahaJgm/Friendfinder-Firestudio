import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Heart, MessageCircle, MoreHorizontal, Share2 } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

type PostCardProps = {
  post: Post;
};

export function PostCard({ post }: PostCardProps) {
  const timeAgo = post.timestamp ? formatDistanceToNow(post.timestamp.toDate(), { addSuffix: true }) : 'just now';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4 p-4">
        <Link href={`/profile`}>
          <Avatar>
            <AvatarImage src={post.user.profilePictureUrl} alt={post.user.username} />
            <AvatarFallback>{post.user.username?.charAt(0)}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1">
          <Link href={`/profile`} className="font-semibold hover:underline">
            {post.user.username}
          </Link>
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
        </div>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-0">
        <p className="text-sm">{post.text}</p>
        {post.mediaUrl && (
          <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg">
            <Image
              src={post.mediaUrl}
              alt="Post content"
              fill
              className="object-cover"
              data-ai-hint="nature forest"
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between p-4 pt-0">
        <div className="flex space-x-4 text-muted-foreground">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            <span>{post.likeIds?.length ?? 0}</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <span>{post.commentIds?.length ?? 0}</span>
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          <span>Share</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
