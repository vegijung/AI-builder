import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'ai-builder-assessment';

function loadFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

function saveToStorage(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

export function useAssessment() {
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [areaRatings, setAreaRatings] = useState({});
  const [readinessRatings, setReadinessRatings] = useState({ data: 3, infra: 3, talent: 3, leadership: 3 });
  const [step, setStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [leadSubmitted, setLeadSubmittedState] = useState(false);

  useEffect(() => {
    const saved = loadFromStorage();
    if (saved) {
      setSelectedAreas(saved.selectedAreas || []);
      setAreaRatings(saved.areaRatings || {});
      setReadinessRatings(saved.readinessRatings || { data: 3, infra: 3, talent: 3, leadership: 3 });
      setIsComplete(saved.isComplete || false);
      setLeadSubmittedState(saved.leadSubmitted || false);
      if (saved.isComplete) setStep(3);
    }
  }, []);

  const save = useCallback((areas, areaR, readinessR, complete, leadSub) => {
    saveToStorage({ selectedAreas: areas, areaRatings: areaR, readinessRatings: readinessR, isComplete: complete, leadSubmitted: leadSub });
  }, []);

  const toggleArea = useCallback((area) => {
    setSelectedAreas(prev => {
      const next = prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area];
      save(next, areaRatings, readinessRatings, false, false);
      return next;
    });
  }, [areaRatings, readinessRatings, save]);

  const setAreaRating = useCallback((area, rating) => {
    setAreaRatings(prev => {
      const next = { ...prev, [area]: rating };
      save(selectedAreas, next, readinessRatings, false, leadSubmitted);
      return next;
    });
  }, [selectedAreas, readinessRatings, leadSubmitted, save]);

  const setReadinessRating = useCallback((dimension, rating) => {
    setReadinessRatings(prev => {
      const next = { ...prev, [dimension]: rating };
      save(selectedAreas, areaRatings, next, false, leadSubmitted);
      return next;
    });
  }, [selectedAreas, areaRatings, leadSubmitted, save]);

  const completeAssessment = useCallback(() => {
    setIsComplete(true);
    setStep(3);
    save(selectedAreas, areaRatings, readinessRatings, true, leadSubmitted);
  }, [selectedAreas, areaRatings, readinessRatings, leadSubmitted, save]);

  const setLeadSubmitted = useCallback(() => {
    setLeadSubmittedState(true);
    save(selectedAreas, areaRatings, readinessRatings, isComplete, true);
  }, [selectedAreas, areaRatings, readinessRatings, isComplete, save]);

  const resetAssessment = useCallback(() => {
    setSelectedAreas([]);
    setAreaRatings({});
    setReadinessRatings({ data: 3, infra: 3, talent: 3, leadership: 3 });
    setStep(0);
    setIsComplete(false);
    setLeadSubmittedState(false);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  return {
    selectedAreas, areaRatings, readinessRatings, step, isComplete, leadSubmitted,
    toggleArea, setAreaRating, setReadinessRating, setStep, completeAssessment, resetAssessment, setLeadSubmitted,
  };
}
