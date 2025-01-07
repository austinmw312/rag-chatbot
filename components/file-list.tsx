"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { FileIcon, Trash2Icon, EyeIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { FilePreview } from "./file-preview";
import { FileItem } from "@/types";

interface FileListProps {
  files: FileItem[];
  onFilesChange: () => Promise<void>;
}

const SAMPLE_FILES = [
  'volcano_FAQs.pdf',
  'whales_facts.pdf',
  'canada_fun_facts.pdf'
];

export function FileList({ files, onFilesChange }: FileListProps) {
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [previewFile, setPreviewFile] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleDelete = async (id: number, fileName: string) => {
    if (isSampleFile(fileName)) {
      toast({
        title: "Cannot delete sample file",
        description: "This is a sample file and cannot be deleted.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('files')
        .remove([fileName]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      // Update UI
      await onFilesChange();
      
      toast({
        title: "File deleted",
        description: "The file has been removed successfully.",
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Error",
        description: "Failed to delete the file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isSampleFile = (fileName: string) => {
    return SAMPLE_FILES.includes(fileName);
  };

  if (loading) {
    return <div className="p-4 text-sm text-muted-foreground">Loading files...</div>;
  }

  if (files.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No files uploaded yet
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {files.map((file) => (
        <div
          key={file.id}
          className="border border-border bg-card rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="bg-secondary p-2 rounded-md">
                <FileIcon className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${file.parsed_status ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <span className="text-xs text-muted-foreground">
                    {file.parsed_status ? 'Parsed' : 'Processing'}
                  </span>
                </div>
                {isSampleFile(file.name) && (
                  <span className="text-xs text-blue-500">Sample File</span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-primary"
                onClick={() => setPreviewFile({ id: file.id.toString(), name: file.name })}
              >
                <EyeIcon className="h-4 w-4" />
              </Button>
              {!isSampleFile(file.name) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(file.id, file.name)}
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}

      {previewFile && (
        <FilePreview
          fileId={previewFile.id}
          fileName={previewFile.name}
          open={!!previewFile}
          onOpenChange={(open) => !open && setPreviewFile(null)}
        />
      )}
    </div>
  );
} 