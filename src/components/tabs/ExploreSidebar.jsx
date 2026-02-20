import { useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { SectionLabel } from '../shared/SectionLabel';
import { theme } from '../../styles/theme';

export function ExploreSidebar({
  selectedAreas, selectedBlock, selectedCategories, minimumMaturity,
  filteredCount, hasFilters,
  onAreaToggle, onBlockChange, onCategoryToggle, onMaturityChange, onReset,
}) {
  const { buildingBlocks, categories, categoryNames, valueChainAreaNames, valueChainShortLabels, useCases } = useData();

  const bbByCat = useMemo(() => {
    const m = {};
    buildingBlocks.forEach(b => {
      if (!m[b.category]) m[b.category] = [];
      m[b.category].push(b);
    });
    return m;
  }, [buildingBlocks]);

  return (
    <div style={{ width: 280, flexShrink: 0 }}>
      {hasFilters && (
        <button onClick={onReset} style={{
          marginBottom: theme.spacing.md, padding: '6px 14px', borderRadius: theme.radii.lg,
          border: '1px solid ' + theme.colors.borderStrong, background: theme.colors.surface,
          color: theme.colors.textTertiary, fontSize: theme.typography.sizes.md,
          fontWeight: theme.typography.weights.semibold, cursor: 'pointer', fontFamily: 'inherit',
          transition: `all ${theme.transitions.fast}`, width: '100%',
        }}>
          Reset All Filters
        </button>
      )}

      <div style={{ marginBottom: 24 }}>
        <SectionLabel>Value Chain</SectionLabel>
        {valueChainAreaNames.map(area => {
          const count = useCases.filter(uc => uc.valueChainArea === area).length;
          const isSelected = selectedAreas.includes(area);
          return (
            <button key={area} onClick={() => onAreaToggle(area)} style={{
              display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between',
              padding: '7px 10px', border: 'none', borderRadius: theme.radii.md,
              background: isSelected ? theme.colors.textPrimary : 'transparent',
              color: isSelected ? theme.colors.primary : theme.colors.textTertiary,
              fontSize: theme.typography.sizes.md, fontWeight: isSelected ? theme.typography.weights.bold : theme.typography.weights.medium,
              cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', marginBottom: 2,
              transition: `all ${theme.transitions.fast}`,
            }}>
              <span>{valueChainShortLabels[area] || area}</span>
              <span style={{
                fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.bold,
                background: isSelected ? theme.colors.primary + '30' : theme.colors.surfaceMuted,
                borderRadius: theme.radii.pill, padding: '1px 7px',
                color: isSelected ? theme.colors.primary : theme.colors.textMuted,
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ marginBottom: 24 }}>
        <SectionLabel>Minimum Maturity</SectionLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {[[0, 'All'], [2, 'Emerging+'], [3, 'Established+'], [4, 'Mature+']].map(([v, l]) => (
            <button key={v} onClick={() => onMaturityChange(v)} style={{
              padding: '5px 10px', borderRadius: theme.radii.md,
              border: minimumMaturity === v ? '2px solid ' + theme.colors.textPrimary : '1px solid ' + theme.colors.borderMedium,
              background: minimumMaturity === v ? theme.colors.textPrimary : theme.colors.surface,
              color: minimumMaturity === v ? theme.colors.primary : theme.colors.textTertiary,
              fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.semibold,
              cursor: 'pointer', fontFamily: 'inherit', transition: `all ${theme.transitions.fast}`,
            }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <SectionLabel>Building Blocks</SectionLabel>
        {categoryNames.map(cat => {
          const blocks = bbByCat[cat] || [];
          const isCatSelected = selectedCategories.includes(cat);
          return (
            <div key={cat} style={{ marginBottom: 10 }}>
              <button onClick={() => onCategoryToggle(cat)} style={{
                display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4,
                background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0', fontFamily: 'inherit',
              }}>
                <span style={{
                  display: 'inline-block', width: 8, height: 8, borderRadius: theme.radii.sm,
                  background: categories[cat].color, opacity: isCatSelected ? 1 : 0.5,
                  transition: `opacity ${theme.transitions.fast}`,
                }} />
                <span style={{
                  fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.bold,
                  color: isCatSelected ? categories[cat].color : theme.colors.textMuted,
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                  transition: `color ${theme.transitions.fast}`,
                }}>
                  {cat}
                </span>
              </button>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, paddingLeft: 14 }}>
                {blocks.map(bb => {
                  const isBlockSelected = selectedBlock === bb.name;
                  return (
                    <button key={bb.name} onClick={() => onBlockChange(isBlockSelected ? null : bb.name)} style={{
                      display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px',
                      borderRadius: theme.radii.md, border: 'none',
                      background: isBlockSelected ? categories[cat].color : categories[cat].color + '18',
                      color: isBlockSelected ? '#fff' : categories[cat].color,
                      fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.semibold,
                      cursor: 'pointer', fontFamily: 'inherit',
                      opacity: selectedBlock && !isBlockSelected ? 0.4 : 1,
                      transition: `all ${theme.transitions.fast}`, transform: 'scale(1)',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                      {bb.name}
                      <span style={{ fontSize: theme.typography.sizes.xs, fontWeight: theme.typography.weights.black, opacity: 0.7 }}>{bb.maturity}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
