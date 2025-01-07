"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Files, Info, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./layout/sidebar-context";
import { Button } from "./ui/button";

export function Navigation() {
  const pathname = usePathname();
  const { isOpen, toggle, close } = useSidebar();

  const handleNavigate = () => {
    if (window.innerWidth < 1024) {
      close();
    }
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 border-b bg-background px-4 flex items-center justify-between z-40">
        <Button variant="ghost" size="icon" onClick={toggle}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="font-semibold">
          {pathname === "/" && "Chat"}
          {pathname === "/files" && "Manage Files"}
          {pathname === "/info" && "Info"}
        </div>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-0 z-50 lg:z-0 lg:w-64",
        isOpen ? "" : "hidden lg:block"
      )}>
        {/* Backdrop for mobile */}
        <div 
          className={cn(
            "fixed inset-0 bg-background/80 backdrop-blur-sm lg:hidden",
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={close}
        />

        {/* Sidebar content */}
        <div className={cn(
          "fixed w-64 top-0 bottom-0 border-r bg-background transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <div className="lg:hidden p-4 border-b flex justify-end">
            <Button variant="ghost" size="icon" onClick={close}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex flex-col gap-4 p-4">
            <Link
              href="/"
              onClick={handleNavigate}
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
              onClick={handleNavigate}
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
              onClick={handleNavigate}
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
      </div>
    </>
  );
} 