import { handleCors, chatCompletion } from './_shared.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { query, useCases } = req.body;
    if (!query || !useCases?.length) {
      return res.status(400).json({ error: 'query and useCases are required' });
    }

    const catalog = useCases.map((uc, i) => `${i + 1}. "${uc.name}" — Area: ${uc.valueChainArea}, Type: ${uc.activityType}, Building Blocks: ${(uc.buildingBlocks || []).join(', ')}, Maturity: ${uc.avgMaturity?.toFixed(1) || 'N/A'}`).join('\n');

    const systemPrompt = `You are an AI use case matchmaker for a management consulting tool. Given a user's description of what they want to achieve, identify the 5 most relevant AI use cases from the provided catalog.

For each match, explain in 1-2 sentences why it is relevant to what the user described. Focus on business value, not technical details.

IMPORTANT: You must return valid JSON in this exact format:
{"matches":[{"name":"exact use case name from catalog","explanation":"why this is relevant"}]}

Only use names that exactly match the catalog. Return up to 5 matches, ranked by relevance.`;

    const userPrompt = `User's goal: "${query}"

Available AI Use Cases:
${catalog}`;

    const raw = await chatCompletion(systemPrompt, userPrompt, 600);

    let matches = [];
    try {
      const jsonStr = raw.replace(/```json?\s*/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      matches = parsed.matches || [];
    } catch {
      matches = [];
    }

    const validNames = new Set(useCases.map(uc => uc.name));
    matches = matches.filter(m => validNames.has(m.name)).slice(0, 5);

    res.status(200).json({ matches });
  } catch (err) {
    console.error('AI Search error:', err);
    res.status(500).json({ error: 'Failed to search' });
  }
}
