async function post(endpoint, body) {
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchAISummary({ dimensionScores, recommendations, priorities, areaRatings, companyProfile, readinessScore }) {
  const data = await post('/api/ai-summary', {
    dimensionScores,
    recommendations: (recommendations || []).slice(0, 5).map(r => ({
      name: r.useCase?.name,
      area: r.useCase?.valueChainArea,
      maturity: r.maturity,
      score: r.score,
    })),
    priorities,
    areaRatings,
    companyProfile,
    readinessScore,
  });
  return data?.summary || null;
}

export async function fetchAISearch(query, useCases) {
  const data = await post('/api/ai-search', {
    query,
    useCases: (useCases || []).map(uc => ({
      name: uc.name,
      activityType: uc.activityType,
      valueChainArea: uc.valueChainArea,
      buildingBlocks: uc.buildingBlocks,
      avgMaturity: uc.avgMaturity,
    })),
  });
  return data?.matches || null;
}

export async function fetchAIExplain(useCase, companyProfile, userAreaRating) {
  const data = await post('/api/ai-explain', {
    useCase: {
      name: useCase.name,
      valueChainArea: useCase.valueChainArea,
      activityType: useCase.activityType,
      buildingBlocks: useCase.buildingBlocks,
      avgMaturity: useCase.avgMaturity,
    },
    companyProfile: companyProfile || null,
    userAreaRating: userAreaRating || null,
  });
  return data?.explanation || null;
}
