import { handleCors, chatCompletion } from './_shared.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { dimensionScores, recommendations, priorities, areaRatings, companyProfile, readinessScore } = req.body;

    const systemPrompt = `You are a senior AI strategy consultant at MMG Management Consulting. Write a concise, actionable executive summary (3-4 short paragraphs, ~150 words total) for a client based on their AI readiness assessment results.

Rules:
- Be specific: reference their actual scores and dimension names
- Use a professional but approachable tone
- First paragraph: overall readiness picture
- Second paragraph: biggest gap/risk and what to do about it
- Third paragraph: top recommended use case and why it fits
- Optional fourth paragraph: strategic priority alignment
- Do NOT use bullet points, headers, or markdown
- Write in second person ("Your organization...")`;

    const userPrompt = `Assessment Results:
- Overall Readiness Score: ${readinessScore?.toFixed(1) || 'N/A'}/5
- Dimension Scores: ${JSON.stringify(dimensionScores || {})}
- Company Profile: ${JSON.stringify(companyProfile || {})}
- Selected Value Chain Areas: ${Object.keys(areaRatings || {}).join(', ')}
- Area Adoption Ratings: ${JSON.stringify(areaRatings || {})}
- Strategic Priorities: ${JSON.stringify(priorities || [])}
- Top 5 Recommended Use Cases: ${JSON.stringify((recommendations || []).slice(0, 5).map(r => ({
  name: r.name || r.useCase?.name,
  area: r.area || r.useCase?.valueChainArea,
  maturity: r.maturity,
  score: r.score,
})))}`;

    const summary = await chatCompletion(systemPrompt, userPrompt, 300);
    res.status(200).json({ summary });
  } catch (err) {
    console.error('AI Summary error:', err);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
}
