import { useState, useMemo, useEffect, useCallback } from 'react';
import { useData } from '../../contexts/DataContext';
import { getUseCaseAvgMaturity, getBlockCategory } from '../../utils/maturity';
import { fetchAISearch } from '../../services/aiService';
import { AiBadge, AiSkeleton } from '../shared/AiBadge';
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
  const [smartSearchMode, setSmartSearchMode] = useState(true);
  const [smartQuery, setSmartQuery] = useState('');
  const [smartResults, setSmartResults] = useState(null);
  const [smartLoading, setSmartLoading] = useState(false);
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

  const handleSmartSearch = useCallback(async () => {
    if (!smartQuery.trim() || smartLoading) return;
    setSmartLoading(true);
    const ucPayload = useCases.map(uc => ({
      ...uc,
      avgMaturity: getUseCaseAvgMaturity(uc, buildingBlockMap),
    }));
    const matches = await fetchAISearch(smartQuery.trim(), ucPayload);
    setSmartResults(matches);
    setSmartLoading(false);
  }, [smartQuery, smartLoading, useCases, buildingBlockMap]);

  const smartMatchedUseCases = useMemo(() => {
    if (!smartResults) return [];
    const explanationMap = {};
    smartResults.forEach(m => { explanationMap[m.name] = m.explanation; });
    return smartResults
      .map(m => {
        const uc = useCases.find(u => u.name === m.name);
        return uc ? { useCase: uc, explanation: m.explanation } : null;
      })
      .filter(Boolean);
  }, [smartResults, useCases]);

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
      {!smartSearchMode && (
        isMobile ? (
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
        ) : sidebar
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        {smartSearchMode ? (
          /* Smart Search Mode */
          <div>
            <div style={{
              display: 'flex', gap: 8, marginBottom: 16,
            }}>
              <input
                type="text"
                value={smartQuery}
                onChange={e => setSmartQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSmartSearch(); }}
                placeholder="Describe what you want to achieve, e.g. 'automate invoice processing' or 'predict customer churn'"
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: theme.radii.lg,
                  border: '1px solid ' + theme.colors.borderMedium, background: theme.colors.surface,
                  fontSize: theme.typography.sizes.md, fontFamily: 'inherit', color: theme.colors.textPrimary,
                  outline: 'none', transition: `border-color ${theme.transitions.fast}`,
                }}
                onFocus={e => { e.currentTarget.style.borderColor = theme.colors.primary; }}
                onBlur={e => { e.currentTarget.style.borderColor = theme.colors.borderMedium; }}
              />
              <button onClick={handleSmartSearch} disabled={smartLoading || !smartQuery.trim()} style={{
                padding: '10px 20px', borderRadius: theme.radii.lg, border: 'none',
                background: theme.colors.primary, color: '#fff',
                fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.semibold,
                cursor: smartLoading ? 'wait' : 'pointer', fontFamily: 'inherit',
                opacity: (!smartQuery.trim() || smartLoading) ? 0.6 : 1,
                transition: `all ${theme.transitions.fast}`,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {smartLoading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {smartLoading && (
              <div style={{ padding: '32px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <span style={{ fontSize: 18, animation: 'pulse 1.5s ease-in-out infinite' }}>&#10024;</span>
                  <span style={{ color: theme.colors.textMuted, fontSize: theme.typography.sizes.lg }}>AI is analyzing your request...</span>
                </div>
                <AiSkeleton lines={4} />
              </div>
            )}

            {!smartLoading && smartResults && smartMatchedUseCases.length === 0 && (
              <div style={{ padding: 48, textAlign: 'center', color: theme.colors.textMuted, fontSize: theme.typography.sizes.lg }}>
                No matching use cases found. Try rephrasing your description.
              </div>
            )}

            {!smartLoading && smartMatchedUseCases.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: theme.typography.sizes.base, color: theme.colors.textMuted, marginBottom: 4 }}>
                  {smartMatchedUseCases.length} matches found
                  <span style={{ marginLeft: 8 }}><AiBadge label="AI-powered" /></span>
                </div>
                {smartMatchedUseCases.map(({ useCase: uc, explanation }, i) => (
                  <div key={uc.name} style={{
                    animation: 'fadeSlideIn 0.3s ease-out both',
                    animationDelay: `${i * 60}ms`,
                  }}>
                    <UseCaseCard
                      useCase={uc}
                      index={i}
                      showCompare={!!compareState}
                      isCompareSelected={compareState?.isSelected(uc.name)}
                      onCompareToggle={compareState?.toggleCompare}
                      onAddToRoadmap={roadmapState?.addToRoadmap}
                      isInRoadmap={roadmapState?.isInRoadmap(uc.name)}
                    />
                    <div style={{
                      margin: '-4px 0 0 16px', padding: '8px 14px',
                      background: theme.colors.primary + '08', borderRadius: `0 0 ${theme.radii.lg}px ${theme.radii.lg}px`,
                      borderLeft: '2px solid ' + theme.colors.primary + '40',
                      fontSize: theme.typography.sizes.lg, color: theme.colors.textTertiary, lineHeight: 1.5,
                    }}>
                      {explanation}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!smartLoading && !smartResults && (
              <div>
                <div style={{ fontSize: theme.typography.sizes.base, color: theme.colors.textMuted, marginBottom: 12 }}>
                  {filteredUseCases.length} use cases available &mdash; search above or browse below
                </div>
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: 6,
                  maxHeight: 'calc(100vh - 300px)', overflowY: 'auto', paddingRight: 4,
                }}>
                  {filteredUseCases.map((uc, i) => (
                    <UseCaseCard
                      key={uc.name + '-' + i}
                      useCase={uc}
                      index={i}
                      showCompare={!!compareState}
                      isCompareSelected={compareState?.isSelected(uc.name)}
                      onCompareToggle={compareState?.toggleCompare}
                      onAddToRoadmap={roadmapState?.addToRoadmap}
                      isInRoadmap={roadmapState?.isInRoadmap(uc.name)}
                    />
                  ))}
                </div>
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button onClick={() => setSmartSearchMode(false)} style={{
                background: 'none', border: 'none', color: theme.colors.textMuted,
                fontSize: theme.typography.sizes.base, cursor: 'pointer', fontFamily: 'inherit',
                textDecoration: 'underline', padding: '4px 8px',
              }}>
                Switch to manual filters
              </button>
            </div>
          </div>
        ) : (
          /* Filter Mode */
          <>
            <div style={{ marginBottom: 10 }}>
              <button onClick={() => setSmartSearchMode(true)} style={{
                background: 'none', border: 'none', color: theme.colors.primary,
                fontSize: theme.typography.sizes.base, cursor: 'pointer', fontFamily: 'inherit',
                padding: '4px 0', display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <span style={{ fontSize: 13 }}>&#10024;</span> Switch to Smart Search
              </button>
            </div>
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
          </>
        )}
      </div>
    </div>
  );
}
