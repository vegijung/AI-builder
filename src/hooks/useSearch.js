import { useState, useMemo, useRef, useCallback } from 'react';

export function useSearch(data) {
  const [query, setQuery] = useState('');
  const [inputValue, setInputValue] = useState('');
  const debounceRef = useRef(null);

  const { useCases = [], buildingBlocks = [], categoryNames = [], valueChainAreaNames = [] } = data || {};

  const updateQuery = useCallback((value) => {
    setInputValue(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setQuery(value), 150);
  }, []);

  const results = useMemo(() => {
    if (!query || query.length < 2) return { useCases: [], blocks: [], categories: [], areas: [] };
    const q = query.toLowerCase();
    return {
      useCases: useCases.filter(uc => uc.name.toLowerCase().includes(q)).slice(0, 8),
      blocks: buildingBlocks.filter(b => b.name.toLowerCase().includes(q)).slice(0, 6),
      categories: categoryNames.filter(c => c.toLowerCase().includes(q)),
      areas: valueChainAreaNames.filter(a => a.toLowerCase().includes(q)),
    };
  }, [query, useCases, buildingBlocks, categoryNames, valueChainAreaNames]);

  const totalResults = results.useCases.length + results.blocks.length + results.categories.length + results.areas.length;

  const clearSearch = useCallback(() => {
    setQuery('');
    setInputValue('');
  }, []);

  return { query, inputValue, updateQuery, results, totalResults, clearSearch };
}
