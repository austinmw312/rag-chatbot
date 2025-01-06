"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import ReactMarkdown from "react-markdown";

interface FilePreviewProps {
  fileId: string;
  fileName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FilePreview({ fileId, fileName, open, onOpenChange }: FilePreviewProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && fileId) {
      const fetchContent = async () => {
        const { data, error } = await supabase
          .from('file_contents')
          .select('content')
          .eq('file_id', fileId)
          .single();

        if (error) {
          console.error('Error fetching content:', error);
          return;
        }

        setContent(data.content);
        setLoading(false);
      };

      fetchContent();
    }
  }, [fileId, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>{fileName}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-full mt-4">
          {loading ? (
            <div className="p-4 text-muted-foreground">Loading content...</div>
          ) : (
            <div className="p-4 prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 