import { useState } from 'react';
import { getUseCaseAvgMaturity, getMaturityLevel, getBlockColor, getBlockMaturity, getBlockCategory } from '../../utils/maturity';
import { CATEGORIES } from '../../data/categories';
import { VALUE_CHAIN_SHORT_LABELS } from '../../data/constants';
import { MaturityDots } from './MaturityDots';
import { MaturityBadge } from './MaturityBadge';
import { BuildingBlockTag } from './BuildingBlockTag';
import { theme } from '../../styles/theme';

export function UseCaseCard({ useCase, index = 0, expandable = true, highlightedBlock, highlightedCategories, onCompareToggle, isCompareSelected, showCompare, onAddToRoadmap, isInRoadmap }) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const avg = getUseCaseAvgMaturity(useCase);
  const ml = getMaturityLevel(avg);
  const isPrimary = useCase.activityType === 'Primary';

  const catBreakdown = useCase.buildingBlocks.reduce((acc, b) => {
    const c = getBlockCategory(b);
    if (c) acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});

  return (
    <div
      onClick={() => expandable && setExpanded(!expanded)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: theme.colors.surface,
        border: '1px solid ' + (hovered ? theme.colors.borderStrong : theme.colors.border),
        borderRadius: theme.radii.xl,
        padding: expanded ? '14px 16px' : '10px 16px',
        cursor: expandable ? 'pointer' : 'default',
        borderLeft: '3px solid ' + (isPrimary ? theme.colors.activityPrimary : theme.colors.activitySupport),
        boxShadow: hovered ? theme.shadows.cardHover : theme.shadows.card,
        transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
        transition: `all ${theme.transitions.fast}`,
        animation: 'fadeSlideIn 0.3s ease-out both',
        animationDelay: `${Math.min(index * 30, 600)}ms`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {showCompare && (
            <span
              onClick={(e) => { e.stopPropagation(); onCompareToggle?.(useCase); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 18,
                height: 18,
                borderRadius: theme.radii.md,
                border: '2px solid ' + (isCompareSelected ? theme.colors.primary : theme.colors.borderMedium),
                background: isCompareSelected ? theme.colors.primary : 'transparent',
                cursor: 'pointer',
                flexShrink: 0,
                transition: `all ${theme.transitions.fast}`,
              }}
            >
              {isCompareSelected && <span style={{ color: '#fff', fontSize: 10, fontWeight: 800, lineHeight: 1 }}>&#10003;</span>}
            </span>
          )}
          <span style={{ fontWeight: theme.typography.weights.bold, fontSize: theme.typography.sizes.xl, color: theme.colors.textPrimary }}>{useCase.name}</span>
          <span style={{
            fontSize: theme.typography.sizes.sm,
            fontWeight: theme.typography.weights.semibold,
            padding: '2px 7px',
            borderRadius: 3,
            background: isPrimary ? theme.colors.activityPrimary + '10' : theme.colors.activitySupport + '10',
            color: isPrimary ? '#3aaa88' : '#4aa8b4',
          }}>
            {useCase.activityType}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MaturityDots score={Math.round(avg)} size={5} />
          <span style={{ fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.bold, color: ml.color }}>{avg.toFixed(1)}</span>
          <span style={{ fontSize: theme.typography.sizes.base, color: theme.colors.textDisabled }}>{VALUE_CHAIN_SHORT_LABELS[useCase.valueChainArea]}</span>
          <div style={{ display: 'flex', gap: 2 }}>
            {useCase.buildingBlocks.map(b => (
              <span key={b} style={{
                display: 'inline-block',
                width: 6,
                height: 6,
                borderRadius: 1,
                background: getBlockColor(b),
                opacity: highlightedBlock === b ? 1 : 0.6,
                transition: `opacity ${theme.transitions.fast}`,
              }} />
            ))}
          </div>
          {expandable && (
            <span style={{
              fontSize: theme.typography.sizes.base,
              color: theme.colors.textDisabled,
              transform: expanded ? 'rotate(180deg)' : 'none',
              display: 'inline-block',
              transition: `transform ${theme.transitions.normal}`,
            }}>
              &#9660;
            </span>
          )}
        </div>
      </div>
      {expanded && (
        <div style={{
          marginTop: 10,
          paddingTop: 10,
          borderTop: '1px solid ' + theme.colors.borderLight,
          animation: 'fadeIn 0.25s ease-out',
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {useCase.buildingBlocks.map(b => {
              const hl = !highlightedCategories?.length || highlightedCategories.includes(getBlockCategory(b));
              return <BuildingBlockTag key={b} name={b} showScore isHighlighted={hl} />;
            })}
          </div>
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 12 }}>
              {Object.entries(catBreakdown).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                <span key={cat} style={{ fontSize: theme.typography.sizes.base, color: CATEGORIES[cat]?.color, fontWeight: theme.typography.weights.semibold }}>
                  {CATEGORIES[cat]?.abbr}: {count}
                </span>
              ))}
            </div>
            <MaturityBadge avg={avg} />
            {onAddToRoadmap && (
              <button
                onClick={(e) => { e.stopPropagation(); onAddToRoadmap(useCase); }}
                disabled={isInRoadmap}
                style={{
                  padding: '4px 10px', borderRadius: theme.radii.lg, border: '1px solid ' + (isInRoadmap ? theme.colors.activityPrimary : theme.colors.borderMedium),
                  background: isInRoadmap ? theme.colors.activityPrimary + '15' : theme.colors.surface,
                  color: isInRoadmap ? theme.colors.activityPrimary : theme.colors.textTertiary,
                  fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.semibold,
                  cursor: isInRoadmap ? 'default' : 'pointer', fontFamily: 'inherit',
                  transition: `all ${theme.transitions.fast}`,
                }}
              >
                {isInRoadmap ? '\u2713 In Roadmap' : '+ Roadmap'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
