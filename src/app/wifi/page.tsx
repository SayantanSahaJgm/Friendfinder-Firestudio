import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wifi } from "lucide-react";

export default function WifiPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wifi className="h-6 w-6 text-primary" />
            <CardTitle>WiFi</CardTitle>
          </div>
          <CardDescription>WiFi feature page.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
            <p className="text-muted-foreground">WiFi feature coming soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
