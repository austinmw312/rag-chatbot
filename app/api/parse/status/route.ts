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
      .from('files')
      .select('parsed_status')
      .eq('id', fileId)
      .single();

    if (error) throw error;

    return NextResponse.json({
      parsed: data.parsed_status
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check parse status' },
      { status: 500 }
    );
  }
} 