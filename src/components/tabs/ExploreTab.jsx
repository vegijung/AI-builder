import { useState, useMemo, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { getUseCaseAvgMaturity, getBlockCategory } from '../../utils/maturity';
import { SectionLabel } from '../shared/SectionLabel';
import { MaturityBadge } from '../shared/MaturityBadge';
import { UseCaseCard } from '../shared/UseCaseCard';
import { ExploreSidebar } from './ExploreSidebar';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { theme } from '../../styles/theme';

export function ExploreTab({ searchNavigation, compareState, roadmapState, assessmentState }) {
  const { useCases, buildingBlockMap } = useData();
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [minimumMaturity, setMinimumMaturity] = useState(0);
  const [sortBy, setSortBy] = useState('name');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [prefilled, setPrefilled] = useState(false);
  const { isMobile } = useBreakpoint();

  useEffect(() => {
    if (searchNavigation) {
      if (searchNavigation.area) {
        setSelectedAreas([searchNavigation.area]);
        setSelectedBlock(null);
        setSelectedCategories([]);
      }
      if (searchNavigation.block) {
        setSelectedBlock(searchNavigation.block);
        setSelectedAreas([]);
        setSelectedCategories([]);
      }
      if (searchNavigation.category) {
        setSelectedCategories([searchNavigation.category]);
        setSelectedAreas([]);
        setSelectedBlock(null);
      }
    }
  }, [searchNavigation]);

  useEffect(() => {
    if (!prefilled && assessmentState?.isComplete && assessmentState.selectedAreas.length > 0) {
      setSelectedAreas(assessmentState.selectedAreas);
      setPrefilled(true);
    }
  }, [assessmentState?.isComplete, assessmentState?.selectedAreas, prefilled]);

  const filteredUseCases = useMemo(() => {
    let filtered = [...useCases];

    if (selectedAreas.length > 0) {
      filtered = filtered.filter(uc => selectedAreas.includes(uc.valueChainArea));
    }
    if (selectedBlock) {
      filtered = filtered.filter(uc => uc.buildingBlocks.includes(selectedBlock));
    }
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(uc =>
        uc.buildingBlocks.some(b => selectedCategories.includes(getBlockCategory(b, buildingBlockMap)))
      );
    }
    if (minimumMaturity > 0) {
      filtered = filtered.filter(uc => getUseCaseAvgMaturity(uc, buildingBlockMap) >= minimumMaturity);
    }

    if (sortBy === 'md') filtered.sort((a, b) => getUseCaseAvgMaturity(b, buildingBlockMap) - getUseCaseAvgMaturity(a, buildingBlockMap));
    else if (sortBy === 'ma') filtered.sort((a, b) => getUseCaseAvgMaturity(a, buildingBlockMap) - getUseCaseAvgMaturity(b, buildingBlockMap));

    return filtered;
  }, [useCases, buildingBlockMap, selectedAreas, selectedBlock, selectedCategories, minimumMaturity, sortBy]);

  const hasFilters = selectedAreas.length > 0 || selectedBlock || selectedCategories.length > 0 || minimumMaturity > 0;
  const overallAvg = filteredUseCases.length > 0
    ? filteredUseCases.reduce((a, uc) => a + getUseCaseAvgMaturity(uc, buildingBlockMap), 0) / filteredUseCases.length
    : 0;

  const resetFilters = () => {
    setSelectedAreas([]);
    setSelectedBlock(null);
    setSelectedCategories([]);
    setMinimumMaturity(0);
  };

  const handleAreaToggle = (area) => {
    setSelectedAreas(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]);
  };

  const handleCategoryToggle = (cat) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const sidebar = (
    <ExploreSidebar
      selectedAreas={selectedAreas}
      selectedBlock={selectedBlock}
      selectedCategories={selectedCategories}
      minimumMaturity={minimumMaturity}
      filteredCount={filteredUseCases.length}
      hasFilters={hasFilters}
      onAreaToggle={handleAreaToggle}
      onBlockChange={setSelectedBlock}
      onCategoryToggle={handleCategoryToggle}
      onMaturityChange={setMinimumMaturity}
      onReset={resetFilters}
    />
  );

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 16 : 32 }}>
      {isMobile ? (
        <div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
            padding: '10px 18px', borderRadius: theme.radii.lg,
            border: '1px solid ' + theme.colors.borderMedium, background: theme.colors.surface,
            color: theme.colors.textTertiary, fontSize: theme.typography.sizes.md,
            fontWeight: theme.typography.weights.semibold, cursor: 'pointer', fontFamily: 'inherit',
            marginBottom: 8, width: '100%',
          }}>
            {sidebarOpen ? 'Hide Filters' : 'Show Filters'} {hasFilters ? '(active)' : ''}
          </button>
          {sidebarOpen && sidebar}
        </div>
      ) : sidebar}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 14, flexWrap: 'wrap', gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <SectionLabel>{filteredUseCases.length} Use Cases</SectionLabel>
            {filteredUseCases.length > 0 && <MaturityBadge avg={overallAvg} />}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: theme.typography.sizes.sm, color: theme.colors.textDisabled }}>Sort:</span>
            {[['name', 'Name'], ['md', 'Maturity \u2193'], ['ma', 'Maturity \u2191']].map(([id, label]) => (
              <button key={id} onClick={() => setSortBy(id)} style={{
                padding: '4px 10px', borderRadius: theme.radii.md, border: 'none',
                fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.semibold,
                background: sortBy === id ? theme.colors.textPrimary : theme.colors.surfaceMuted,
                color: sortBy === id ? theme.colors.primary : theme.colors.textMuted,
                cursor: 'pointer', fontFamily: 'inherit', transition: `all ${theme.transitions.fast}`,
              }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={{
          display: 'flex', flexDirection: 'column', gap: 6,
          maxHeight: 'calc(100vh - 260px)', overflowY: 'auto', paddingRight: 4,
        }}>
          {filteredUseCases.length === 0 && (
            <div style={{ padding: 48, textAlign: 'center', color: theme.colors.textMuted, fontSize: theme.typography.sizes.lg }}>
              No use cases match the current filters. Try adjusting your selection.
            </div>
          )}
          {filteredUseCases.map((uc, i) => (
            <UseCaseCard
              key={uc.name + '-' + i}
              useCase={uc}
              index={i}
              highlightedBlock={selectedBlock}
              showCompare={!!compareState}
              isCompareSelected={compareState?.isSelected(uc.name)}
              onCompareToggle={compareState?.toggleCompare}
              onAddToRoadmap={roadmapState?.addToRoadmap}
              isInRoadmap={roadmapState?.isInRoadmap(uc.name)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
