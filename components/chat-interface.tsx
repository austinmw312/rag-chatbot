import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";

export function ChatInterface() {
  return (
    <>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* Messages will go here */}
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm">Hello! How can I help you today?</p>
          </div>
        </div>
      </ScrollArea>
      <div className="border-t p-4">
        <form className="flex gap-4">
          <Input
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit">Send</Button>
        </form>
      </div>
    </>
  );
} 