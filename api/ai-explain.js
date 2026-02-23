import { handleCors, chatCompletion } from './_shared.js';

export default async function handler(req, res) {
  if (handleCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { useCase, companyProfile, userAreaRating } = req.body;
    if (!useCase?.name) {
      return res.status(400).json({ error: 'useCase with name is required' });
    }

    const systemPrompt = `You are an AI consultant explaining a specific AI use case to a business leader who may not have deep technical knowledge.

Rules:
- Explain what this use case does in practical terms
- Describe the business value it provides
- Briefly mention what it takes to implement
- If the user's industry is provided, tailor the explanation with a relevant example
- If their adoption level is provided, adjust complexity accordingly
- Keep it to 3-4 sentences (~80 words)
- Avoid technical jargon -- use business language
- Do NOT use bullet points, headers, or markdown`;

    let userPrompt = `Use Case: "${useCase.name}"
- Value Chain Area: ${useCase.valueChainArea || 'N/A'}
- Activity Type: ${useCase.activityType || 'N/A'}
- Building Blocks (AI technologies used): ${(useCase.buildingBlocks || []).join(', ')}
- Average Technology Maturity: ${useCase.avgMaturity?.toFixed(1) || 'N/A'}/5`;

    if (companyProfile?.industry) {
      userPrompt += `\n- User's Industry: ${companyProfile.industry}`;
    }
    if (companyProfile?.companySize) {
      userPrompt += `\n- Company Size: ${companyProfile.companySize}`;
    }
    if (userAreaRating) {
      userPrompt += `\n- User's Current AI Adoption in this area: ${userAreaRating}/5`;
    }

    const explanation = await chatCompletion(systemPrompt, userPrompt, 200);
    res.status(200).json({ explanation });
  } catch (err) {
    console.error('AI Explain error:', err);
    res.status(500).json({ error: 'Failed to generate explanation' });
  }
}
