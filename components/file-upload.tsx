"use client";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { FileIcon, UploadCloud, Loader2 } from "lucide-react";
import { FileList } from "@/components/file-list";
import { FileItem } from "@/types";

const ALLOWED_FILE_TYPES = [
  // Base types
  '.pdf',
  
  // Documents and presentations
  '.doc', '.docx', '.docm', '.dot', '.dotm',
  '.ppt', '.pptx', '.pptm', '.pot', '.potm', '.potx',
  '.rtf', '.txt', '.epub',
  
  // Spreadsheets
  '.xlsx', '.xls', '.xlsm', '.xlsb', '.csv',
  '.numbers', '.ods', '.tsv'
];

// Update the accept attribute in file input
const acceptString = ALLOWED_FILE_TYPES.join(',');

export function FileUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'parsing'>('idle');
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const [parsingFileId, setParsingFileId] = useState<string | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    if (!parsingFileId) return;

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/parse/status?fileId=${parsingFileId}`);
        const { parsed } = await response.json();

        if (parsed) {
          setParsingFileId(null);
          toast({
            title: "File processed successfully",
            description: "Your file has been parsed and is ready to use.",
          });
        }
      } catch (error) {
        console.error('Error checking parse status:', error);
      }
    };

    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, [parsingFileId, toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      setStatus('uploading');
      setUploading(true);
      
      // Upload file to Supabase Storage
      const filePath = `${Date.now()}-${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // Add metadata to files table
      const { data: fileData, error: dbError } = await supabase
        .from('files')
        .insert({
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type,
          parsed_status: false
        })
        .select('id')
        .single();

      if (dbError) throw dbError;
      
      // Before parsing starts
      setStatus('parsing');
      
      // Trigger parsing
      const parseResponse = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: fileData.id,
          bucketPath: filePath
        })
      });

      if (!parseResponse.ok) {
        throw new Error('Failed to start parsing');
      }

      setParsingFileId(fileData.id);
      await fetchFiles();
      
      toast({
        title: "File uploaded successfully",
        description: "Your file is being processed...",
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
      setStatus('idle');
    }
  };

  // Update the status display
  const getStatusText = () => {
    switch(status) {
      case 'uploading': return "Uploading...";
      case 'parsing': return "Parsing...";
      default: return "Ready to upload";
    }
  };

  return (
    <div className="space-y-8">
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-4">
          <Input
            type="file"
            onChange={handleFileSelect}
            accept={acceptString}
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
                  {status !== 'idle' && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {getStatusText()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <FileList files={files} onFilesChange={fetchFiles} />
    </div>
  );
} 