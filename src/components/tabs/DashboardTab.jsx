import { useMemo } from 'react';
import { USE_CASES } from '../../data/useCases';
import { BUILDING_BLOCKS } from '../../data/buildingBlocks';
import { CATEGORIES, CATEGORY_NAMES } from '../../data/categories';
import { MATURITY_LABELS, MATURITY_COLORS, VALUE_CHAIN_SHORT_LABELS } from '../../data/constants';
import { getUseCaseAvgMaturity, getMaturityLevel } from '../../utils/maturity';
import { computeBlockFrequency, computeMaturityDistribution, computeCategoryStats, computeActivityStats } from '../../utils/scoring';
import { SectionLabel } from '../shared/SectionLabel';
import { StatCard } from '../shared/StatCard';
import { MaturityDots } from '../shared/MaturityDots';
import { ProgressBar } from '../shared/ProgressBar';
import { getBlockColor, getBlockMaturity } from '../../utils/maturity';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { theme } from '../../styles/theme';

export function DashboardTab() {
  const { isMobile, isTablet } = useBreakpoint();

  const blockFrequency = useMemo(() => computeBlockFrequency(USE_CASES), []);
  const categoryData = useMemo(() => computeCategoryStats(USE_CASES), []);
  const activityData = useMemo(() => computeActivityStats(USE_CASES), []);
  const maturityBuckets = useMemo(() => computeMaturityDistribution(USE_CASES), []);

  const totalMappings = USE_CASES.reduce((a, u) => a + u.buildingBlocks.length, 0);
  const overallAvg = USE_CASES.reduce((a, u) => a + getUseCaseAvgMaturity(u), 0) / USE_CASES.length;
  const maxCategoryCount = Math.max(...Object.values(categoryData).map(d => d.count));
  const maxBlockFreq = blockFrequency[0]?.[1] || 1;

  const gridCols = isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(3, 1fr)' : 'repeat(6, 1fr)';

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 10, marginBottom: theme.spacing.xxxl }}>
        {[
          ['Use Cases', USE_CASES.length, theme.colors.textPrimary],
          ['Building Blocks', BUILDING_BLOCKS.length, theme.colors.primary],
          ['Categories', 7, theme.colors.primaryDark],
          ['Mappings', totalMappings, theme.colors.activityPrimary],
          ['Avg Blocks/UC', (totalMappings / USE_CASES.length).toFixed(1), theme.colors.activitySupport],
          ['Avg Maturity', overallAvg.toFixed(1), getMaturityLevel(overallAvg).color],
        ].map(([label, value, color]) => (
          <StatCard key={label} label={label} value={value} color={color} />
        ))}
      </div>

      <div style={{
        background: theme.colors.surface,
        border: '1px solid ' + theme.colors.border,
        borderRadius: theme.radii.xl,
        padding: '16px 20px',
        marginBottom: theme.spacing.xxxl,
        boxShadow: theme.shadows.card,
      }}>
        <SectionLabel>Use Case Maturity Distribution</SectionLabel>
        <div style={{ display: 'flex', height: 28, borderRadius: theme.radii.lg, overflow: 'hidden', marginBottom: 8 }}>
          {['Commodity', 'Mature', 'Established', 'Emerging', 'Experimental'].map(label => {
            const cnt = maturityBuckets[label];
            if (!cnt) return null;
            const idx = MATURITY_LABELS.indexOf(label);
            return (
              <div key={label} style={{
                flex: cnt,
                background: MATURITY_COLORS[idx],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 30,
                transition: `flex ${theme.transitions.normal}`,
              }}>
                <span style={{ fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.black, color: '#fff' }}>{cnt}</span>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {['Commodity', 'Mature', 'Established', 'Emerging', 'Experimental'].map(label => {
            const idx = MATURITY_LABELS.indexOf(label);
            return (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: theme.radii.sm, background: MATURITY_COLORS[idx] }} />
                <span style={{ fontSize: theme.typography.sizes.base, color: theme.colors.textTertiary }}>{label}</span>
                <span style={{ fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.bold, color: theme.colors.textPrimary }}>{maturityBuckets[label]}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: theme.spacing.xxxl }}>
        <div style={{ flex: 1 }}>
          <SectionLabel>Maturity by Category</SectionLabel>
          {CATEGORY_NAMES.map(cat => {
            const d = categoryData[cat];
            const avgC = d.scores.length ? d.scores.reduce((a, b) => a + b, 0) / d.scores.length : 0;
            return (
              <div key={cat} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: theme.radii.sm, background: CATEGORIES[cat].color }} />
                    <span style={{ fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.bold, color: theme.colors.textSecondary }}>{cat}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MaturityDots score={Math.round(avgC)} size={5} />
                    <span style={{ fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.semibold, color: theme.colors.textMuted }}>{avgC.toFixed(1)}</span>
                  </div>
                </div>
                <ProgressBar value={d.count} max={maxCategoryCount} color={CATEGORIES[cat].color} height={18} labelInside />
              </div>
            );
          })}
          <div style={{ marginTop: theme.spacing.xxxl }}>
            <SectionLabel>Value Chain Activities</SectionLabel>
            {activityData.map(({ area, count, avgMaturity }) => {
              const ml = getMaturityLevel(avgMaturity);
              return (
                <div key={area} style={{ display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid ' + theme.colors.borderLight, gap: 10 }}>
                  <span style={{ fontSize: theme.typography.sizes.lg, color: theme.colors.textTertiary, width: 140, flexShrink: 0 }}>{VALUE_CHAIN_SHORT_LABELS[area]}</span>
                  <div style={{ flex: 1, height: 3, borderRadius: theme.radii.sm, background: theme.colors.borderLight, overflow: 'hidden' }}>
                    <div style={{ width: (count / activityData[0].count) * 100 + '%', height: '100%', background: theme.colors.primary, borderRadius: theme.radii.sm, transition: `width ${theme.transitions.normal}` }} />
                  </div>
                  <span style={{ fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.black, color: theme.colors.textPrimary, width: 22, textAlign: 'right' }}>{count}</span>
                  <MaturityDots score={Math.round(avgMaturity)} size={4} />
                  <span style={{ fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.bold, color: ml.color }}>{avgMaturity.toFixed(1)}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ width: isMobile ? '100%' : 400, flexShrink: 0 }}>
          <SectionLabel>Block Frequency &amp; Maturity</SectionLabel>
          {blockFrequency.map(([name, cnt]) => {
            const score = getBlockMaturity(name);
            return (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: 1, background: getBlockColor(name), flexShrink: 0 }} />
                <span style={{ width: 150, fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.semibold, color: theme.colors.textTertiary, flexShrink: 0, textAlign: 'right' }}>{name}</span>
                <ProgressBar value={cnt} max={maxBlockFreq} color={getBlockColor(name)} height={11} labelInside />
                <MaturityDots score={score} size={4} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
