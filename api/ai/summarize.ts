import type { VercelRequest, VercelResponse } from '@vercel/node';
import { summarizeConversation } from '../../server/ai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { messages } = req.body;
    const summary = await summarizeConversation(messages);
    res.json({ summary });
  } catch (error: any) {
    console.error("AI Summarize Error:", error);
    res.status(500).json({ error: error.message });
  }
}
