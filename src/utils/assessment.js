import { USE_CASES as staticUseCases } from '../data/useCases';
import { READINESS_DIMENSIONS, STRATEGIC_PRIORITIES, CATEGORY_READINESS_MAP, VALUE_CHAIN_SHORT_LABELS, ADOPTION_LEVELS } from '../data/constants';
import { getUseCaseAvgMaturity, getBlockCategory, getMaturityLevel } from './maturity';

export function computeAreaMaturity(area, useCases, blockMap) {
  const ucs = (useCases || staticUseCases).filter(uc => uc.valueChainArea === area);
  if (!ucs.length) return 0;
  return ucs.reduce((sum, uc) => sum + getUseCaseAvgMaturity(uc, blockMap), 0) / ucs.length;
}

export function computeGapAnalysis(areaRatings, useCases, blockMap) {
  return Object.entries(areaRatings).map(([area, userRating]) => {
    const availableMaturity = computeAreaMaturity(area, useCases, blockMap);
    const gap = availableMaturity - userRating;
    return { area, userRating, availableMaturity, gap, absGap: Math.abs(gap) };
  }).sort((a, b) => a.absGap - b.absGap);
}

export function computeReadinessScore(readinessRatings) {
  const values = Object.values(readinessRatings);
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function computeDimensionScores(readinessRatings) {
  const result = {};
  READINESS_DIMENSIONS.forEach(dim => {
    const vals = dim.subQuestions.map(sq => readinessRatings[sq.id] ?? 3);
    result[dim.id] = vals.reduce((a, b) => a + b, 0) / vals.length;
  });
  return result;
}

function computePriorityAlignment(uc, priorityIds) {
  if (!priorityIds || !priorityIds.length) return 0;
  const selected = STRATEGIC_PRIORITIES.filter(p => priorityIds.includes(p.id));
  let maxAlignment = 0;
  for (const p of selected) {
    let match = 0;
    if (p.areas && p.areas.includes(uc.valueChainArea)) match += 0.6;
    if (p.categories && uc.category && p.categories.includes(uc.category)) match += 0.4;
    if (match > maxAlignment) maxAlignment = match;
  }
  return maxAlignment;
}

export function getPriorityAlignments(uc, priorityIds) {
  if (!priorityIds || !priorityIds.length) return [];
  return STRATEGIC_PRIORITIES.filter(p => {
    if (!priorityIds.includes(p.id)) return false;
    const areaMatch = p.areas && p.areas.includes(uc.valueChainArea);
    const catMatch = p.categories && uc.category && p.categories.includes(uc.category);
    return areaMatch || catMatch;
  });
}

function computeFeasibility(uc, readinessScore, dimensionScores, blockMap) {
  const categories = {};
  (uc.buildingBlocks || []).forEach(bName => {
    const cat = getBlockCategory(bName, blockMap);
    if (cat) categories[cat] = true;
  });

  const relevantDims = new Set();
  Object.keys(categories).forEach(cat => {
    const mapping = CATEGORY_READINESS_MAP[cat];
    if (mapping) mapping.dims.forEach(d => relevantDims.add(d));
  });

  if (!relevantDims.size || !dimensionScores) return Math.min(5, readinessScore);

  const relevantAvg = [...relevantDims].reduce((sum, d) => sum + (dimensionScores[d] || 3), 0) / relevantDims.size;
  return relevantAvg * 0.6 + readinessScore * 0.4;
}

export function getRecommendedUseCases(areaRatings, readinessRatings, limit = 10, useCases, blockMap, priorities, dimensionScores) {
  const readinessScore = computeReadinessScore(readinessRatings);
  const dimScores = dimensionScores || computeDimensionScores(readinessRatings);
  const selectedAreas = Object.keys(areaRatings);
  if (!selectedAreas.length) return [];

  const candidates = (useCases || staticUseCases).filter(uc => selectedAreas.includes(uc.valueChainArea));
  const hasPriorities = priorities && priorities.length > 0;

  return candidates.map(uc => {
    const maturity = getUseCaseAvgMaturity(uc, blockMap);
    const userAreaRating = areaRatings[uc.valueChainArea] || 1;

    const delta = maturity - userAreaRating;
    const opportunityScore = delta >= 0
      ? Math.max(0, 5 - delta * 0.5)
      : Math.max(0, 5 + delta * 1.5);

    const feasibility = computeFeasibility(uc, readinessScore, dimScores, blockMap);
    const priorityAlignment = hasPriorities ? computePriorityAlignment(uc, priorities) : 0;

    const score = hasPriorities
      ? opportunityScore * 0.25 + maturity * 0.15 + feasibility * 0.25 + priorityAlignment * 5 * 0.35
      : opportunityScore * 0.35 + maturity * 0.25 + feasibility * 0.40;

    const alignedPriorities = getPriorityAlignments(uc, priorities);
    return { useCase: uc, maturity, score, feasibility, opportunityScore, delta, priorityAlignment, alignedPriorities };
  }).sort((a, b) => b.score - a.score).slice(0, limit);
}

// --- Enriched results utilities ---

export function getFitLabel(score) {
  if (score >= 4.0) return { label: 'Strong Fit', color: '#50D8A8' };
  if (score >= 3.0) return { label: 'Good Fit', color: '#FBB740' };
  if (score >= 2.0) return { label: 'Moderate Fit', color: '#F47B20' };
  return { label: 'Low Fit', color: '#8a8580' };
}

const READINESS_INTERPRETATIONS = {
  data: {
    low: 'Your data foundations need significant work. Establish clear data ownership, improve data quality, and integrate your systems before launching AI projects.',
    mid: 'Your data capabilities are developing. Focus on closing gaps in data governance or quality to unlock more advanced AI use cases.',
    high: 'Your data foundation is strong -- clean, accessible, and well-governed. You are well-positioned to support data-intensive AI initiatives.',
  },
  infra: {
    low: 'Your technical infrastructure is not yet ready for AI at scale. Prioritize cloud adoption, system integration, and evaluating ML platforms.',
    mid: 'Your infrastructure has a solid base but gaps remain. Strengthen integration capabilities or ML tooling to support production AI workloads.',
    high: 'Your technical infrastructure is robust -- scalable compute, strong integrations, and AI platforms in place. Ready to deploy and scale.',
  },
  talent: {
    low: 'Your organization lacks dedicated AI expertise and data literacy. Invest in upskilling, hiring, or partnering before attempting complex AI projects.',
    mid: 'You have some data awareness but need deeper AI expertise or stronger change management to scale AI adoption across teams.',
    high: 'Your team is well-equipped -- dedicated AI talent, data-literate workforce, and strong change management capacity.',
  },
  leadership: {
    low: 'AI lacks executive sponsorship and dedicated budget. Securing leadership buy-in and strategic alignment is essential before investing in AI projects.',
    mid: 'Leadership is supportive but AI may not yet be fully embedded in strategy or budget. Strengthen the link between AI initiatives and business goals.',
    high: 'Excellent -- your leadership actively champions AI with dedicated budget and clear strategic alignment in place.',
  },
};

export function getReadinessInterpretation(dimId, avgScore) {
  const tier = avgScore <= 2 ? 'low' : avgScore <= 3.5 ? 'mid' : 'high';
  return READINESS_INTERPRETATIONS[dimId]?.[tier] || '';
}

export function getTrafficLight(score) {
  if (score <= 2) return { color: '#D94070', label: 'Needs Work' };
  if (score <= 3.5) return { color: '#F47B20', label: 'Developing' };
  return { color: '#50D8A8', label: 'Strong' };
}

export function generateExecutiveSummary(dimensionScores, recommendations, priorities, areaRatings, useCases) {
  const items = [];
  const dimLabels = Object.fromEntries(READINESS_DIMENSIONS.map(d => [d.id, d.label]));
  const shortLabels = VALUE_CHAIN_SHORT_LABELS;

  const dims = Object.entries(dimensionScores);
  if (dims.length) {
    const [weakestId, weakestScore] = dims.reduce((a, b) => a[1] < b[1] ? a : b);
    const weakDim = READINESS_DIMENSIONS.find(d => d.id === weakestId);
    const weakSubs = weakDim ? weakDim.subQuestions.map(sq => sq.label.toLowerCase()).join(' and ') : '';
    items.push({
      title: 'Priority: Strengthen ' + (dimLabels[weakestId] || weakestId),
      text: `Your ${dimLabels[weakestId] || weakestId} scored ${weakestScore.toFixed(1)}/5 -- the area with the most room to grow. Focus on ${weakSubs} to unlock more AI potential.`,
    });
  }

  if (recommendations.length) {
    const top = recommendations[0];
    const ml = getMaturityLevel(top.maturity);
    const areaLabel = shortLabels[top.useCase.valueChainArea] || top.useCase.valueChainArea;
    items.push({
      title: 'Quick Win: ' + top.useCase.name,
      text: `Start here -- the underlying AI technologies are ${ml.label.toLowerCase()} (${top.maturity.toFixed(1)}/5) in ${areaLabel}, making this a practical first step.`,
    });
  }

  if (priorities && priorities.length) {
    const topP = STRATEGIC_PRIORITIES.find(p => p.id === priorities[0]);
    if (topP) {
      const relevantAreas = Object.keys(areaRatings).filter(a => topP.areas?.includes(a));
      const relevantUCs = (useCases || []).filter(uc => relevantAreas.includes(uc.valueChainArea));
      items.push({
        title: 'Strategic Focus: ' + topP.label,
        text: `Your top priority is best served by ${relevantAreas.map(a => shortLabels[a] || a).join(', ')} use cases, where ${relevantUCs.length} opportunities were identified.`,
      });
    }
  }

  return items;
}

export function generateWhyText(rec, readinessScore, areaRatings, priorities) {
  const parts = [];
  const ml = getMaturityLevel(rec.maturity);
  const areaLabel = VALUE_CHAIN_SHORT_LABELS[rec.useCase.valueChainArea] || rec.useCase.valueChainArea;
  const userRating = areaRatings[rec.useCase.valueChainArea] || 1;
  const adoptionLabel = ADOPTION_LEVELS.find(l => l.score === userRating)?.label || '';

  parts.push(`The AI technologies behind this use case average ${rec.maturity.toFixed(1)}/5 maturity (${ml.label}).`);

  if (rec.delta !== undefined) {
    if (rec.delta >= 1.5) {
      parts.push(`The technology is well ahead of your current adoption in ${areaLabel} ("${adoptionLabel}", ${userRating}/5) -- a strong opportunity to leapfrog.`);
    } else if (rec.delta >= 0) {
      parts.push(`The technology maturity closely matches your adoption level in ${areaLabel} -- a natural fit for your current stage.`);
    } else {
      parts.push(`Your adoption in ${areaLabel} (${userRating}/5) is ahead of the available technology (${rec.maturity.toFixed(1)}/5) -- this area may need the tech to catch up.`);
    }
  }

  if (rec.feasibility >= 3.5) {
    parts.push(`Your organizational readiness makes this highly feasible to implement.`);
  } else if (rec.feasibility >= 2.5) {
    parts.push(`This is feasible with some targeted investment in the readiness areas this use case depends on.`);
  } else {
    parts.push(`This will require foundational improvements in key readiness areas before implementation.`);
  }

  if (rec.alignedPriorities && rec.alignedPriorities.length) {
    parts.push(`This directly supports your ${rec.alignedPriorities.map(p => p.label).join(' and ')} goal${rec.alignedPriorities.length > 1 ? 's' : ''}.`);
  }

  return parts.join(' ');
}

export function generateWhatYouNeed(rec, dimensionScores, blockMap) {
  const needs = [];
  const categories = {};
  (rec.useCase.buildingBlocks || []).forEach(bName => {
    const cat = getBlockCategory(bName, blockMap);
    if (cat) categories[cat] = (categories[cat] || 0) + 1;
  });

  const dominantCat = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0];
  if (!dominantCat) return needs;

  const mapping = CATEGORY_READINESS_MAP[dominantCat];
  if (!mapping) return needs;

  const dimLabels = Object.fromEntries(READINESS_DIMENSIONS.map(d => [d.id, d.label]));
  mapping.dims.forEach(dimId => {
    const score = dimensionScores[dimId];
    if (score !== undefined && score <= 3) {
      needs.push({
        dim: dimLabels[dimId] || dimId,
        score,
        text: `Improve ${dimLabels[dimId] || dimId} (currently ${score.toFixed(1)}/5) -- ${mapping.reason}`,
      });
    }
  });

  return needs;
}
