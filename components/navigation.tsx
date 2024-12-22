"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MessageSquare, Files } from "lucide-react";

export function Navigation() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-16 flex-col items-center border-r bg-muted pt-8">
      <Link
        href="/"
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-lg transition-colors hover:bg-muted-foreground/10",
          pathname === "/" && "bg-muted-foreground/20"
        )}
      >
        <MessageSquare className="h-6 w-6" />
      </Link>
      <Link
        href="/files"
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-lg transition-colors hover:bg-muted-foreground/10",
          pathname === "/files" && "bg-muted-foreground/20"
        )}
      >
        <Files className="h-6 w-6" />
      </Link>
    </div>
  );
} 