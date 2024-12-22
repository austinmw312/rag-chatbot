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
        `You are a helpful assistant that only uses the provided context to answer questions. 
         If you cannot find the specific information related to the question in the context, you must disclose this to the user.
         After you have disclosed this, you may try to answer the question using your general knowledge if you have it.
         
         Context: {context}`,
      ],
      ["placeholder", "{messages}"],
    ]);

    // Define the function that processes messages and calls the model
    const callModel = async (state: typeof GraphAnnotation.State) => {
      // Get relevant context
      const lastMessage = state.messages[state.messages.length - 1];
      const messageText = typeof lastMessage.content === 'string' 
        ? lastMessage.content 
        : lastMessage.content.map(c => 'text' in c ? c.text : '').join(' ');
      
      // Query RAG with message and last context
      const searchText = `${messageText} ${this.lastContext.map(doc => doc.pageContent).join(' ')}`;
      const context = await this.rag.query(searchText);
      
      // Trim messages to manage context window
      const trimmedMessages = await messageTrimmer.invoke(state.messages);
      
      // Format prompt with current state
      const prompt = await promptTemplate.invoke({
        messages: trimmedMessages,
        context: context.map(doc => doc.pageContent).join("\n\n"),
      });
      
      // Get response from LLM
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
  async addDocuments(texts: string[]) {
    await this.rag.addDocuments(texts);
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

    // Convert previous messages to the format expected by the bot
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
    
    return response.messages[response.messages.length - 1];
  }

  createThread(): string {
    return uuidv4();
  }
}
