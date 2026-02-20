import { theme } from '../../styles/theme';

export function Footer({ onStartWorkshop, workshopActive }) {
  return (
    <footer style={{
      marginTop: theme.spacing.xxxxl,
      paddingTop: theme.spacing.lg,
      borderTop: '1px solid ' + theme.colors.borderLight,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    }}>
      <span style={{
        fontSize: theme.typography.sizes.sm,
        fontWeight: theme.typography.weights.semibold,
        color: theme.colors.textFaint,
        letterSpacing: '0.04em',
      }}>
        MMG Management Consulting
      </span>

      {onStartWorkshop && !workshopActive && (
        <button
          onClick={onStartWorkshop}
          style={{
            padding: '6px 14px',
            borderRadius: theme.radii.lg,
            border: '1px solid ' + theme.colors.borderMedium,
            background: theme.colors.surface,
            color: theme.colors.textTertiary,
            fontSize: theme.typography.sizes.sm,
            fontWeight: theme.typography.weights.medium,
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: `all ${theme.transitions.fast}`,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = theme.colors.primary; e.currentTarget.style.color = theme.colors.primaryDark; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = theme.colors.borderMedium; e.currentTarget.style.color = theme.colors.textTertiary; }}
        >
          Start Workshop
        </button>
      )}
    </footer>
  );
}
