import { NextRequest, NextResponse } from 'next/server';
import { Chatbot } from '@/backend/bot';

// Force Node.js runtime
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { content, fileId } = await req.json();

    console.log('\n=== Creating Embeddings ===');
    console.log('FileID:', fileId);
    console.log('Content preview:', content.substring(0, 100) + '...');

    const chatbot = new Chatbot();
    await chatbot.initialize();
    await chatbot.addDocuments([content], fileId);

    console.log('Embeddings created successfully');
    console.log('=== End Embeddings Creation ===\n');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Embeddings creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create embeddings' },
      { status: 500 }
    );
  }
} 