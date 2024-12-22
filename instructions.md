# Instructions

## Frontend

The frontend user interface will consist of a chat interface and a file upload and management interface.

### Chat Interface

The chat interface will be a modern chat interface used for most AI chatbots. We will use Tailwind CSS, Shadcn UI, and Lucide Icons. It will be in dark mode.

The chat will be a Retrieval Augmented Generation (RAG) chatbot. It will use the files uploaded to the database to answer questions.

Relevant files for RAG:

./backend/bot.ts
./backend/rag.ts
./backend/test.ts
./backend/parse.ts

Our current implementation of RAG is in ./backend. It takes files from ./data and parses them into markdown files, storing them in ./markdown. It uses the resulting files in ./markdown to answer questions.

### File Upload and Management Interface

The file upload and management interface will be a modern interface used for most file upload and management interfaces. We will use Tailwind CSS, Shadcn UI, and Lucide Icons. It will be in dark mode, matching the chat interface.

It will be on a separate page from the chat interface, and the user can toggle between the two using a tab in the top left. The file upload page will have an add button that will open a file upload dialog. Files will be uploaded to the database and then the user will be able to chat with the files.

The file upload page will display a preview of each file uploaded, with the option to open the file and preview it / scroll through it, and the option to delete the file using a trash icon in the top right of each file that appears on hover over the file.

In the backend, we will parse each file using LlamaParse (which parses PDFs and other files into markdown) and then we will store the resulting markdown files in the database.

./backend/parse.ts is our current implementation of LlamaParse. It takes the files in ./data and parses them into markdown files in ./markdown.

The markdown files will be used to do Retrieval Augmented Generation (RAG) with the chatbot.


Current file structure:
.
├── README.md
├── app
│   ├── favicon.ico
│   ├── files
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── backend
│   ├── bot.ts
│   ├── parse.ts
│   ├── rag.ts
│   └── test.ts
├── components
│   ├── chat-interface.tsx
│   ├── file-upload.tsx
│   ├── navigation.tsx
│   ├── theme-provider.tsx
│   └── ui
│       ├── button.tsx
│       ├── input.tsx
│       └── scroll-area.tsx
├── components.json
├── data
│   └── canada.pdf
├── eslint.config.mjs
├── instructions.md
├── lib
│   └── utils.ts
├── markdown
│   └── canada.md
├── next-env.d.ts
├── next.config.ts
├── notes.md
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json