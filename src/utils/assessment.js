import { USE_CASES as staticUseCases } from '../data/useCases';
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

export function getRecommendedUseCases(areaRatings, readinessRatings, limit = 10, useCases, blockMap) {
  const readinessScore = computeReadinessScore(readinessRatings);
  const selectedAreas = Object.keys(areaRatings);
  if (!selectedAreas.length) return [];

  const candidates = (useCases || staticUseCases).filter(uc => selectedAreas.includes(uc.valueChainArea));

  return candidates.map(uc => {
    const maturity = getUseCaseAvgMaturity(uc, blockMap);
    const userAreaRating = areaRatings[uc.valueChainArea] || 1;
    const maturityGap = Math.abs(maturity - userAreaRating);
    const feasibility = Math.min(5, readinessScore + (maturity >= 3.5 ? 1 : 0));
    const score = (5 - maturityGap) * 0.4 + maturity * 0.3 + feasibility * 0.3;
    return { useCase: uc, maturity, score, feasibility, maturityGap };
  }).sort((a, b) => b.score - a.score).slice(0, limit);
}
