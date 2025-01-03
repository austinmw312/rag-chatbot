import { ChatInterface } from "@/components/chat-interface";

export default function Home() {
  return (
    <div className="flex h-screen flex-col">
      <div className="container mx-auto max-w-3xl flex-1 relative">
        <div className="absolute inset-0 flex flex-col">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}
