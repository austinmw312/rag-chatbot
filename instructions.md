# Instructions

## Frontend

The frontend user interface will consist of a chat interface and a file upload and management interface.

### Chat Interface

The chat interface will be a modern chat interface used for most AI chatbots. We will use Tailwind CSS, Shadcn UI, and Lucide Icons. It will be in dark mode.

The chat will be a Retrieval Augmented Generation (RAG) chatbot. It will use the files uploaded to the database to answer questions.

### File Upload and Management Interface

The file upload and management interface will be a modern interface used for most file upload and management interfaces. We will use Tailwind CSS, Shadcn UI, and Lucide Icons. It will be in dark mode, matching the chat interface.

It will be on a separate page from the chat interface, and the user can toggle between the two using a tab in the top left. The file upload page will have an add button that will open a file upload dialog. Files will be uploaded to the database and then the user will be able to chat with the files.

The file upload page will display a preview of each file uploaded, with the option to open the file and preview it / scroll through it, and the option to delete the file using a trash icon in the top right of each file that appears on hover over the file.

In the backend, we will parse each file using LlamaParse (which parses PDFs and other files into markdown) and then we will store the resulting markdown files in the database.

The markdown files will be used to do Retrieval Augmented Generation (RAG) with the chatbot.

# File Upload Implementation Plan with Supabase

1. **Setup & Configuration**
   - Install Supabase client: `@supabase/supabase-js`
   - Create a Supabase project and set up public storage bucket for files
   - Configure RLS policies for anonymous access
   - Add Supabase anon key to `.env.local` (no auth needed)
   - Create a utils file for Supabase client: `lib/supabase.ts`

2. **Database Structure**
   - Create two tables in Supabase:
     - `files`: storing file metadata (id, name, size, type, created_at, parsed_status)
     - `file_contents`: storing parsed markdown content (id, file_id, content)

3. **File Upload Flow**
   Files to update:
   - `components/file-upload.tsx`:
     - Add drag-and-drop or file picker
     - Handle file upload to Supabase storage
     - Show upload progress
     - Trigger parsing after upload

   - `app/api/upload/route.ts`:
     - Create new API endpoint
     - Handle file upload validation
     - Store file metadata in Supabase
     - Trigger parsing process

   - `backend/parse.ts`:
     - Modify to work with Supabase storage
     - Download file from Supabase
     - Parse with LlamaParse
     - Store resulting markdown in `file_contents` table

   New files to create for parsing flow:
   - `lib/parser.ts`:
     - Port working logic from existing parse.ts
     - Add Supabase integration
     - Keep same LlamaParse configuration that works
     - Handle temp file management

   - `app/api/parse/route.ts`:
     - Force Node.js runtime with `export const runtime = 'nodejs'`
     - Use existing LlamaParse setup that works
     - Download from Supabase to temp directory
     - Use parser service
     - Clean up temp files

   - `app/api/parse/status/route.ts`:
     - Simple endpoint to check parsed_status in files table
     - Can run in Edge runtime

   - `app/api/parse/results/route.ts`:
     - Simple endpoint to fetch parsed content from file_contents
     - Can run in Edge runtime

   Parsing Process Flow:
   1. File uploaded to Supabase storage
   2. Frontend calls Node.js parse API with file details
   3. Parser (running in Node.js):
      - Creates temp directory
      - Downloads file from Supabase to temp
      - Uses existing working LlamaParse logic
      - Stores result in file_contents table
      - Updates parsed_status in files table
      - Cleans up temp directory
   4. Frontend polls status endpoint until complete

4. **File Management Interface**
   Files to update:
   - `app/files/page.tsx`:
     - Fetch file list from Supabase
     - Display file grid with previews
     - Add delete functionality
     - Add file preview modal

   - `components/file-preview.tsx` (new):
     - Create preview component
     - Fetch and display markdown content
     - Handle different file types

5. **RAG Integration**
   Files to update:
   - `backend/rag.ts`:
     - Modify to fetch documents from Supabase
     - Update vector store with database content
     - Maintain synchronization with uploaded files

   - `backend/bot.ts`:
     - Ensure bot can access Supabase stored content
     - Update context handling for database-stored files

6. **User Experience**
   - Add loading states during upload/parsing
   - Show parsing status for each file
   - Add error handling
   - Implement file deletion with cascade (storage + database)

7. **Security & Optimization**
   - Add file type validation
   - Implement file size limits
   - Configure public RLS policies for anonymous access
   - Set up periodic cleanup of old files
   - Configure storage quotas
   - Add rate limiting for uploads
   - Implement shared access to all uploaded files

# Vector Database Implementation with Supabase pgvector

1. **Setup & Configuration**
   - Enable pgvector extension in Supabase project (in 'extensions' schema)
   - Create embeddings table in public schema:
     ```
     - id (bigint, primary key)
     - file_id (uuid, references files)
     - content_chunk (text)
     - metadata (jsonb)
     - embedding (vector(1536))  // OpenAI dimensions
     ```
   - Set up HNSW index for efficient similarity search:
     - Makes pgvector's similarity operations fast
     - Used automatically by LangChain's queries
     - Essential for performance at scale
   - Configure cascade deletes for file management
   - Use existing Supabase connection from `lib/supabaseClient.ts`

2. **Vector Store Migration**
   Files to update:
   - `backend/rag.ts`:
     - Replace MemoryVectorStore with PGVectorStore
     - Keep using OpenAI embeddings (1536 dimensions)
     - Configure PGVectorStore with Supabase connection string
     - Update document fetching to use file_contents table
     - Keep existing document splitting logic
     - Keep existing metadata handling
     - Keep using similaritySearch() (now backed by pgvector)

3. **Process Flow**
   ```
   1. Content stored in file_contents table
   2. RAGBot fetches content from Supabase
   3. Uses existing OpenAI embeddings
   4. Stores vectors in pgvector via PGVectorStore
   5. LangChain similaritySearch() generates SQL
   6. pgvector uses HNSW index for fast lookup
   ```

4. **Performance Optimization**
   - HNSW index automatically used by pgvector when LangChain queries
   - Keep existing chunk sizes and overlap settings
   - Configure proper batch sizes for vector operations

This implementation:
- Uses Supabase pgvector for persistent vector storage
- Keeps existing OpenAI embeddings
- Uses existing Supabase connection
- Maintains current document processing logic
- Uses HNSW index under the hood for speed
- Just changes where we get/store content

Benefits:
- Persistent vector storage (no more in-memory)
- Fast similarity search via HNSW + pgvector
- Minimal changes to existing code
- Keeps working OpenAI integration
- Uses existing Supabase authentication
- Efficient scaling with indexed searches

# Branch Management

These Supabase and pgvector implementations are being developed in a separate branch: feature/supabase-integration

If you need to revert to the local implementation:
1. Switch back to main branch:
   ```bash
   git checkout main
   ```

2. If you need to start fresh with Supabase implementation:
   ```bash
   git checkout main
   git branch -D feature/supabase-integration
   git checkout -b feature/supabase-integration
   ```

This allows us to maintain a working local implementation while developing the Supabase integration. The local implementation uses file system storage and MemoryVectorStore, while the Supabase branch will implement cloud storage and pgvector.
