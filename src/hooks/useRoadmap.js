import { useState, useCallback, useEffect } from 'react';
import { suggestPhase } from '../utils/roadmap';

const STORAGE_KEY = 'ai-builder-roadmap';

function loadFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

function saveToStorage(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

export function useRoadmap() {
  const [shortlist, setShortlist] = useState([]);

  useEffect(() => {
    const saved = loadFromStorage();
    if (saved?.shortlist) setShortlist(saved.shortlist);
  }, []);

  const save = useCallback((list) => {
    saveToStorage({ shortlist: list });
  }, []);

  const addToRoadmap = useCallback((useCase) => {
    setShortlist(prev => {
      if (prev.find(item => item.useCase.name === useCase.name)) return prev;
      const phase = suggestPhase(useCase);
      const next = [...prev, { useCase, phase }];
      save(next);
      return next;
    });
  }, [save]);

  const removeFromRoadmap = useCallback((useCaseName) => {
    setShortlist(prev => {
      const next = prev.filter(item => item.useCase.name !== useCaseName);
      save(next);
      return next;
    });
  }, [save]);

  const setPhase = useCallback((useCaseName, phase) => {
    setShortlist(prev => {
      const next = prev.map(item => item.useCase.name === useCaseName ? { ...item, phase } : item);
      save(next);
      return next;
    });
  }, [save]);

  const isInRoadmap = useCallback((useCaseName) => {
    return shortlist.some(item => item.useCase.name === useCaseName);
  }, [shortlist]);

  const clearRoadmap = useCallback(() => {
    setShortlist([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  return { shortlist, addToRoadmap, removeFromRoadmap, setPhase, isInRoadmap, clearRoadmap };
}
