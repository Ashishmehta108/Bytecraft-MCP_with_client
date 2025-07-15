configDotenv();
import { configDotenv } from "dotenv";
import { marked } from "marked";
import TerminalRenderer from "marked-terminal";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { redis } from "./utils/redis.js";
import express from "express";
import cors from "cors";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { loadMcpTools } from "@langchain/mcp-adapters";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { searchVector } from "./utils/pinecone/pinecone.search.js";
marked.setOptions({ renderer: new (TerminalRenderer as any)() as any });
const app = express();
app.use(express.json());
app.use(cors({ origin: "*", credentials: true }));
const mcpClient = new Client({ name: "terminal-client", version: "1.0.0" });
const transport = new StreamableHTTPClientTransport(
  new URL(process.env.MCP_ENDPOINT || "http://localhost:3001/mcp")
);
await mcpClient.connect(transport);
const MAX_HISTORY = 50;
async function addToHistory(userId: string, role: string, text: string) {
  await redis.rPush(userId, JSON.stringify({ role, text }));
  await redis.lTrim(userId, -MAX_HISTORY, -1);
}
const gemini = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite-preview-06-17",
  apiKey: process.env.GEMINI_API,
});

async function getHistory(userId: string) {
  const raw = await redis.lRange(userId, 0, -1);
  return raw
    .map((m) => JSON.parse(m))
    .map((turn) => ({
      role: ["tool", "assistant"].includes(turn.role) ? "model" : turn.role,
      parts: [{ text: turn.text }],
    }));
}

app.post("/chat", async (req, res) => {
  const query = req.body.query;
  const userId = req.body.userId;
  const vectorSearch = await searchVector(query);
  let finalReply = null;
  await addToHistory(userId, "user", query);
  let history = await getHistory(userId);
  if (vectorSearch.length > 0) {
    history.push({
      role: "model",
      parts: [
        {
          text: `more  context of the query from the database comes out to be  ${JSON.stringify(
            vectorSearch
          )} and userId is ${userId} `,
        },
      ],
    });
  }
  const tools = await loadMcpTools("Bytecraft-mcp", mcpClient);
  const agent = createReactAgent({
    llm: gemini,
    tools,
  });
  const systemMessage = `You are a helpful assistant named Aira made by ashish mehta and trained by Google. You are a customer support agent for shopping and the store name is Bytecraft.

      In this conversation, you have to:
      -Search for product details to tell users about the products.
      - Help users know product details.
      - Help them buy based on budget.
      - Add/remove/view items in the cart without asking for permission.

      User ID is: ${userId}
      history of conversation with the user is  : ${JSON.stringify(history)}
      Stop when the required task is completed for eg if user asks to buy a product then stop and give response that product is added to the cart and also recommend similar products and be gentle with the user.
`;
  const response = await agent.invoke({
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: query },
    ],
  });
  const agentLength = response.messages.length;
  finalReply = response.messages[agentLength - 1].content as string;
  await addToHistory(userId, "model", finalReply!);
  return res.json({ finalReply });
});

app.listen(process.env.PORT || 5500, () => {
  console.log(`Server started on port ${process.env.PORT}`);
});
