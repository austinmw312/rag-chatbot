import { NextRequest, NextResponse } from 'next/server';
import { Parser } from '@/lib/parser';

// Force Node.js runtime
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { fileId, bucketPath } = await req.json();

    if (!fileId || !bucketPath) {
      return NextResponse.json(
        { error: 'fileId and bucketPath are required' },
        { status: 400 }
      );
    }

    const parser = new Parser();
    await parser.parseFile(fileId, bucketPath, process.env.LLAMA_CLOUD_API_KEY!);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Parse error:', error);
    return NextResponse.json(
      { error: 'Failed to parse file' },
      { status: 500 }
    );
  }
} 