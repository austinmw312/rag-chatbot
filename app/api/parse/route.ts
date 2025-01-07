import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// Change to edge runtime
export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { fileId, bucketPath } = await req.json();
    console.log('\n=== Starting Parse Request ===');
    console.log('FileID:', fileId);
    console.log('BucketPath:', bucketPath);

    if (!fileId || !bucketPath) {
      return NextResponse.json(
        { error: 'fileId and bucketPath are required' },
        { status: 400 }
      );
    }

    // Download file from Supabase
    console.log('Downloading file from Supabase...');
    const { data, error } = await supabase.storage
      .from('files')
      .download(bucketPath);

    if (error) {
      console.error('Supabase download error:', error);
      throw error;
    }
    console.log('File downloaded successfully');

    // Start the parsing job
    console.log('Preparing FormData for LlamaParse...');
    const formData = new FormData();
    formData.append('file', new Blob([await data.arrayBuffer()]), bucketPath);

    console.log('Calling LlamaParse API...');
    const uploadResponse = await fetch('https://api.cloud.llamaindex.ai/api/parsing/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.LLAMA_CLOUD_API_KEY}`
      },
      body: formData
    });

    if (!uploadResponse.ok) {
      console.error('LlamaParse API error:', await uploadResponse.text());
      throw new Error('Failed to start parsing job');
    }

    const responseData = await uploadResponse.json();
    console.log('LlamaParse Response:', responseData);
    const job_id = responseData.id;

    if (!job_id) {
      console.error('No job ID received from LlamaParse');
      throw new Error('Failed to get job ID from LlamaParse');
    }

    console.log('Parse job started successfully. Job ID:', job_id);
    console.log('=== End Parse Request ===\n');

    return NextResponse.json({ 
      success: true,
      job_id
    });

  } catch (error) {
    console.error('Parse error:', error);
    return NextResponse.json(
      { error: 'Failed to parse file' },
      { status: 500 }
    );
  }
} 