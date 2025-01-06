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
    // Get connection string from Supabase
    const { data: { db_url } } = await supabase.rpc('get_db_url');

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

    const documents = texts.map((text, index) => new Document({ 
      pageContent: text,
      metadata: { 
        file_id: fileId,
        chunk_index: index,
        timestamp: Date.now() 
      }
    }));
    const splits = await splitter.splitDocuments(documents);
    
    await this.vectorStore.addDocuments(splits);
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