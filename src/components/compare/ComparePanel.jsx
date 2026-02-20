import { useMemo } from 'react';
import { getUseCaseAvgMaturity, getMaturityLevel, getBlockColor, getBlockCategory } from '../../utils/maturity';
import { useData } from '../../contexts/DataContext';
import { MaturityBadge } from '../shared/MaturityBadge';
import { MaturityDots } from '../shared/MaturityDots';
import { theme } from '../../styles/theme';

export function ComparePanel({ useCases, onClose }) {
  const { categories, valueChainShortLabels, buildingBlockMap } = useData();

  const analysis = useMemo(() => {
    const allBlocks = new Set();
    const blockSets = useCases.map(uc => new Set(uc.buildingBlocks));
    useCases.forEach(uc => uc.buildingBlocks.forEach(b => allBlocks.add(b)));

    const shared = [...allBlocks].filter(b => blockSets.every(s => s.has(b)));
    const unique = useCases.map((uc, i) => uc.buildingBlocks.filter(b => blockSets.filter(s => s.has(b)).length === 1));

    return { allBlocks: [...allBlocks], shared, unique, totalUnique: allBlocks.size };
  }, [useCases]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(42,37,32,0.4)',
      animation: 'fadeIn 0.2s ease-out',
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: theme.colors.surface,
        borderRadius: 12,
        padding: 28,
        maxWidth: 900,
        width: '90vw',
        maxHeight: '85vh',
        overflowY: 'auto',
        boxShadow: theme.shadows.elevated,
        animation: 'scaleIn 0.25s ease-out',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: theme.typography.weights.black, color: theme.colors.textPrimary }}>Compare Use Cases</h2>
          <button onClick={onClose} style={{
            border: 'none', background: theme.colors.surfaceMuted, borderRadius: theme.radii.lg, padding: '6px 12px',
            cursor: 'pointer', fontFamily: 'inherit', fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.semibold, color: theme.colors.textTertiary,
            transition: `background ${theme.transitions.fast}`,
          }}
            onMouseEnter={e => { e.currentTarget.style.background = theme.colors.borderMedium; }}
            onMouseLeave={e => { e.currentTarget.style.background = theme.colors.surfaceMuted; }}
          >
            Close
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${useCases.length}, 1fr)`, gap: 16, marginBottom: 24 }}>
          {useCases.map(uc => {
            const avg = getUseCaseAvgMaturity(uc, buildingBlockMap);
            const ml = getMaturityLevel(avg);
            const isPrimary = uc.activityType === 'Primary';
            const catBreakdown = uc.buildingBlocks.reduce((acc, b) => {
              const c = getBlockCategory(b, buildingBlockMap);
              if (c) acc[c] = (acc[c] || 0) + 1;
              return acc;
            }, {});

            return (
              <div key={uc.name} style={{
                background: theme.colors.surfaceAlt,
                borderRadius: theme.radii.xl,
                padding: 16,
                borderTop: '3px solid ' + (isPrimary ? theme.colors.activityPrimary : theme.colors.activitySupport),
              }}>
                <div style={{ fontWeight: theme.typography.weights.bold, fontSize: theme.typography.sizes.xxl, color: theme.colors.textPrimary, marginBottom: 4 }}>{uc.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <span style={{
                    fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.semibold, padding: '2px 6px', borderRadius: 3,
                    background: isPrimary ? theme.colors.activityPrimary + '10' : theme.colors.activitySupport + '10',
                    color: isPrimary ? '#3aaa88' : '#4aa8b4',
                  }}>
                    {uc.activityType}
                  </span>
                  <span style={{ fontSize: theme.typography.sizes.base, color: theme.colors.textMuted }}>{valueChainShortLabels[uc.valueChainArea]}</span>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <MaturityBadge avg={avg} />
                </div>
                <div style={{ fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.bold, color: theme.colors.textMuted, textTransform: 'uppercase', marginBottom: 6 }}>Building Blocks</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {uc.buildingBlocks.map(b => {
                    const isShared = analysis.shared.includes(b);
                    const col = getBlockColor(b, buildingBlockMap, categories);
                    return (
                      <div key={b} style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '3px 8px', borderRadius: theme.radii.md,
                        background: isShared ? theme.colors.primary + '15' : theme.colors.surfaceMuted,
                        border: isShared ? '1px solid ' + theme.colors.primary + '30' : '1px solid transparent',
                      }}>
                        <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: 1, background: col, flexShrink: 0 }} />
                        <span style={{ fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.medium, color: theme.colors.textSecondary, flex: 1 }}>{b}</span>
                        {isShared && <span style={{ fontSize: theme.typography.sizes.xs, fontWeight: theme.typography.weights.bold, color: theme.colors.primary }}>SHARED</span>}
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {Object.entries(catBreakdown).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                    <span key={cat} style={{ fontSize: theme.typography.sizes.sm, color: categories[cat]?.color, fontWeight: theme.typography.weights.semibold }}>
                      {categories[cat]?.abbr}: {count}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{
          background: theme.colors.surfaceAlt,
          borderRadius: theme.radii.xl,
          padding: 16,
        }}>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 12 }}>
            <div>
              <span style={{ fontSize: theme.typography.sizes.stat, fontWeight: theme.typography.weights.black, color: theme.colors.primary }}>{analysis.shared.length}</span>
              <span style={{ fontSize: theme.typography.sizes.base, color: theme.colors.textMuted, marginLeft: 6 }}>Shared Blocks</span>
            </div>
            <div>
              <span style={{ fontSize: theme.typography.sizes.stat, fontWeight: theme.typography.weights.black, color: theme.colors.textPrimary }}>{analysis.totalUnique}</span>
              <span style={{ fontSize: theme.typography.sizes.base, color: theme.colors.textMuted, marginLeft: 6 }}>Total Unique Blocks</span>
            </div>
            <div>
              <span style={{ fontSize: theme.typography.sizes.stat, fontWeight: theme.typography.weights.black, color: theme.colors.activitySupport }}>
                {analysis.totalUnique > 0 ? Math.round((analysis.shared.length / analysis.totalUnique) * 100) : 0}%
              </span>
              <span style={{ fontSize: theme.typography.sizes.base, color: theme.colors.textMuted, marginLeft: 6 }}>Overlap</span>
            </div>
          </div>
          {analysis.shared.length > 0 && (
            <div>
              <span style={{ fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.bold, color: theme.colors.textMuted, textTransform: 'uppercase' }}>Shared: </span>
              <span style={{ fontSize: theme.typography.sizes.base, color: theme.colors.textSecondary }}>{analysis.shared.join(', ')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
