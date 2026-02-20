import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { fetchCategories, fetchBuildingBlocks, fetchUseCases, fetchValueChainAreas } from '../services/dataService';

const DataContext = createContext(null);

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

export function DataProvider({ children }) {
  const [categories, setCategories] = useState({});
  const [buildingBlocks, setBuildingBlocks] = useState([]);
  const [useCases, setUseCases] = useState([]);
  const [valueChainAreas, setValueChainAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, blocks, ucs, areas] = await Promise.all([
        fetchCategories(),
        fetchBuildingBlocks(),
        fetchUseCases(),
        fetchValueChainAreas(),
      ]);
      setCategories(cats);
      setBuildingBlocks(blocks);
      setUseCases(ucs);
      setValueChainAreas(areas);
    } catch (e) {
      console.error('DataContext load error:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Derived lookups
  const buildingBlockMap = useMemo(() => {
    const map = {};
    buildingBlocks.forEach(b => { map[b.name] = b; });
    return map;
  }, [buildingBlocks]);

  const categoryNames = useMemo(() => Object.keys(categories), [categories]);

  const valueChainShortLabels = useMemo(() => {
    const labels = {};
    valueChainAreas.forEach(a => { labels[a.name] = a.shortLabel; });
    return labels;
  }, [valueChainAreas]);

  const valueChainAreaNames = useMemo(() => {
    return valueChainAreas.map(a => a.name).sort();
  }, [valueChainAreas]);

  const value = useMemo(() => ({
    categories,
    categoryNames,
    buildingBlocks,
    buildingBlockMap,
    useCases,
    valueChainAreas,
    valueChainShortLabels,
    valueChainAreaNames,
    loading,
    error,
    refetch: loadData,
  }), [categories, categoryNames, buildingBlocks, buildingBlockMap, useCases, valueChainAreas, valueChainShortLabels, valueChainAreaNames, loading, error, loadData]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}
