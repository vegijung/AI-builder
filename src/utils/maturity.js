import { buildingBlockMap as staticBlockMap } from '../data/buildingBlocks';
import { CATEGORIES as staticCategories } from '../data/categories';

// All functions accept optional data params; fall back to hardcoded data if not provided.
// This allows gradual migration: components using useData() pass data explicitly,
// while components not yet migrated continue to work with static imports.

export function getBlockColor(blockName, blockMap, categories) {
  const bm = blockMap || staticBlockMap;
  const cats = categories || staticCategories;
  const block = bm[blockName];
  return block ? (cats[block.category]?.color || '#888') : '#888';
}

export function getBlockCategory(blockName, blockMap) {
  const bm = blockMap || staticBlockMap;
  return bm[blockName]?.category || '';
}

export function getBlockMaturity(blockName, blockMap) {
  const bm = blockMap || staticBlockMap;
  return bm[blockName]?.maturity || 0;
}

export function getUseCaseAvgMaturity(useCase, blockMap) {
  const blocks = useCase.buildingBlocks;
  if (!blocks || !blocks.length) return 0;
  return blocks.reduce((sum, name) => sum + getBlockMaturity(name, blockMap), 0) / blocks.length;
}

export function getMaturityLevel(avgScore) {
  if (avgScore >= 4.5) return { label: 'Commodity', color: '#50D8A8' };
  if (avgScore >= 3.8) return { label: 'Mature', color: '#5BC8D4' };
  if (avgScore >= 3.0) return { label: 'Established', color: '#FBB740' };
  if (avgScore >= 2.0) return { label: 'Emerging', color: '#F47B20' };
  return { label: 'Experimental', color: '#D94070' };
}
