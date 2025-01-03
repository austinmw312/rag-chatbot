import { Button } from "./ui/button";
import { useState } from "react";

interface SuggestedPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  messageCount: number;
}

export function SuggestedPrompts({ onSelectPrompt, messageCount }: SuggestedPromptsProps) {
  const [isVisible, setIsVisible] = useState(true);

  const prompts = [
    "What are some activities I can do in Canada?",
    "What is Canada's Great Trail?",
    "Summarize the document about Canada.",
  ];

  const handlePromptClick = (prompt: string) => {
    onSelectPrompt(prompt);
    setIsVisible(false);
  };

  // Hide if there are any messages or if manually hidden
  if (!isVisible || messageCount > 0) return null;

  return (
    <div className="flex gap-2 mb-4 flex-wrap px-4 pb-4 justify-center">
      {prompts.map((prompt) => (
        <Button
          key={prompt}
          variant="secondary"
          className="text-sm w-[200px] h-auto whitespace-normal text-left p-4"
          onClick={() => handlePromptClick(prompt)}
        >
          {prompt}
        </Button>
      ))}
    </div>
  );
} 