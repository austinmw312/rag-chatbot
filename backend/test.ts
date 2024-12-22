import { Chatbot } from "./bot";
import dotenv from "dotenv";
import path from "path";
import readline from "readline";
import fs from "fs/promises";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function loadMarkdownFiles() {
  const markdownDir = "./markdown";
  const files = await fs.readdir(markdownDir);
  const markdownFiles = files.filter(file => file.endsWith('.md'));
  
  const documents = await Promise.all(
    markdownFiles.map(async file => {
      const content = await fs.readFile(path.join(markdownDir, file), 'utf-8');
      return content;
    })
  );
  
  return documents;
}

async function startChat() {
  const bot = new Chatbot();
  await bot.initialize();

  // Load all markdown documents
  const documents = await loadMarkdownFiles();
  await bot.addDocuments(documents);
  
  console.log(`Loaded ${documents.length} markdown documents as context.`);

  const threadId = bot.createThread();
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log("Chat started! Type 'exit' to end the conversation.");
  console.log("Bot: Hello! How can I help you today?");

  const chat = async () => {
    rl.question("You: ", async (input) => {
      if (input.toLowerCase() === 'exit') {
        console.log("Bot: Goodbye!");
        rl.close();
        return;
      }

      try {
        const response = await bot.sendMessage(input, threadId);
        console.log("Bot:", response.content);
        chat();
      } catch (error) {
        console.error("Error:", error);
        rl.close();
      }
    });
  };

  chat();
}

startChat();