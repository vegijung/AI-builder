const toastListeners = new Set();

export function onAiToast(fn) {
  toastListeners.add(fn);
  return () => toastListeners.delete(fn);
}

function emitToast(message, type = 'error') {
  toastListeners.forEach(fn => fn({ message, type }));
}

const explainCache = new Map();

async function post(endpoint, body) {
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      if (res.status === 404) {
        emitToast('AI features unavailable — API endpoint not found', 'warning');
      } else {
        emitToast('AI request failed — showing default results', 'error');
      }
      return null;
    }
    return await res.json();
  } catch {
    emitToast('Network error — AI features unavailable', 'error');
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
  const cacheKey = useCase.name + '|' + (companyProfile?.industry || '') + '|' + (userAreaRating || '');
  if (explainCache.has(cacheKey)) return explainCache.get(cacheKey);

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
  const explanation = data?.explanation || null;
  if (explanation) explainCache.set(cacheKey, explanation);
  return explanation;
}

export async function fetchAICompare(useCases) {
  const data = await post('/api/ai-compare', {
    useCases: (useCases || []).map(uc => ({
      name: uc.name,
      valueChainArea: uc.valueChainArea,
      activityType: uc.activityType,
      buildingBlocks: uc.buildingBlocks,
      avgMaturity: uc.avgMaturity,
    })),
  });
  return data?.comparison || null;
}
