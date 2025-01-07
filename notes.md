Next steps:
- Stream responses from LLM, or simulate streaming with animation
- Make it so users cannot delete the sample documents, but they can delete their own documents
- Maybe implement PDF viewer, research how to do it
- Toggle dark mode and light mode
- Make mobile friendly


```
import PGVectorStore from "@langchain/community/vectorstores/pgvector";

const vectorStore = await PGVectorStore.initialize(embeddings, {})
```

- File types?
- How to store in database? Map PDF to markdown?
- Conversation history?
- Should users be able to select specific documents to chat with, or will it always use all documents?
- Supabase?
- 



Git commands:

# See commit history
git log
Press Q to exit

# Reset to a commit (replace with desiredcommit hash)
git reset --hard 06162cda88a57822817eb3c24edc5eb0a2d4c979

# Remove all untracked files and directories to go back to exactly how the commit was
git clean -fd