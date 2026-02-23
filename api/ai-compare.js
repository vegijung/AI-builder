import { handleCors, chatCompletion } from './_shared.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { useCases } = req.body;
    if (!Array.isArray(useCases) || useCases.length < 2) {
      return res.status(400).json({ error: 'At least 2 use cases are required' });
    }

    const systemPrompt = `You are an AI strategy consultant at MMG Management Consulting. Compare the provided AI use cases for a business audience.

Rules:
- Write 2-3 sentences highlighting the key differences in scope, complexity, and business value
- Mention which one is more mature or easier to start with if relevant
- Use clear business language, avoid technical jargon
- Do NOT use bullet points, headers, or markdown
- Be concise and actionable`;

    const ucList = useCases.slice(0, 4).map((uc, i) => {
      return `${i + 1}. "${uc.name}" — Area: ${uc.valueChainArea || 'N/A'}, Maturity: ${uc.avgMaturity?.toFixed?.(1) || uc.avgMaturity || 'N/A'}/5, Blocks: ${(uc.buildingBlocks || []).join(', ')}`;
    }).join('\n');

    const userPrompt = `Compare these AI use cases:\n${ucList}`;

    const comparison = await chatCompletion(systemPrompt, userPrompt, 250);
    res.status(200).json({ comparison });
  } catch (err) {
    console.error('AI Compare error:', err);
    res.status(500).json({ error: 'Failed to generate comparison' });
  }
}
