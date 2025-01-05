import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(req: NextRequest) {
  try {
    const fileId = req.nextUrl.searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json(
        { error: 'fileId is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('file_contents')
      .select('content')
      .eq('file_id', fileId)
      .single();

    if (error) throw error;

    return NextResponse.json({
      content: data.content
    });

  } catch (error) {
    console.error('Results fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch parsed content' },
      { status: 500 }
    );
  }
} 