import { FileUpload } from "@/components/file-upload";

export default function FilesPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Files</h1>
        <p className="text-muted-foreground">
          Upload files to chat with them using RAG. Supported formats: PDF, DOC, DOCX, TXT
        </p>
        <FileUpload />
      </div>
    </div>
  );
} 