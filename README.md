# RAG Chatbot Project

Thanks for checking out my project! This is a Retrieval Augmented Generation (RAG) chatbot that can understand and discuss any documents you upload.

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

Austin Weideman
2024
