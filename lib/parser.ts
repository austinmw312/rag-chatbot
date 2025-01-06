import { supabase } from '@/lib/supabaseClient';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { Chatbot } from '@/backend/bot';

export class Parser {
  private tempDir: string = '';
  private chatbot: Chatbot;

  constructor() {
    this.chatbot = new Chatbot();
  }

  async parseFile(fileId: string, bucketPath: string, apiKey: string) {
    try {
      await this.chatbot.initialize();

      // Dynamically import LlamaParse only when needed
      const { LlamaParseReader } = await import('llamaindex');
      
      const reader = new LlamaParseReader({
        apiKey,
        resultType: "markdown"
      });

      // Create temp directory
      this.tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'parse-'));
      
      // Download file from Supabase
      const tempFilePath = path.join(this.tempDir, path.basename(bucketPath));
      const { data, error } = await supabase.storage
        .from('files')
        .download(bucketPath);

      if (error) throw error;

      // Save blob to temp file
      await fs.writeFile(tempFilePath, Buffer.from(await data.arrayBuffer()));

      // Parse the file
      const documents = await reader.loadData(tempFilePath);
      const markdownContent = documents.map(doc => doc.text).join('\n\n');

      // Store in file_contents table
      const { error: insertError } = await supabase
        .from('file_contents')
        .insert({
          file_id: fileId,
          content: markdownContent
        });

      if (insertError) throw insertError;

      // Create embeddings from parsed content
      await this.chatbot.addDocuments([markdownContent], fileId);

      // Update parsed_status
      const { error: updateError } = await supabase
        .from('files')
        .update({ parsed_status: true })
        .eq('id', fileId);

      if (updateError) throw updateError;

      return { success: true };

    } catch (error) {
      console.error('Parsing error:', error);
      throw error;
    } finally {
      // Cleanup temp directory
      if (this.tempDir) {
        await fs.rm(this.tempDir, { recursive: true, force: true });
      }
    }
  }
} 