"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import ReactMarkdown from 'react-markdown';
import { useChatContext } from './chat-context';
import { SuggestedPrompts } from "./suggested-prompts";

export function ChatInterface() {
  const { messages, addMessage } = useChatContext();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string>();

  async function handleSubmit(e: React.FormEvent | string) {
    if (typeof e !== 'string') {
      e.preventDefault();
    }

    const messageText = typeof e === 'string' ? e : input;
    
    if (!messageText.trim() || isLoading) return;

    setInput("");
    setIsLoading(true);

    addMessage({ role: 'user', content: messageText.trim() });

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: messageText.trim(),
          threadId: threadId,
          messages: messages
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      
      setThreadId(data.threadId);
      addMessage({ role: 'assistant', content: data.message });
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSelectPrompt = (prompt: string) => {
    handleSubmit(prompt);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message, i) => (
              <div
                key={i}
                className={`rounded-lg p-4 ${
                  message.role === "user" 
                    ? "bg-primary text-black ml-12"
                    : "bg-muted mr-12"
                }`}
              >
                <ReactMarkdown 
                  className={`text-sm prose dark:prose-invert max-w-none ${
                    message.role === "user" ? "!text-black" : ""
                  }`}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            ))}
            {isLoading && (
              <div className="bg-muted rounded-lg p-4 mr-12">
                <p className="text-sm">Thinking...</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      
      <SuggestedPrompts 
        onSelectPrompt={handleSelectPrompt} 
        messageCount={messages.length}
      />
      <div className="p-4 border-t">
        <form className="flex gap-4" onSubmit={handleSubmit}>
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
} 