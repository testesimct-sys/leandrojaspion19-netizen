import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { handleAIChat, generatePropertyDescription, summarizeConversation } from "./server/ai";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI API Routes
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { messages, conversationId } = req.body;
      const response = await handleAIChat(messages, conversationId);
      res.json(response);
    } catch (error: any) {
      console.error("AI Chat Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/describe", async (req, res) => {
    try {
      const { propertyData } = req.body;
      const description = await generatePropertyDescription(propertyData);
      res.json({ description });
    } catch (error: any) {
      console.error("AI Describe Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/summarize", async (req, res) => {
    try {
      const { messages } = req.body;
      const summary = await summarizeConversation(messages);
      res.json({ summary });
    } catch (error: any) {
      console.error("AI Summarize Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
