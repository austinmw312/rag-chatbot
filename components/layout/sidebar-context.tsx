"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface SidebarContextType {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  
  // Check screen size and localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarOpen");
    const isMobile = window.innerWidth < 1024;
    
    // On mobile, always start closed
    // On desktop, use saved state or default to open
    setIsOpen(isMobile ? false : savedState !== "false");
    
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Save state to localStorage (only on desktop)
  useEffect(() => {
    if (window.innerWidth >= 1024) {
      localStorage.setItem("sidebarOpen", isOpen.toString());
    }
  }, [isOpen]);

  const toggle = () => setIsOpen(prev => !prev);
  const close = () => setIsOpen(false);

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, close }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within SidebarProvider");
  return context;
} 