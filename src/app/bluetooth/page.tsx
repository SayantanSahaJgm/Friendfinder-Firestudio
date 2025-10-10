import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bluetooth } from "lucide-react";

export default function BluetoothPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bluetooth className="h-6 w-6 text-primary" />
            <CardTitle>Bluetooth</CardTitle>
          </div>
          <CardDescription>Bluetooth feature page.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
            <p className="text-muted-foreground">Bluetooth feature coming soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
