import { ChatOpenAI } from "@langchain/openai";
import {
  START,
  END,
  MessagesAnnotation,
  StateGraph,
  MemorySaver,
  Annotation,
} from "@langchain/langgraph";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { trimMessages } from "@langchain/core/messages";
import { v4 as uuidv4 } from "uuid";
import { RAGBot } from "./rag";
import { Document } from "@langchain/core/documents";

// Define custom state that includes messages and context
const GraphAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  context: Annotation<Document[]>(),
});

// Create a message trimmer to manage conversation history
const messageTrimmer = trimMessages({
  maxTokens: 1000,
  strategy: "last",
  tokenCounter: (msgs) => msgs.length,
  includeSystem: true,
  allowPartial: false,
  startOn: "human",
});

// Add this utility function at the top level
function logChatGroup(message: string, contexts: Document[], aiResponse: string) {
  console.log("\n_____");
  console.log("\nUser Message:");
  console.log(message);
  
  console.log("\nRetrieved Contexts:");
  contexts.forEach((doc, i) => {
    console.log(`\n[${i + 1}] ${doc.pageContent.substring(0, 150)}...`);
  });
  
  console.log("\nAI Response:");
  console.log(aiResponse);
  console.log("\n_____\n");
}

export class Chatbot {
  private app!: ReturnType<typeof StateGraph.prototype.compile>;
  private llm: ChatOpenAI;
  private rag: RAGBot;
  private lastContext: Document[] = []; // Store last context

  constructor() {
    this.llm = new ChatOpenAI({
      modelName: "chatgpt-4o-latest",
      temperature: 0.7,
    });
    this.rag = new RAGBot();
  }

  async initialize() {
    await this.rag.initialize();

    // Create the prompt template with context
    const promptTemplate = ChatPromptTemplate.fromMessages([
      [
        "system",
        `You are a helpful RAG (Retrieval Augmented Generation) assistant that only uses the provided context to answer user questions.
         If you find relevant information in the context, you should say something like 'The provided context states...' and then provide the answer to the user's question.
         If you cannot find information related to the user's question in the context, you must disclose this to the user. Example: 'The provided context does not contain any information related to [their question].'
         After you disclose this, you may try to answer the question using your general knowledge if you have it.
         
         Important: Only answer the most recent user message. Do not try to answer previous messages.
         
         Context: {context}`,
      ],
      ["placeholder", "{messages}"],
    ]);

    // Define the function that processes messages and calls the model
    const callModel = async (state: typeof GraphAnnotation.State) => {
      // Get only the latest message
      const lastMessage = state.messages[state.messages.length - 1];
      const messageText = typeof lastMessage.content === 'string' 
        ? lastMessage.content 
        : lastMessage.content.map(c => 'text' in c ? c.text : '').join(' ');
      
      // Query RAG with only the current message
      const context = await this.rag.query(messageText);
      
      // Only include the last few messages for context
      const recentMessages = state.messages.slice(-3); // Keep last 3 messages for context
      const trimmedMessages = await messageTrimmer.invoke(recentMessages);
      
      const prompt = await promptTemplate.invoke({
        messages: trimmedMessages,
        context: context.map(doc => doc.pageContent).join("\n\n"),
      });
      
      const response = await this.llm.invoke(prompt);
      return { messages: [response], context };
    };

    // Create the graph workflow
    const workflow = new StateGraph(GraphAnnotation)
      .addNode("model", callModel)
      .addEdge(START, "model")
      .addEdge("model", END);

    // Compile the workflow with memory
    this.app = workflow.compile({ checkpointer: new MemorySaver() });
  }

  /**
   * Add documents to the RAG system
   */
  async addDocuments(texts: string[], fileId: string) {
    await this.rag.addDocuments(texts, fileId);
  }

  /**
   * Send a message to the chatbot
   */
  async sendMessage(message: string, threadId?: string, previousMessages: Array<{role: string, content: string}> = []) {
    const config = {
      configurable: {
        thread_id: threadId || uuidv4(),
      },
    };

    const allMessages = [
      ...previousMessages,
      {
        role: "user",
        content: message,
      },
    ];

    const input = {
      messages: allMessages,
    };

    const response = await this.app.invoke(input, config);
    this.lastContext = response.context || [];
    
    // Add logging here
    const aiResponse = response.messages[response.messages.length - 1].content;
    logChatGroup(message, this.lastContext, aiResponse);
    
    return response.messages[response.messages.length - 1];
  }

  createThread(): string {
    return uuidv4();
  }
}
