"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, PlusSquare, Shuffle, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/map", icon: Map, label: "Map" },
  { href: "/add-post", icon: PlusSquare, label: "Add Post", isCentral: true },
  { href: "/nearby", icon: Users, label: "Nearby" },
  { href: "/random-chat", icon: Shuffle, label: "Random" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 z-40 w-full border-t bg-background/95 backdrop-blur-sm lg:hidden">
      <nav className="container mx-auto flex h-20 max-w-2xl items-center justify-around px-4">
        {navItems.map((item) => {
          const isActive = (pathname === "/" && item.href === "/") || (item.href !== "/" && pathname.startsWith(item.href));
          
          if (item.isCentral) {
            return (
              <Link href={item.href} key={item.href} className="-translate-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105">
                  <item.icon className="h-8 w-8" />
                  <span className="sr-only">{item.label}</span>
                </div>
              </Link>
            );
          }

          return (
            <Link
              href={item.href}
              key={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-2 text-muted-foreground transition-colors hover:text-primary",
                isActive && "text-primary"
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
