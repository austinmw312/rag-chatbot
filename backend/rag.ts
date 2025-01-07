import { OpenAIEmbeddings } from "@langchain/openai";
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { supabase } from "@/lib/supabaseClient";

export class RAGBot {
  private vectorStore!: PGVectorStore;
  private embeddings: OpenAIEmbeddings;
  
  constructor() {
    this.embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-small"
    });
  }

  async initialize() {
    const db_url = `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:5432/${process.env.POSTGRES_DATABASE}?sslmode=require`;

    this.vectorStore = await PGVectorStore.initialize(
      this.embeddings,
      {
        postgresConnectionOptions: {
          connectionString: db_url
        },
        tableName: 'embeddings',
        columns: {
          idColumnName: 'id',
          vectorColumnName: 'embedding',
          contentColumnName: 'content_chunk',
          metadataColumnName: 'metadata',
        },
        filter: {
          whereClause: "file_id = $1"
        }
      }
    );
  }

  async addDocuments(texts: string[], fileId: string) {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 3000,
      chunkOverlap: 500,
      separators: ["\n\n", "\n", ".", "!", "?", ",", " ", ""],
    });

    const documents = texts.map(text => new Document({ 
      pageContent: text,
      metadata: {
        file_id: fileId
      }
    }));

    const splits = await splitter.splitDocuments(documents);
    
    // First, get the current max id before adding documents
    const { data: maxResult } = await supabase
      .from('embeddings')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);
    
    const startId = maxResult?.[0]?.id || 0;

    // Add documents normally
    await this.vectorStore.addDocuments(splits);

    // Update all new embeddings with the file_id
    await supabase
      .from('embeddings')
      .update({ file_id: fileId })
      .gt('id', startId);  // Only update the new ones we just added
  }

  async query(question: string, numResults: number = 6): Promise<Document[]> {
    const results = await this.vectorStore.similaritySearch(question, numResults);
    console.log("\nRetrieved contexts:");
    results.forEach((doc, i) => {
      console.log(`\n[${i + 1}] Chunk ${i + 1}`);
      console.log(`${doc.pageContent.substring(0, 150)}...`);
    });
    return results;
  }
} 