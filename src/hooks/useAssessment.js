import { useState, useCallback, useEffect } from 'react';
import { ALL_READINESS_KEYS } from '../data/constants';

const STORAGE_KEY = 'ai-builder-assessment';

function makeDefaultReadiness() {
  const r = {};
  ALL_READINESS_KEYS.forEach(k => { r[k] = 3; });
  return r;
}

const OLD_KEYS = ['data', 'infra', 'talent', 'leadership'];
const KEY_MIGRATION = {
  data: ['data_governance', 'data_accessibility', 'data_quality'],
  infra: ['infra_cloud', 'infra_integration', 'infra_ml'],
  talent: ['talent_expertise', 'talent_literacy', 'talent_change'],
  leadership: ['leadership_sponsor', 'leadership_budget', 'leadership_alignment'],
};

function migrateReadiness(saved) {
  if (!saved) return makeDefaultReadiness();
  const keys = Object.keys(saved);
  const isOldFormat = keys.length <= 4 && keys.every(k => OLD_KEYS.includes(k));
  if (!isOldFormat) {
    const merged = { ...makeDefaultReadiness(), ...saved };
    return merged;
  }
  const migrated = makeDefaultReadiness();
  Object.entries(KEY_MIGRATION).forEach(([oldKey, newKeys]) => {
    const val = saved[oldKey] || 3;
    newKeys.forEach(nk => { migrated[nk] = val; });
  });
  return migrated;
}

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
  const [companyProfile, setCompanyProfileState] = useState({ industry: '', companySize: '', role: '' });
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [areaRatings, setAreaRatings] = useState({});
  const [readinessRatings, setReadinessRatings] = useState(makeDefaultReadiness());
  const [priorities, setPrioritiesState] = useState([]);
  const [step, setStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [leadSubmitted, setLeadSubmittedState] = useState(false);

  useEffect(() => {
    const saved = loadFromStorage();
    if (saved) {
      setCompanyProfileState(saved.companyProfile || { industry: '', companySize: '', role: '' });
      setSelectedAreas(saved.selectedAreas || []);
      setAreaRatings(saved.areaRatings || {});
      setReadinessRatings(migrateReadiness(saved.readinessRatings));
      setPrioritiesState(saved.priorities || []);
      setIsComplete(saved.isComplete || false);
      setLeadSubmittedState(saved.leadSubmitted || false);
      if (saved.isComplete) setStep(5);
    }
  }, []);

  const save = useCallback((data) => {
    saveToStorage(data);
  }, []);

  const persist = useCallback((overrides = {}) => {
    const data = {
      companyProfile, selectedAreas, areaRatings, readinessRatings, priorities,
      isComplete, leadSubmitted, ...overrides,
    };
    save(data);
  }, [companyProfile, selectedAreas, areaRatings, readinessRatings, priorities, isComplete, leadSubmitted, save]);

  const setCompanyProfile = useCallback((profile) => {
    setCompanyProfileState(profile);
    persist({ companyProfile: profile });
  }, [persist]);

  const toggleArea = useCallback((area) => {
    setSelectedAreas(prev => {
      const next = prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area];
      persist({ selectedAreas: next, isComplete: false });
      return next;
    });
  }, [persist]);

  const setAreaRating = useCallback((area, rating) => {
    setAreaRatings(prev => {
      const next = { ...prev, [area]: rating };
      persist({ areaRatings: next });
      return next;
    });
  }, [persist]);

  const setReadinessRating = useCallback((key, rating) => {
    setReadinessRatings(prev => {
      const next = { ...prev, [key]: rating };
      persist({ readinessRatings: next });
      return next;
    });
  }, [persist]);

  const togglePriority = useCallback((priorityId) => {
    setPrioritiesState(prev => {
      let next;
      if (prev.includes(priorityId)) {
        next = prev.filter(p => p !== priorityId);
      } else if (prev.length < 3) {
        next = [...prev, priorityId];
      } else {
        return prev;
      }
      persist({ priorities: next });
      return next;
    });
  }, [persist]);

  const completeAssessment = useCallback(() => {
    setIsComplete(true);
    setStep(5);
    persist({ isComplete: true });
  }, [persist]);

  const setLeadSubmitted = useCallback(() => {
    setLeadSubmittedState(true);
    persist({ leadSubmitted: true });
  }, [persist]);

  const resetAssessment = useCallback(() => {
    setCompanyProfileState({ industry: '', companySize: '', role: '' });
    setSelectedAreas([]);
    setAreaRatings({});
    setReadinessRatings(makeDefaultReadiness());
    setPrioritiesState([]);
    setStep(0);
    setIsComplete(false);
    setLeadSubmittedState(false);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  return {
    companyProfile, selectedAreas, areaRatings, readinessRatings, priorities, step, isComplete, leadSubmitted,
    setCompanyProfile, toggleArea, setAreaRating, setReadinessRating, togglePriority,
    setStep, completeAssessment, resetAssessment, setLeadSubmitted,
  };
}
