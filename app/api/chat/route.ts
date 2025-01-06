import { NextResponse } from "next/server";
import { Chatbot } from "@/backend/bot";

const bot = new Chatbot();
let isInitialized = false;

export async function POST(req: Request) {
  try {
    if (!isInitialized) {
      await bot.initialize();
      isInitialized = true;
    }

    const { message, threadId, messages } = await req.json();
    
    const response = await bot.sendMessage(
      message, 
      threadId,
      messages.slice(0, -1) // Send all previous messages except the last one
    );
    
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