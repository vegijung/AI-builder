import { buildingBlockMap } from '../data/buildingBlocks';
import { CATEGORIES } from '../data/categories';

export function getBlockColor(blockName) {
  const block = buildingBlockMap[blockName];
  return block ? (CATEGORIES[block.category]?.color || '#888') : '#888';
}

export function getBlockCategory(blockName) {
  return buildingBlockMap[blockName]?.category || '';
}

export function getBlockMaturity(blockName) {
  return buildingBlockMap[blockName]?.maturity || 0;
}

export function getUseCaseAvgMaturity(useCase) {
  const blocks = useCase.buildingBlocks;
  if (!blocks.length) return 0;
  return blocks.reduce((sum, name) => sum + getBlockMaturity(name), 0) / blocks.length;
}

export function getMaturityLevel(avgScore) {
  if (avgScore >= 4.5) return { label: 'Commodity', color: '#50D8A8' };
  if (avgScore >= 3.8) return { label: 'Mature', color: '#5BC8D4' };
  if (avgScore >= 3.0) return { label: 'Established', color: '#FBB740' };
  if (avgScore >= 2.0) return { label: 'Emerging', color: '#F47B20' };
  return { label: 'Experimental', color: '#D94070' };
}
