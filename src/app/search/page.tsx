import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";

export default function SearchPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
       <Card>
        <CardHeader>
          <CardTitle>Search & Explore</CardTitle>
          <CardDescription>
            Find friends, posts, and more.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full items-center space-x-2">
            <Input type="text" placeholder="Search Proximity..." className="flex-1"/>
            <Button type="submit" size="icon">
                <SearchIcon className="h-5 w-5"/>
                <span className="sr-only">Search</span>
            </Button>
          </div>
          <div className="mt-8 flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
            <p className="text-muted-foreground">Search results will appear here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
