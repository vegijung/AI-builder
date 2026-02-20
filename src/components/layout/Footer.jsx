import { theme } from '../../styles/theme';

export function Footer() {
  return (
    <footer style={{
      marginTop: theme.spacing.xxxxl,
      paddingTop: theme.spacing.lg,
      borderTop: '1px solid ' + theme.colors.borderLight,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <span style={{
        fontSize: theme.typography.sizes.sm,
        fontWeight: theme.typography.weights.semibold,
        color: theme.colors.textFaint,
        letterSpacing: '0.04em',
      }}>
        MMG Management Consulting
      </span>
    </footer>
  );
}
