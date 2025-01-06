import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navigation } from "@/components/navigation";
import { ChatProvider } from "@/components/chat-context";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RAG Chat",
  description: "Chat with your documents using RAG",
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
            <div className="flex h-screen">
              <Navigation />
              <main className="flex-1 overflow-y-auto">
                {children}
              </main>
            </div>
            <Toaster />
          </ChatProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
