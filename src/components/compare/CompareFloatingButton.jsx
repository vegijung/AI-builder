import { theme } from '../../styles/theme';

export function CompareFloatingButton({ count, canCompare, onCompare, onClear }) {
  if (count === 0) return null;
  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      zIndex: 50,
      animation: 'scaleIn 0.2s ease-out',
    }}>
      <button onClick={onClear} style={{
        padding: '10px 14px',
        borderRadius: theme.radii.xl,
        border: '1px solid ' + theme.colors.borderStrong,
        background: theme.colors.surface,
        color: theme.colors.textTertiary,
        fontSize: theme.typography.sizes.lg,
        fontWeight: theme.typography.weights.semibold,
        cursor: 'pointer',
        fontFamily: 'inherit',
        boxShadow: theme.shadows.cardHover,
        transition: `all ${theme.transitions.fast}`,
      }}
        onMouseEnter={e => { e.currentTarget.style.background = theme.colors.surfaceMuted; }}
        onMouseLeave={e => { e.currentTarget.style.background = theme.colors.surface; }}
      >
        Clear
      </button>
      <button onClick={onCompare} disabled={!canCompare} style={{
        padding: '10px 20px',
        borderRadius: theme.radii.xl,
        border: 'none',
        background: canCompare ? theme.colors.textPrimary : theme.colors.borderMedium,
        color: canCompare ? theme.colors.primary : theme.colors.textDisabled,
        fontSize: theme.typography.sizes.xxl,
        fontWeight: theme.typography.weights.bold,
        cursor: canCompare ? 'pointer' : 'not-allowed',
        fontFamily: 'inherit',
        boxShadow: theme.shadows.elevated,
        transition: `all ${theme.transitions.fast}`,
        transform: canCompare ? 'scale(1)' : 'scale(0.98)',
      }}
        onMouseEnter={e => { if (canCompare) e.currentTarget.style.transform = 'scale(1.03)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = canCompare ? 'scale(1)' : 'scale(0.98)'; }}
      >
        Compare ({count}) {canCompare ? '\u2192' : ''}
      </button>
    </div>
  );
}
