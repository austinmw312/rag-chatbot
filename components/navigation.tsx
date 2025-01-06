"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Files, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const pathname = usePathname();

  return (
    <div className="w-64 border-r bg-background">
      <nav className="flex flex-col gap-4 p-4">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:text-foreground",
            pathname === "/" ? "bg-secondary text-foreground" : ""
          )}
        >
          <MessageSquare className="h-5 w-5" />
          <span>Chat</span>
        </Link>
        <Link
          href="/files"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:text-foreground",
            pathname === "/files" ? "bg-secondary text-foreground" : ""
          )}
        >
          <Files className="h-5 w-5" />
          <span>Manage Files</span>
        </Link>
        <Link
          href="/info"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:text-foreground",
            pathname === "/info" ? "bg-secondary text-foreground" : ""
          )}
        >
          <Info className="h-5 w-5" />
          <span>Info</span>
        </Link>
      </nav>
    </div>
  );
} 