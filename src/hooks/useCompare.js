import { useState, useCallback } from 'react';

const MAX_COMPARE = 3;

export function useCompare() {
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const toggleCompare = useCallback((useCase) => {
    setSelectedForCompare(prev => {
      const exists = prev.find(uc => uc.name === useCase.name);
      if (exists) return prev.filter(uc => uc.name !== useCase.name);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, useCase];
    });
  }, []);

  const isSelected = useCallback((useCaseName) => {
    return selectedForCompare.some(uc => uc.name === useCaseName);
  }, [selectedForCompare]);

  const clearCompare = useCallback(() => {
    setSelectedForCompare([]);
    setIsCompareOpen(false);
  }, []);

  return { selectedForCompare, toggleCompare, isSelected, clearCompare, isCompareOpen, setIsCompareOpen, canCompare: selectedForCompare.length >= 2 };
}
