import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleAIChat } from '../../server/ai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { messages, conversationId } = req.body;
    const response = await handleAIChat(messages, conversationId);
    res.json(response);
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ error: error.message });
  }
}
