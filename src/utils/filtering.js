import { getBlockCategory, getUseCaseAvgMaturity } from './maturity';

export function filterUseCases(useCases, { valueChainArea, blockName, categoryName, sortBy }) {
  let filtered = [...useCases];
  if (valueChainArea) filtered = filtered.filter(uc => uc.valueChainArea === valueChainArea);
  if (blockName) filtered = filtered.filter(uc => uc.buildingBlocks.includes(blockName));
  if (categoryName) filtered = filtered.filter(uc => uc.buildingBlocks.some(b => getBlockCategory(b) === categoryName));
  if (sortBy === 'maturityDesc') filtered.sort((a, b) => getUseCaseAvgMaturity(b) - getUseCaseAvgMaturity(a));
  else if (sortBy === 'maturityAsc') filtered.sort((a, b) => getUseCaseAvgMaturity(a) - getUseCaseAvgMaturity(b));
  return filtered;
}

export function findUseCases(useCases, { selectedAreas, selectedCategories, minimumMaturity }) {
  let filtered = [...useCases];
  if (selectedAreas.length) filtered = filtered.filter(uc => selectedAreas.includes(uc.valueChainArea));
  if (selectedCategories.length) filtered = filtered.filter(uc => uc.buildingBlocks.some(b => selectedCategories.includes(getBlockCategory(b))));
  if (minimumMaturity > 0) filtered = filtered.filter(uc => getUseCaseAvgMaturity(uc) >= minimumMaturity);
  return filtered.map(uc => {
    const relevance = selectedCategories.length
      ? uc.buildingBlocks.filter(b => selectedCategories.includes(getBlockCategory(b))).length / uc.buildingBlocks.length
      : 1;
    return { useCase: uc, relevance, avgMaturity: getUseCaseAvgMaturity(uc) };
  }).sort((a, b) => b.relevance - a.relevance || b.avgMaturity - a.avgMaturity);
}
