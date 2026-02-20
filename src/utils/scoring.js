import { getBlockCategory, getBlockMaturity, getUseCaseAvgMaturity, getMaturityLevel } from './maturity';

export function computeBlockFrequency(useCases) {
  const freq = {};
  useCases.forEach(uc => uc.buildingBlocks.forEach(b => (freq[b] = (freq[b] || 0) + 1)));
  return Object.entries(freq).sort((a, b) => b[1] - a[1]);
}

export function computeMaturityDistribution(useCases, blockMap) {
  const dist = { Experimental: 0, Emerging: 0, Established: 0, Mature: 0, Commodity: 0 };
  useCases.forEach(uc => { dist[getMaturityLevel(getUseCaseAvgMaturity(uc, blockMap)).label]++; });
  return dist;
}

export function computeCategoryStats(useCases, categoryNames, blockMap) {
  const stats = {};
  (categoryNames || []).forEach(c => (stats[c] = { count: 0, scores: [] }));
  useCases.forEach(uc =>
    uc.buildingBlocks.forEach(b => {
      const cat = getBlockCategory(b, blockMap);
      if (cat && stats[cat]) { stats[cat].count++; stats[cat].scores.push(getBlockMaturity(b, blockMap)); }
    })
  );
  return stats;
}

export function computeActivityStats(useCases, blockMap) {
  const data = {};
  useCases.forEach(uc => {
    if (!data[uc.valueChainArea]) data[uc.valueChainArea] = { count: 0, totalScore: 0 };
    data[uc.valueChainArea].count++;
    data[uc.valueChainArea].totalScore += getUseCaseAvgMaturity(uc, blockMap);
  });
  return Object.entries(data)
    .map(([area, v]) => ({ area, count: v.count, avgMaturity: v.totalScore / v.count }))
    .sort((a, b) => b.count - a.count);
}
