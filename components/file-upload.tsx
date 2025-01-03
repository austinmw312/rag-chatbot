"use client";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { FileIcon, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { FileList } from "@/components/file-list";

export function FileUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      setUploading(true);
      
      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(`${Date.now()}-${selectedFile.name}`, selectedFile);

      if (uploadError) throw uploadError;

      // Add metadata to files table
      const { error: dbError } = await supabase
        .from('files')
        .insert({
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type,
          parsed_status: false
        });

      if (dbError) throw dbError;
      
      toast({
        title: "File uploaded successfully",
        description: `${selectedFile.name} has been uploaded and will be processed.`,
        variant: "default",
      });
      
      setSelectedFile(null);
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error uploading file:', errorMessage);
      
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-4">
          <Input
            type="file"
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.txt"
            className="max-w-xs"
            disabled={uploading}
          />
          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || uploading}
            className="gap-2"
          >
            {uploading ? (
              <>
                <UploadCloud className="h-4 w-4 animate-pulse" />
                Uploading...
              </>
            ) : (
              <>
                <UploadCloud className="h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </div>
        
        {selectedFile && (
          <div className="border border-border bg-card rounded-lg p-4 max-w-md shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-secondary p-2 rounded-md">
                <FileIcon className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full bg-primary transition-all duration-300",
                        uploading ? "animate-pulse w-full" : "w-0"
                      )}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {uploading ? "Uploading..." : "Ready to upload"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <FileList />
    </div>
  );
} 