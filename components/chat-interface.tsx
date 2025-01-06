"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import ReactMarkdown from 'react-markdown';
import { useChatContext } from './chat-context';
import { SuggestedPrompts } from "./suggested-prompts";
import { Loader2, Copy, CheckCheck } from "lucide-react";

export function ChatInterface() {
  const { messages, addMessage } = useChatContext();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string>();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

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
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-4">
              <h1 className="text-4xl font-bold tracking-tight">
                RAG Chatbot
              </h1>
              <p className="text-lg text-muted-foreground max-w-sm">
                Upload files and chat with them here using Retrieval Augmented Generation.
                Support for dozens of file types!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, i) => (
              <div
                key={i}
                className={`rounded-lg p-4 ${
                  message.role === "user" 
                    ? "bg-primary text-black ml-12"
                    : "bg-muted mr-12 relative group pr-12"
                }`}
              >
                <ReactMarkdown 
                  className={`text-sm prose dark:prose-invert max-w-none ${
                    message.role === "user" ? "!text-black" : ""
                  }`}
                >
                  {message.content}
                </ReactMarkdown>
                
                {message.role === "assistant" && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(message.content);
                      setCopiedIndex(i);
                      setTimeout(() => setCopiedIndex(null), 2000);
                    }}
                    className="absolute top-4 right-4 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-background transition-all duration-200"
                    aria-label="Copy message"
                  >
                    {copiedIndex === i ? (
                      <CheckCheck className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="bg-muted rounded-lg p-4 mr-12">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p>AI is thinking</p>
                </div>
              </div>
            )}
          </div>
        )}
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