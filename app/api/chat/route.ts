import { NextResponse } from "next/server";
import { Chatbot } from "@/backend/bot";
import fs from 'fs/promises';
import path from 'path';

const bot = new Chatbot();
let isInitialized = false;

async function loadMarkdownFiles() {
  const markdownDir = path.join(process.cwd(), 'markdown');
  const files = await fs.readdir(markdownDir);
  const markdownFiles = files.filter(file => file.endsWith('.md'));
  
  const contents = await Promise.all(
    markdownFiles.map(async file => {
      const filePath = path.join(markdownDir, file);
      return fs.readFile(filePath, 'utf-8');
    })
  );
  
  return contents;
}

export async function POST(req: Request) {
  try {
    // Initialize bot if not already done
    if (!isInitialized) {
      await bot.initialize();
      // Load and add markdown documents
      const documents = await loadMarkdownFiles();
      await bot.addDocuments(documents);
      isInitialized = true;
    }

    const { message, threadId } = await req.json();
    const response = await bot.sendMessage(message, threadId);
    
    return NextResponse.json({ 
      message: response.content,
      threadId: threadId 
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
} 