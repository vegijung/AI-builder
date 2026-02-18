import { useState } from 'react';
import { getBlockColor, getBlockMaturity } from '../../utils/maturity';
import { MaturityDots } from './MaturityDots';
import { theme } from '../../styles/theme';

export function BuildingBlockTag({ name, variant = 'default', isSelected, isHighlighted = true, showScore = false, onClick }) {
  const [hovered, setHovered] = useState(false);
  const color = getBlockColor(name);
  const score = getBlockMaturity(name);

  const isActive = variant === 'filter' ? isSelected : true;
  const bg = isActive ? color + '18' : theme.colors.surfaceMuted;
  const fg = isActive ? (isSelected && variant === 'filter' ? '#fff' : color) : theme.colors.textDisabled;
  const bgFinal = isSelected && variant === 'filter' ? color : bg;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: showScore ? 6 : 4,
        padding: showScore ? '5px 10px' : '3px 8px',
        borderRadius: showScore ? 5 : theme.radii.md,
        border: showScore ? '1px solid ' + color + '30' : 'none',
        background: bgFinal,
        color: fg,
        fontSize: showScore ? theme.typography.sizes.md : theme.typography.sizes.base,
        fontWeight: theme.typography.weights.semibold,
        cursor: onClick ? 'pointer' : 'default',
        fontFamily: 'inherit',
        opacity: !isHighlighted ? 0.4 : 1,
        transform: hovered && onClick ? 'scale(1.03)' : 'scale(1)',
        transition: `all ${theme.transitions.fast}`,
      }}
    >
      {showScore && <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: theme.radii.sm, background: color }} />}
      <span style={{ color: showScore ? theme.colors.textSecondary : fg }}>{name}</span>
      {showScore ? <MaturityDots score={score} size={5} /> : (
        <span style={{ fontSize: theme.typography.sizes.xs, fontWeight: theme.typography.weights.black, opacity: 0.7 }}>{score}</span>
      )}
    </button>
  );
}
