import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export class RAGBot {
  private vectorStore!: MemoryVectorStore;
  private embeddings: OpenAIEmbeddings;
  
  constructor() {
    this.embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-small"
    });
  }

  async initialize() {
    this.vectorStore = new MemoryVectorStore(this.embeddings);
  }

  async addDocuments(texts: string[]) {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 3000,
      chunkOverlap: 500,
      separators: ["\n\n", "\n", ".", "!", "?", ",", " ", ""],
    });

    const documents = texts.map((text, index) => new Document({ 
      pageContent: text,
      metadata: { 
        docId: index,
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