import { useState, useMemo, useRef, useCallback } from 'react';
import { USE_CASES } from '../data/useCases';
import { BUILDING_BLOCKS } from '../data/buildingBlocks';
import { CATEGORY_NAMES } from '../data/categories';
import { VALUE_CHAIN_AREAS } from '../data/constants';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const debounceRef = useRef(null);

  const updateQuery = useCallback((value) => {
    setInputValue(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setQuery(value), 150);
  }, []);

  const results = useMemo(() => {
    if (!query || query.length < 2) return { useCases: [], blocks: [], categories: [], areas: [] };
    const q = query.toLowerCase();
    return {
      useCases: USE_CASES.filter(uc => uc.name.toLowerCase().includes(q)).slice(0, 8),
      blocks: BUILDING_BLOCKS.filter(b => b.name.toLowerCase().includes(q)).slice(0, 6),
      categories: CATEGORY_NAMES.filter(c => c.toLowerCase().includes(q)),
      areas: VALUE_CHAIN_AREAS.filter(a => a.toLowerCase().includes(q)),
    };
  }, [query]);

  const totalResults = results.useCases.length + results.blocks.length + results.categories.length + results.areas.length;

  const clearSearch = useCallback(() => {
    setQuery('');
    setInputValue('');
  }, []);

  return { query, inputValue, updateQuery, results, totalResults, clearSearch };
}
