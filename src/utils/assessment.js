import { USE_CASES as staticUseCases } from '../data/useCases';
import { READINESS_DIMENSIONS, STRATEGIC_PRIORITIES } from '../data/constants';
import { getUseCaseAvgMaturity } from './maturity';

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

export function getRecommendedUseCases(areaRatings, readinessRatings, limit = 10, useCases, blockMap, priorities) {
  const readinessScore = computeReadinessScore(readinessRatings);
  const selectedAreas = Object.keys(areaRatings);
  if (!selectedAreas.length) return [];

  const candidates = (useCases || staticUseCases).filter(uc => selectedAreas.includes(uc.valueChainArea));
  const hasPriorities = priorities && priorities.length > 0;

  return candidates.map(uc => {
    const maturity = getUseCaseAvgMaturity(uc, blockMap);
    const userAreaRating = areaRatings[uc.valueChainArea] || 1;
    const maturityGap = Math.abs(maturity - userAreaRating);
    const feasibility = Math.min(5, readinessScore + (maturity >= 3.5 ? 1 : 0));
    const priorityAlignment = hasPriorities ? computePriorityAlignment(uc, priorities) : 0;

    const score = hasPriorities
      ? (5 - maturityGap) * 0.3 + maturity * 0.2 + feasibility * 0.2 + priorityAlignment * 5 * 0.3
      : (5 - maturityGap) * 0.4 + maturity * 0.3 + feasibility * 0.3;

    const alignedPriorities = getPriorityAlignments(uc, priorities);
    return { useCase: uc, maturity, score, feasibility, maturityGap, priorityAlignment, alignedPriorities };
  }).sort((a, b) => b.score - a.score).slice(0, limit);
}
