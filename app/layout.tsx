import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navigation } from "@/components/navigation";
import { ChatProvider } from "@/components/chat-context";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RAG Chatbot",
  description: "Chat with your documents using AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <ChatProvider>
            <SidebarProvider>
              <div className="flex min-h-screen">
                <Navigation />
                <main className="flex-1 lg:pl-64">
                  <div className="h-14 lg:hidden" />
                  {children}
                </main>
              </div>
            </SidebarProvider>
          </ChatProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
