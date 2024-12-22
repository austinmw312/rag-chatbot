import { Button } from "./ui/button";
import { Plus, Trash2 } from "lucide-react";

export function FileUpload() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Files</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add File
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Example file card */}
        <div className="group relative rounded-lg border p-4">
          <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
            <Button variant="ghost" size="icon">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="aspect-[3/4] rounded-md bg-muted" />
          <p className="mt-2 text-sm font-medium">document.pdf</p>
        </div>
      </div>
    </div>
  );
} 