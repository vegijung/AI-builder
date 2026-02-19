import { useState, useMemo, useEffect } from 'react';
import { USE_CASES } from '../../data/useCases';
import { getUseCaseAvgMaturity } from '../../utils/maturity';
import { filterUseCases } from '../../utils/filtering';
import { SectionLabel } from '../shared/SectionLabel';
import { MaturityBadge } from '../shared/MaturityBadge';
import { UseCaseCard } from '../shared/UseCaseCard';
import { ExplorerSidebar } from './ExplorerSidebar';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { theme } from '../../styles/theme';

export function ExplorerTab({ searchNavigation, compareState, roadmapState }) {
  const [selectedArea, setSelectedArea] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isMobile } = useBreakpoint();

  useEffect(() => {
    if (searchNavigation) {
      if (searchNavigation.area) { setSelectedArea(searchNavigation.area); setSelectedBlock(null); setSelectedCategory(null); }
      if (searchNavigation.block) { setSelectedBlock(searchNavigation.block); setSelectedArea(null); setSelectedCategory(null); }
      if (searchNavigation.category) { setSelectedCategory(searchNavigation.category); setSelectedArea(null); setSelectedBlock(null); }
    }
  }, [searchNavigation]);

  const filteredUseCases = useMemo(() => {
    return filterUseCases(USE_CASES, {
      valueChainArea: selectedArea,
      blockName: selectedBlock,
      categoryName: selectedCategory,
      sortBy: sortBy === 'md' ? 'maturityDesc' : sortBy === 'ma' ? 'maturityAsc' : null,
    });
  }, [selectedArea, selectedBlock, selectedCategory, sortBy]);

  const hasFilters = selectedArea || selectedBlock || selectedCategory;
  const overallAvg = filteredUseCases.length > 0 ? filteredUseCases.reduce((a, uc) => a + getUseCaseAvgMaturity(uc), 0) / filteredUseCases.length : 0;

  const resetFilters = () => { setSelectedArea(null); setSelectedBlock(null); setSelectedCategory(null); };

  const sidebar = (
    <ExplorerSidebar
      selectedArea={selectedArea}
      selectedBlock={selectedBlock}
      selectedCategory={selectedCategory}
      filteredList={filteredUseCases}
      hasFilters={!!hasFilters}
      onAreaChange={setSelectedArea}
      onBlockChange={setSelectedBlock}
      onCategoryChange={setSelectedCategory}
      onReset={resetFilters}
    />
  );

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 16 : 28 }}>
      {isMobile ? (
        <div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              padding: '8px 16px',
              borderRadius: theme.radii.lg,
              border: '1px solid ' + theme.colors.borderMedium,
              background: theme.colors.surface,
              color: theme.colors.textTertiary,
              fontSize: theme.typography.sizes.lg,
              fontWeight: theme.typography.weights.semibold,
              cursor: 'pointer',
              fontFamily: 'inherit',
              marginBottom: 8,
              width: '100%',
            }}
          >
            {sidebarOpen ? 'Hide Filters' : 'Show Filters'} {hasFilters ? '(active)' : ''}
          </button>
          {sidebarOpen && sidebar}
        </div>
      ) : sidebar}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <SectionLabel>{filteredUseCases.length} Use Cases</SectionLabel>
            {filteredUseCases.length > 0 && <MaturityBadge avg={overallAvg} />}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: theme.typography.sizes.base, color: theme.colors.textDisabled }}>Sort:</span>
            {[['name', 'Name'], ['md', 'Maturity \u2193'], ['ma', 'Maturity \u2191']].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setSortBy(id)}
                style={{
                  padding: '3px 8px',
                  borderRadius: theme.radii.md,
                  border: 'none',
                  fontSize: theme.typography.sizes.base,
                  fontWeight: theme.typography.weights.semibold,
                  background: sortBy === id ? theme.colors.textPrimary : theme.colors.surfaceMuted,
                  color: sortBy === id ? theme.colors.primary : theme.colors.textMuted,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: `all ${theme.transitions.fast}`,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 'calc(100vh - 240px)', overflowY: 'auto', paddingRight: 4 }}>
          {filteredUseCases.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: theme.colors.textMuted, fontSize: theme.typography.sizes.xxl }}>
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
