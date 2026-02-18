import { useState, useMemo } from 'react';
import { BUILDING_BLOCKS } from '../../data/buildingBlocks';
import { CATEGORIES, CATEGORY_NAMES } from '../../data/categories';
import { VALUE_CHAIN_AREAS, VALUE_CHAIN_SHORT_LABELS } from '../../data/constants';
import { USE_CASES } from '../../data/useCases';
import { SectionLabel } from '../shared/SectionLabel';
import { theme } from '../../styles/theme';

export function ExplorerSidebar({ selectedArea, selectedBlock, selectedCategory, filteredList, hasFilters, onAreaChange, onBlockChange, onCategoryChange, onReset }) {
  const bbByCat = useMemo(() => {
    const m = {};
    BUILDING_BLOCKS.forEach(b => {
      if (!m[b.category]) m[b.category] = [];
      m[b.category].push(b);
    });
    return m;
  }, []);

  return (
    <div style={{ width: 300, flexShrink: 0 }}>
      {hasFilters && (
        <button
          onClick={onReset}
          style={{
            marginBottom: theme.spacing.md,
            padding: '6px 14px',
            borderRadius: theme.radii.lg,
            border: '1px solid ' + theme.colors.borderStrong,
            background: theme.colors.surface,
            color: theme.colors.textTertiary,
            fontSize: theme.typography.sizes.md,
            fontWeight: theme.typography.weights.semibold,
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: `all ${theme.transitions.fast}`,
          }}
        >
          Reset Filters
        </button>
      )}
      <div style={{ marginBottom: 20 }}>
        <SectionLabel>Value Chain</SectionLabel>
        {VALUE_CHAIN_AREAS.map(area => {
          const totalCount = USE_CASES.filter(uc => uc.valueChainArea === area).length;
          const filteredCount = filteredList.filter(uc => uc.valueChainArea === area).length;
          const isSelected = selectedArea === area;
          return (
            <button
              key={area}
              onClick={() => onAreaChange(isSelected ? null : area)}
              style={{
                display: 'flex',
                width: '100%',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 10px',
                border: 'none',
                borderRadius: 5,
                background: isSelected ? theme.colors.textPrimary : 'transparent',
                color: isSelected ? theme.colors.primary : theme.colors.textTertiary,
                fontSize: theme.typography.sizes.lg,
                fontWeight: isSelected ? theme.typography.weights.bold : theme.typography.weights.medium,
                cursor: 'pointer',
                fontFamily: 'inherit',
                textAlign: 'left',
                marginBottom: 1,
                transition: `all ${theme.transitions.fast}`,
              }}
            >
              <span>{VALUE_CHAIN_SHORT_LABELS[area] || area}</span>
              <span style={{
                fontSize: theme.typography.sizes.base,
                fontWeight: theme.typography.weights.bold,
                background: isSelected ? theme.colors.primary + '30' : theme.colors.surfaceMuted,
                borderRadius: theme.radii.pill,
                padding: '1px 6px',
                color: isSelected ? theme.colors.primary : theme.colors.textMuted,
              }}>
                {hasFilters ? filteredCount : totalCount}
              </span>
            </button>
          );
        })}
      </div>
      <SectionLabel>Building Blocks</SectionLabel>
      {CATEGORY_NAMES.map(cat => {
        const blocks = bbByCat[cat] || [];
        const isCatSelected = selectedCategory === cat;
        return (
          <div key={cat} style={{ marginBottom: 8 }}>
            <button
              onClick={() => onCategoryChange(isCatSelected ? null : cat)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginBottom: 3,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px 0',
                fontFamily: 'inherit',
              }}
            >
              <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: theme.radii.sm, background: CATEGORIES[cat].color, opacity: isCatSelected ? 1 : 0.5, transition: `opacity ${theme.transitions.fast}` }} />
              <span style={{
                fontSize: theme.typography.sizes.base,
                fontWeight: theme.typography.weights.bold,
                color: isCatSelected ? CATEGORIES[cat].color : theme.colors.textMuted,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                transition: `color ${theme.transitions.fast}`,
              }}>
                {cat}
              </span>
            </button>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, paddingLeft: 14 }}>
              {blocks.map(bb => {
                const isBlockSelected = selectedBlock === bb.name;
                return (
                  <button
                    key={bb.name}
                    onClick={() => onBlockChange(isBlockSelected ? null : bb.name)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '3px 8px',
                      borderRadius: theme.radii.md,
                      border: 'none',
                      background: isBlockSelected ? CATEGORIES[cat].color : CATEGORIES[cat].color + '18',
                      color: isBlockSelected ? '#fff' : CATEGORIES[cat].color,
                      fontSize: theme.typography.sizes.base,
                      fontWeight: theme.typography.weights.semibold,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      opacity: selectedBlock && !isBlockSelected ? 0.4 : 1,
                      transition: `all ${theme.transitions.fast}`,
                      transform: 'scale(1)',
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
  );
}
