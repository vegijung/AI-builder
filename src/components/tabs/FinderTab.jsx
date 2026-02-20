import { useState, useMemo, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { getUseCaseAvgMaturity, getMaturityLevel, getBlockColor, getBlockMaturity, getBlockCategory } from '../../utils/maturity';
import { findUseCases } from '../../utils/filtering';
import { computeBlockFrequency, computeMaturityDistribution } from '../../utils/scoring';
import { SectionLabel } from '../shared/SectionLabel';
import { MaturityBadge } from '../shared/MaturityBadge';
import { MaturityDots } from '../shared/MaturityDots';
import { ProgressBar } from '../shared/ProgressBar';
import { MATURITY_LABELS, MATURITY_COLORS } from '../../data/constants';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { theme } from '../../styles/theme';

export function FinderTab({ roadmapState, assessmentState }) {
  const { useCases, categories, categoryNames, valueChainAreaNames, valueChainShortLabels, buildingBlockMap } = useData();
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [minimumMaturity, setMinimumMaturity] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [prefilled, setPrefilled] = useState(false);
  const { isMobile } = useBreakpoint();

  useEffect(() => {
    if (!prefilled && assessmentState?.isComplete && assessmentState.selectedAreas.length > 0) {
      setSelectedAreas(assessmentState.selectedAreas);
      setPrefilled(true);
    }
  }, [assessmentState?.isComplete, assessmentState?.selectedAreas, prefilled]);

  const results = useMemo(() => {
    if (!showResults) return [];
    return findUseCases(useCases, { selectedAreas, selectedCategories, minimumMaturity }, buildingBlockMap);
  }, [showResults, selectedAreas, selectedCategories, minimumMaturity, useCases, buildingBlockMap]);

  const topBlocks = useMemo(() => {
    const freq = {};
    results.forEach(r => r.useCase.buildingBlocks.forEach(b => (freq[b] = (freq[b] || 0) + 1)));
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 15);
  }, [results]);

  const maturityDist = useMemo(() => {
    const d = { Experimental: 0, Emerging: 0, Established: 0, Mature: 0, Commodity: 0 };
    results.forEach(r => { d[getMaturityLevel(r.avgMaturity).label]++; });
    return d;
  }, [results]);

  const reset = () => { setSelectedAreas([]); setSelectedCategories([]); setMinimumMaturity(0); setShowResults(false); };
  const canGo = selectedAreas.length > 0 || selectedCategories.length > 0 || minimumMaturity > 0;

  if (showResults && results.length > 0) {
    const overallAvg = results.reduce((a, r) => a + r.avgMaturity, 0) / results.length;
    return (
      <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
        <button onClick={reset} style={{
          marginBottom: theme.spacing.lg,
          padding: '8px 16px',
          borderRadius: theme.radii.lg,
          border: '1px solid ' + theme.colors.borderStrong,
          background: theme.colors.surface,
          color: theme.colors.textTertiary,
          fontSize: theme.typography.sizes.lg,
          fontWeight: theme.typography.weights.semibold,
          cursor: 'pointer',
          fontFamily: 'inherit',
          transition: `all ${theme.transitions.fast}`,
        }}>
          &larr; New Analysis
        </button>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 24 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <SectionLabel>{results.length} relevant Use Cases</SectionLabel>
              <MaturityBadge avg={overallAvg} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 'calc(100vh - 260px)', overflowY: 'auto' }}>
              {results.map((r, i) => {
                const uc = r.useCase;
                const ml = getMaturityLevel(r.avgMaturity);
                return (
                  <div key={uc.name + i} style={{
                    background: theme.colors.surface,
                    border: '1px solid ' + theme.colors.border,
                    borderRadius: theme.radii.xl,
                    padding: '12px 16px',
                    borderLeft: '3px solid ' + ml.color,
                    boxShadow: theme.shadows.card,
                    animation: 'fadeSlideIn 0.3s ease-out both',
                    animationDelay: `${Math.min(i * 30, 600)}ms`,
                    transition: `box-shadow ${theme.transitions.fast}, transform ${theme.transitions.fast}`,
                  }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = theme.shadows.cardHover; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = theme.shadows.card; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: theme.typography.weights.bold, fontSize: theme.typography.sizes.xl, color: theme.colors.textPrimary }}>{uc.name}</span>
                        <span style={{
                          fontSize: theme.typography.sizes.sm,
                          fontWeight: theme.typography.weights.semibold,
                          padding: '2px 6px',
                          borderRadius: 3,
                          background: uc.activityType === 'Primary' ? theme.colors.activityPrimary + '10' : theme.colors.activitySupport + '10',
                          color: uc.activityType === 'Primary' ? '#3aaa88' : '#4aa8b4',
                        }}>
                          {uc.activityType}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: theme.typography.sizes.base, color: theme.colors.textDisabled }}>{valueChainShortLabels[uc.valueChainArea]}</span>
                        <MaturityBadge avg={r.avgMaturity} />
                        {roadmapState && (
                          <button
                            onClick={() => roadmapState.addToRoadmap(uc)}
                            disabled={roadmapState.isInRoadmap(uc.name)}
                            style={{
                              padding: '3px 8px', borderRadius: theme.radii.lg,
                              border: '1px solid ' + (roadmapState.isInRoadmap(uc.name) ? theme.colors.activityPrimary : theme.colors.borderMedium),
                              background: roadmapState.isInRoadmap(uc.name) ? theme.colors.activityPrimary + '15' : theme.colors.surface,
                              color: roadmapState.isInRoadmap(uc.name) ? theme.colors.activityPrimary : theme.colors.textTertiary,
                              fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.semibold,
                              cursor: roadmapState.isInRoadmap(uc.name) ? 'default' : 'pointer', fontFamily: 'inherit',
                              transition: `all ${theme.transitions.fast}`,
                            }}
                          >
                            {roadmapState.isInRoadmap(uc.name) ? '\u2713 In Roadmap' : '+ Roadmap'}
                          </button>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                      {uc.buildingBlocks.map(b => {
                        const hl = !selectedCategories.length || selectedCategories.includes(getBlockCategory(b, buildingBlockMap));
                        const col = getBlockColor(b, buildingBlockMap, categories);
                        return (
                          <span key={b} style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '2px 7px',
                            borderRadius: 3,
                            fontSize: theme.typography.sizes.base,
                            fontWeight: theme.typography.weights.semibold,
                            background: hl ? col + '18' : theme.colors.surfaceMuted,
                            color: hl ? col : theme.colors.textDisabled,
                            border: '1px solid ' + (hl ? col + '30' : theme.colors.border),
                            transition: `all ${theme.transitions.fast}`,
                          }}>
                            {b} <span style={{ fontSize: theme.typography.sizes.xs, fontWeight: theme.typography.weights.black, opacity: 0.6 }}>{getBlockMaturity(b, buildingBlockMap)}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ width: isMobile ? '100%' : 280, flexShrink: 0 }}>
            <SectionLabel>Profile</SectionLabel>
            <div style={{ background: theme.colors.surfaceAlt, borderRadius: theme.radii.xl, padding: 14, marginBottom: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><div style={{ fontSize: theme.typography.sizes.stat, fontWeight: theme.typography.weights.black, color: theme.colors.textPrimary }}>{results.length}</div><div style={{ fontSize: theme.typography.sizes.base, color: theme.colors.textMuted }}>Use Cases</div></div>
              <div><div style={{ fontSize: theme.typography.sizes.stat, fontWeight: theme.typography.weights.black, color: getMaturityLevel(overallAvg).color }}>{overallAvg.toFixed(1)}</div><div style={{ fontSize: theme.typography.sizes.base, color: theme.colors.textMuted }}>Avg Maturity</div></div>
              <div><div style={{ fontSize: theme.typography.sizes.stat, fontWeight: theme.typography.weights.black, color: theme.colors.activityPrimary }}>{results.filter(r => r.useCase.activityType === 'Primary').length}</div><div style={{ fontSize: theme.typography.sizes.base, color: theme.colors.textMuted }}>Primary</div></div>
              <div><div style={{ fontSize: theme.typography.sizes.stat, fontWeight: theme.typography.weights.black, color: theme.colors.activitySupport }}>{results.filter(r => r.useCase.activityType === 'Support').length}</div><div style={{ fontSize: theme.typography.sizes.base, color: theme.colors.textMuted }}>Support</div></div>
            </div>
            <SectionLabel>Maturity Distribution</SectionLabel>
            <div style={{ background: theme.colors.surfaceAlt, borderRadius: theme.radii.xl, padding: 14, marginBottom: 20 }}>
              {['Commodity', 'Mature', 'Established', 'Emerging', 'Experimental'].map(label => {
                const cnt = maturityDist[label] || 0;
                const idx = MATURITY_LABELS.indexOf(label);
                return (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ width: 80, fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.semibold, color: MATURITY_COLORS[idx], textAlign: 'right' }}>{label}</span>
                    <ProgressBar value={cnt} max={results.length} color={MATURITY_COLORS[idx]} height={8} />
                    <span style={{ fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.bold, color: theme.colors.textTertiary, width: 18, textAlign: 'right' }}>{cnt}</span>
                  </div>
                );
              })}
            </div>
            <SectionLabel>Top Building Blocks</SectionLabel>
            {topBlocks.map(([name, cnt]) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0' }}>
                <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: 1, background: getBlockColor(name, buildingBlockMap, categories), flexShrink: 0 }} />
                <span style={{ fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.semibold, color: theme.colors.textSecondary, flex: 1 }}>{name}</span>
                <MaturityDots score={getBlockMaturity(name, buildingBlockMap)} size={4} />
                <span style={{ fontSize: theme.typography.sizes.base, color: theme.colors.textDisabled, width: 28, textAlign: 'right' }}>{Math.round((cnt / results.length) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showResults && results.length === 0) {
    return (
      <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
        <button onClick={reset} style={{
          marginBottom: theme.spacing.lg, padding: '8px 16px', borderRadius: theme.radii.lg, border: '1px solid ' + theme.colors.borderStrong,
          background: theme.colors.surface, color: theme.colors.textTertiary, fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.semibold, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          &larr; New Analysis
        </button>
        <div style={{ padding: 40, textAlign: 'center', color: theme.colors.textMuted, fontSize: theme.typography.sizes.xxl }}>
          No use cases found for your criteria. Try broadening your selection.
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, animation: 'fadeIn 0.3s ease-out' }}>
      <p style={{ fontSize: theme.typography.sizes.xxl, color: theme.colors.textTertiary, lineHeight: 1.6, marginBottom: theme.spacing.xxl, marginTop: 0 }}>
        Identify the most relevant AI use cases for your organization.
      </p>
      <div style={{ marginBottom: theme.spacing.xxxl }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{
            display: 'inline-flex', width: 24, height: 24, borderRadius: theme.radii.circle, background: theme.colors.textPrimary,
            color: theme.colors.primary, fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.black, alignItems: 'center', justifyContent: 'center',
          }}>1</span>
          <span style={{ fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.semibold, color: theme.colors.textSecondary }}>Value Chain Areas</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {valueChainAreaNames.map(area => {
            const sel = selectedAreas.includes(area);
            return (
              <button key={area}
                onClick={() => setSelectedAreas(prev => prev.includes(area) ? prev.filter(x => x !== area) : [...prev, area])}
                style={{
                  padding: '8px 14px', borderRadius: theme.radii.lg, border: sel ? '2px solid ' + theme.colors.textPrimary : '1px solid ' + theme.colors.borderMedium,
                  background: sel ? theme.colors.textPrimary : theme.colors.surface, color: sel ? theme.colors.primary : theme.colors.textTertiary,
                  fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.semibold, cursor: 'pointer', fontFamily: 'inherit',
                  transition: `all ${theme.transitions.fast}`,
                }}
              >
                {valueChainShortLabels[area]} ({useCases.filter(u => u.valueChainArea === area).length})
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ marginBottom: theme.spacing.xxxl }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{
            display: 'inline-flex', width: 24, height: 24, borderRadius: theme.radii.circle, background: theme.colors.textPrimary,
            color: theme.colors.primary, fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.black, alignItems: 'center', justifyContent: 'center',
          }}>2</span>
          <span style={{ fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.semibold, color: theme.colors.textSecondary }}>AI Capabilities</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {categoryNames.map(cat => {
            const sel = selectedCategories.includes(cat);
            const col = categories[cat].color;
            return (
              <button key={cat}
                onClick={() => setSelectedCategories(prev => prev.includes(cat) ? prev.filter(x => x !== cat) : [...prev, cat])}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: theme.radii.lg,
                  border: sel ? '2px solid ' + col : '1px solid ' + theme.colors.borderMedium,
                  background: sel ? col + '18' : theme.colors.surface, color: sel ? col : theme.colors.textTertiary,
                  fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.semibold, cursor: 'pointer', fontFamily: 'inherit',
                  transition: `all ${theme.transitions.fast}`,
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ marginBottom: theme.spacing.xxxl }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{
            display: 'inline-flex', width: 24, height: 24, borderRadius: theme.radii.circle, background: theme.colors.textPrimary,
            color: theme.colors.primary, fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.black, alignItems: 'center', justifyContent: 'center',
          }}>3</span>
          <span style={{ fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.semibold, color: theme.colors.textSecondary }}>Minimum Maturity Level</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[[0, 'All'], [2, 'Emerging+'], [3, 'Established+'], [4, 'Mature+']].map(([v, l]) => (
            <button key={v} onClick={() => setMinimumMaturity(v)} style={{
              padding: '8px 16px', borderRadius: theme.radii.lg, border: minimumMaturity === v ? '2px solid ' + theme.colors.textPrimary : '1px solid ' + theme.colors.borderMedium,
              background: minimumMaturity === v ? theme.colors.textPrimary : theme.colors.surface, color: minimumMaturity === v ? theme.colors.primary : theme.colors.textTertiary,
              fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.semibold, cursor: 'pointer', fontFamily: 'inherit',
              transition: `all ${theme.transitions.fast}`,
            }}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <button onClick={() => setShowResults(true)} disabled={!canGo} style={{
        padding: '12px 32px', borderRadius: theme.radii.xl, border: 'none',
        background: canGo ? theme.colors.textPrimary : theme.colors.borderMedium,
        color: canGo ? theme.colors.primary : theme.colors.textDisabled,
        fontSize: theme.typography.sizes.xxl, fontWeight: theme.typography.weights.bold, cursor: canGo ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
        transition: `all ${theme.transitions.fast}`,
        transform: canGo ? 'scale(1)' : 'scale(1)',
      }}
        onMouseEnter={e => { if (canGo) e.currentTarget.style.transform = 'scale(1.02)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        Identify Use Cases &rarr;
      </button>
    </div>
  );
}
