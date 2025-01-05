Next steps:
- Implement Supabase and PGVector integration
- Detailed instructions are in instructions.md
- Note that we are on a new branch for the supabase integration, so we eventually will need to merge that into main
- If anything gets messed up, we can just go back to the main branch and start over

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