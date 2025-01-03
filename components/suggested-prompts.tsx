import { Button } from "./ui/button";

interface SuggestedPromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

export function SuggestedPrompts({ onSelectPrompt }: SuggestedPromptsProps) {
  const prompts = [
    "What are some activities I can do in Canada?",
    // Add more example prompts here later
  ];

  return (
    <div className="flex gap-2 mb-4 flex-wrap">
      {prompts.map((prompt) => (
        <Button
          key={prompt}
          variant="secondary"
          className="text-sm"
          onClick={() => onSelectPrompt(prompt)}
        >
          {prompt}
        </Button>
      ))}
    </div>
  );
} 