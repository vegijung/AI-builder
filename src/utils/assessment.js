import { USE_CASES } from '../data/useCases';
import { getUseCaseAvgMaturity, getMaturityLevel } from './maturity';

export function computeAreaMaturity(area) {
  const areaUCs = USE_CASES.filter(uc => uc.valueChainArea === area);
  if (!areaUCs.length) return 0;
  return areaUCs.reduce((sum, uc) => sum + getUseCaseAvgMaturity(uc), 0) / areaUCs.length;
}

export function computeGapAnalysis(areaRatings) {
  return Object.entries(areaRatings).map(([area, userRating]) => {
    const availableMaturity = computeAreaMaturity(area);
    const gap = availableMaturity - userRating;
    return { area, userRating, availableMaturity, gap, absGap: Math.abs(gap) };
  }).sort((a, b) => a.absGap - b.absGap);
}

export function computeReadinessScore(readinessRatings) {
  const values = Object.values(readinessRatings);
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function getRecommendedUseCases(areaRatings, readinessRatings, limit = 10) {
  const readinessScore = computeReadinessScore(readinessRatings);
  const selectedAreas = Object.keys(areaRatings);
  if (!selectedAreas.length) return [];

  const candidates = USE_CASES.filter(uc => selectedAreas.includes(uc.valueChainArea));

  return candidates.map(uc => {
    const maturity = getUseCaseAvgMaturity(uc);
    const userAreaRating = areaRatings[uc.valueChainArea] || 1;
    const maturityGap = Math.abs(maturity - userAreaRating);
    const feasibility = Math.min(5, readinessScore + (maturity >= 3.5 ? 1 : 0));
    const score = (5 - maturityGap) * 0.4 + maturity * 0.3 + feasibility * 0.3;
    return { useCase: uc, maturity, score, feasibility, maturityGap };
  }).sort((a, b) => b.score - a.score).slice(0, limit);
}
