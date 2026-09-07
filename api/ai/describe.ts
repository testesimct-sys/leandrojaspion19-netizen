import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generatePropertyDescription } from '../../server/ai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { propertyData } = req.body;
    const description = await generatePropertyDescription(propertyData);
    res.json({ description });
  } catch (error: any) {
    console.error("AI Describe Error:", error);
    res.status(500).json({ error: error.message });
  }
}
