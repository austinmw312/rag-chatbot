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
          <li>Includes relevant context in the prompt to the LLM</li>
        </ol>

        <h2>Tech Stack</h2>
        <ul>
          <li><strong>Frontend:</strong> Next.js, TypeScript, Tailwind CSS</li>
          <li><strong>Backend:</strong> Supabase, PostgreSQL with pgvector, Langchain</li>
          <li><strong>AI:</strong> OpenAI embeddings, GPT-4o</li>
          <li><strong>Document Processing:</strong> LlamaParse</li>
        </ul>

        <h2>What I Learned</h2>
        <p>
          Building this project taught me about:
        </p>
        <ul>
          <li>Vector databases and similarity search</li>
          <li>Handling different document types</li>
          <li>Building responsive UIs with Tailwind</li>
          <li>State management in React</li>
          <li>Working with AI APIs</li>
        </ul>
      </div>
    </div>
  );
} 