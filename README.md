# RAG Chatbot Project

Thanks for checking out my project! This is a Retrieval Augmented Generation (RAG) chatbot that can understand and discuss any documents you upload, with support for dozens of document types.

Try out out the deployed project [here](https://rag-chatbot-pearl.vercel.app/).

## How it Works

When you upload a document, the system:

1. Parses the document into markdown using LlamaParse
2. Splits it into chunks and generates embeddings using OpenAI
3. Stores and indexes these embeddings in a Postgres vector database
4. Performs similarity search to retrieve relevant context when you ask questions

## Tech Stack

- **Frontend:** Next.js, TypeScript, Tailwind CSS
- **Backend:** Supabase, PostgreSQL with pgvector, Langchain
- **AI:** OpenAI embeddings, GPT-4
- **Document Processing:** LlamaParse

## Project Structure

### Core Components

- `app/api/chat/route.ts` - API endpoint handling chat interactions
- `app/api/parse/route.ts` - API endpoint for document parsing
- `backend/bot.ts` - Core chatbot logic and RAG implementation
- `backend/parse.ts` - Document parsing and text extraction
- `backend/rag.ts` - RAG system implementation with vector search

### Frontend Components

- `components/chat-interface.tsx` - Main chat UI with message display and input
- `components/chat-context.tsx` - React context for chat state management
- `components/file-upload.tsx` - File upload interface with progress tracking
- `components/file-list.tsx` - List of uploaded documents
- `components/navigation.tsx` - Sidebar navigation
- `components/suggested-prompts.tsx` - Contextual prompt suggestions

### UI Components

- `components/ui/*` - Reusable UI components (buttons, inputs, etc.)
- `components/theme-provider.tsx` - Dark/light theme management

### Utilities

- `lib/supabaseClient.ts` - Supabase client configuration
- `lib/utils.ts` - Shared utility functions

## Key Features

1. **Document Processing**
   - Multi-format document support (PDF, DOCX, XLSX, CSV, etc.)
   - Automatic text extraction and parsing
   - Vector embedding generation

2. **Chat Interface**
   - Real-time message updates
   - Markdown rendering
   - Copy-to-clipboard functionality
   - Loading states and animations

3. **File Management**
   - Drag-and-drop upload
   - Progress tracking
   - File type validation
   - Document list with status

4. **RAG System**
   - Vector similarity search
   - Context-aware responses
   - Document chunk management
   - Conversation history tracking

## Data Flow

1. User uploads document → Parsed to text → Embedded → Stored in vector DB
2. User sends message → Relevant context is retrieved → Combined with prompt → AI response
3. Response displayed → Added to chat history → Ready for next interaction


Austin Weideman
2024