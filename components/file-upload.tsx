"use client";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function FileUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

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
      
      setSelectedFile(null);
    } catch (error: any) {
      console.error('Error uploading file:', error.message || error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4">
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
        >
          {uploading ? "Uploading..." : "Upload"}
        </Button>
      </div>
      {selectedFile && (
        <p className="mt-2 text-sm text-muted-foreground">
          Selected: {selectedFile.name}
        </p>
      )}
    </div>
  );
} 