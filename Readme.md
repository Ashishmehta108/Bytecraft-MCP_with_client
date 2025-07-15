# Bytecraft-MCP_with_client

A full-stack AI-powered eCommerce framework integrating a Model Context Protocol (MCP) server and client. This project features **Aira**, an intelligent shopping assistant that handles product discovery, cart management, and contextual recommendations.

---

## 🚀 Features

- **AI Chat Client**: Node.js-based MCP client using Google Gemini for conversational shopping.
- **MCP Server**: Express-based server with registered tools for product extraction, search, and cart operations.
- **Vector Search**: Pinecone-backed semantic search for relevant product context.
- **Embeddings Generator**: Script to generate product embeddings using Gemini and seed the Pinecone index.
- **Redis Memory**: Session history stored in Redis for context-aware conversations.
- **Modular Tooling**: LangGraph & MCP adapters for easy extension of capabilities.

---

## 🏗 Architecture Overview

```
[Client: terminal-client] <--> [MCP Server: Bytecraft-mcp]
       |                                    |
       v                                    v
   Google Gemini                       Prisma + PostgreSQL
       |                                    |
       v                                    v
   Redis (Memory)                      Pinecone (Vector DB)
```

---

## 📋 Prerequisites

- **Node.js** v18+ and npm or Yarn
- **Redis** instance
- **PostgreSQL** (for Prisma)
- **Pinecone** account & index
- **Google Generative AI** API key (Gemini)

---

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-org/Bytecraft-MCP_with_client.git
   cd Bytecraft-MCP_with_client
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

---

## ⚙ Configuration

Create a `.env` file in the root with these variables:

```env
# MCP Client & Server
MCP_ENDPOINT=http://localhost:3001/mcp
PORT=5500

# Redis
REDIS_URL=redis://localhost:6379

# Prisma / PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/yourdb

# Pinecone
PINECONE_API=your-pinecone-api-key
PINECONE_ENV=your-pinecone-environment

# Google Generative AI
GEMINI_API=your-google-genai-key
```

---

## ▶️ Running the MCP Server

1. Navigate to the server directory:

   ```bash
   cd server
   ```

2. Start the server:

   ```bash
   npm start
   # or
   node dist/index.js
   ```

> **Output**:
>
> ```
> ✅ Bytecraft-mcp server running on port 3001
> ```

---

## ▶️ Running the MCP Client

1. Navigate to the client directory:

   ```bash
   cd client
   ```

2. Start the client:

   ```bash
   npm start
   ```

3. **Chat Endpoint**:

   ```bash
   POST http://localhost:5500/chat
   Content-Type: application/json

   {
     "query": "Show me outdoor lamps",
     "userId": "user123"
   }
   ```

**Example** using `curl`:

```bash
curl -X POST http://localhost:5500/chat \
  -H "Content-Type: application/json" \
  -d '{ "query": "Show me outdoor lamps", "userId": "user123" }'
```

---

## 🔍 Vector Search Utility

Located in `client/utils/pinecone/pinecone.search.js`.

**Usage** inside client before agent invoke:

```js
import { searchVector } from "./utils/pinecone/pinecone.search.js";

const matches = await searchVector("modern desk lamp");
console.log(matches);
```

---

## 📊 Embeddings Generator

Script: `utils/pinecone/embeddings.js`

**Generate and log embeddings**:

```js
import { generateEmbeddingFromProduct } from "./utils/pinecone/embeddings.js";

const product = {
  name: "Desk Lamp",
  company: "Illuminate Co.",
  type: "lamp",
  areaOfUse: "indoor",
  description: "A sleek modern desk lamp.",
  price: 29.99,
};

const embedding = await generateEmbeddingFromProduct(product);
console.log(embedding);
```

Use these embeddings to seed your Pinecone index during data ingestion.

---

## 📂 Project Structure

```
├── client/                 # MCP client app
│   ├── index.js            # Express + MCP client implementation
│   └── utils/
│       ├── redis.js        # Redis helper
│       └── pinecone/
│           └── pinecone.search.js
├── server/                 # MCP server app
│   ├── index.js            # Main server + MCP tools registration
│   └── utils/db.js         # Prisma client config
├── utils/                  # Shared utilities
│   └── pinecone/embeddings.js
├── .env                    # Environment variables
├── package.json
└── README.md               # This file
```

---

## 🤝 Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feat/YourFeature`
3. Commit: `git commit -m "feat: add ..."`
4. Push: `git push origin feat/YourFeature`
5. Open a Pull Request

---

## 📜 License

MIT License. See [LICENSE](LICENSE) for details.
