export default function InfoPage() {
  return (
    <div className="container mx-auto px-8 py-8 max-w-3xl">
      <div className="prose dark:prose-invert">
        <h1>RAG Chatbot Project</h1>
        
        <p className="lead">
          Thanks for checking out my project! This is a Retrieval Augmented Generation (RAG) 
          chatbot that can understand and discuss any documents you upload.
        </p>

        <h2>How it Works</h2>
        <p>
          When you upload a document, the system:
        </p>
        <ol>
          <li>Parses the document into markdown using LlamaParse</li>
          <li>Splits it into chunks and generates embeddings using OpenAI</li>
          <li>Stores and indexes these embeddings in a Postgres vector database</li>
          <li>Performs similarity search to retrieve relevant context when you ask questions</li>
        </ol>

        <h2>Tech Stack</h2>
        <ul>
          <li><strong>Frontend:</strong> Next.js, TypeScript, Tailwind CSS</li>
          <li><strong>Backend:</strong> Supabase, PostgreSQL with pgvector</li>
          <li><strong>AI:</strong> OpenAI embeddings, GPT-4o, LangChain</li>
          <li><strong>Document Processing:</strong> LlamaParse</li>
        </ul>

        <div className="mt-16 pt-8 border-t text-sm text-muted-foreground text-center space-y-1">
          <div>Austin Weideman</div>
          <div>2024</div>
        </div>
      </div>
    </div>
  );
} 