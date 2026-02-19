import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'ai-builder-workshop';

function loadFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

function saveToStorage(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

export function useWorkshop() {
  const [isActive, setIsActive] = useState(false);
  const [workshopName, setWorkshopName] = useState('');
  const [stage, setStage] = useState(0);
  const [priorities, setPriorities] = useState({});

  useEffect(() => {
    const saved = loadFromStorage();
    if (saved) {
      setIsActive(saved.isActive || false);
      setWorkshopName(saved.workshopName || '');
      setStage(saved.stage || 0);
      setPriorities(saved.priorities || {});
    }
  }, []);

  const save = useCallback((active, name, s, p) => {
    saveToStorage({ isActive: active, workshopName: name, stage: s, priorities: p });
  }, []);

  const openWorkshop = useCallback(() => {
    setIsActive(true);
    setStage(0);
    save(true, '', 0, {});
  }, [save]);

  const startWorkshop = useCallback((name) => {
    setIsActive(true);
    setWorkshopName(name);
    setStage(1);
    setPriorities({});
    save(true, name, 1, {});
  }, [save]);

  const goToStage = useCallback((s) => {
    setStage(s);
    save(isActive, workshopName, s, priorities);
  }, [isActive, workshopName, priorities, save]);

  const setPriority = useCallback((useCaseName, impact, feasibility) => {
    setPriorities(prev => {
      const next = { ...prev, [useCaseName]: { impact, feasibility } };
      save(isActive, workshopName, stage, next);
      return next;
    });
  }, [isActive, workshopName, stage, save]);

  const endWorkshop = useCallback(() => {
    setIsActive(false);
    setStage(0);
    save(false, workshopName, 0, priorities);
  }, [workshopName, priorities, save]);

  const resetWorkshop = useCallback(() => {
    setIsActive(false);
    setWorkshopName('');
    setStage(0);
    setPriorities({});
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  return {
    isActive, workshopName, stage, priorities,
    openWorkshop, startWorkshop, goToStage, setPriority, endWorkshop, resetWorkshop,
  };
}
