import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export default function MapPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Card className="overflow-hidden">
        <CardHeader>
            <div className="flex items-center gap-2">
                <MapPin className="h-6 w-6 text-primary"/>
                <CardTitle>Friend Map</CardTitle>
            </div>
          <CardDescription>See where your friends are and what they're up to.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-muted">
            <Image
              src="https://picsum.photos/seed/map/1200/800"
              alt="Map placeholder"
              fill
              className="object-cover opacity-50"
              data-ai-hint="map city"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <h3 className="text-2xl font-bold text-foreground">Map Coming Soon</h3>
              <p className="mt-2 max-w-md text-muted-foreground">
                We're working on integrating Google Maps to bring this feature to life. You'll be able to see friends as markers on the map.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
