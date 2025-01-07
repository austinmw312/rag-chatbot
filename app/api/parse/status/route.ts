import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { Chatbot } from '@/backend/bot';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const fileId = req.nextUrl.searchParams.get('fileId');
    const jobId = req.nextUrl.searchParams.get('jobId');

    console.log('\n=== Checking Parse Status ===');
    console.log('FileID:', fileId);
    console.log('JobID:', jobId);

    if (!fileId || !jobId) {
      return NextResponse.json(
        { error: 'fileId and jobId are required' },
        { status: 400 }
      );
    }

    // Check job status
    console.log('Fetching job status from LlamaParse...');
    const statusResponse = await fetch(
      `https://api.cloud.llamaindex.ai/api/parsing/job/${jobId}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.LLAMA_CLOUD_API_KEY}`
        }
      }
    );

    if (!statusResponse.ok) {
      throw new Error('Failed to check job status');
    }

    const statusData = await statusResponse.json();
    console.log('Status Response:', statusData);

    // If not SUCCESS, return early
    if (statusData.status !== 'SUCCESS') {
      return NextResponse.json({ parsed: false });
    }

    // If SUCCESS, process everything and return true
    console.log('Job completed, fetching results...');
    
    const resultResponse = await fetch(
      `https://api.cloud.llamaindex.ai/api/parsing/job/${jobId}/result/markdown`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.LLAMA_CLOUD_API_KEY}`
        }
      }
    );

    if (!resultResponse.ok) {
      console.error('Result fetch failed:', await resultResponse.text());
      throw new Error('Failed to get parsing results');
    }

    const resultData = await resultResponse.json();
    console.log('Result Data:', resultData);
    
    if (!resultData.markdown) {
      console.error('No markdown in result data:', resultData);
      throw new Error('No markdown received from LlamaParse');
    }

    console.log('Content preview:', resultData.markdown.substring(0, 100) + '...');
    console.log('Got results, storing in database...');

    // Store results
    const { error: insertError } = await supabase
      .from('file_contents')
      .insert({
        file_id: fileId,
        content: resultData.markdown
      });

    if (insertError) {
      console.error('Insert error:', insertError);
      throw insertError;
    }

    // After storing content, call embeddings endpoint
    console.log('Triggering embeddings creation...');
    const embeddingsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: resultData.markdown,
        fileId: fileId
      })
    });

    if (!embeddingsResponse.ok) {
      console.error('Failed to create embeddings:', await embeddingsResponse.text());
      throw new Error('Failed to create embeddings');
    }

    // Update status
    const { error: updateError } = await supabase
      .from('files')
      .update({ parsed_status: true })
      .eq('id', fileId);

    if (updateError) {
      console.error('Update error:', updateError);
      throw updateError;
    }

    console.log('Parse completed successfully');
    console.log('=== End Status Check ===\n');
    return NextResponse.json({ parsed: true });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check parse status' },
      { status: 500 }
    );
  }
} 