import {
    LlamaParseReader,
  } from "llamaindex";
import * as dotenv from 'dotenv'
import { resolve } from 'path'
import * as fs from 'fs/promises'
import * as path from 'path'

// Load environment variables from .env.local file
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

// Get API key from environment variables
const apiKey = process.env.LLAMA_CLOUD_API_KEY

if (!apiKey) {
  throw new Error('LLAMA_CLOUD_API_KEY is not defined in .env.local')
}

async function main() {
  // Read all files from the data directory
  const dataDir = "./data";
  const markdownDir = "./markdown";
  
  // Create markdown directory if it doesn't exist
  await fs.mkdir(markdownDir, { recursive: true });
  
  const files = await fs.readdir(dataDir);
  console.log("Found files:", files);

  // Initialize the PDF reader with API key
  const reader = new LlamaParseReader({ 
    apiKey: apiKey,
    resultType: "markdown" 
  });

  // Process each file
  for (const file of files) {
    const filePath = path.join(dataDir, file);
    const documents = await reader.loadData(filePath);
    
    // Create markdown filename (replace original extension with .md)
    const markdownFilename = path.join(markdownDir, 
      path.basename(file, path.extname(file)) + '.md'
    );
    
    // Save the markdown content
    await fs.writeFile(
      markdownFilename, 
      documents.map(doc => doc.text).join('\n\n'),
      'utf-8'
    );
    
    console.log(`Saved ${markdownFilename}`);
  }
  
  console.log("All documents processed and saved as markdown!");
}

main().catch(console.error);