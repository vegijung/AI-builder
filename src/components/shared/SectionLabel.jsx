import { theme } from '../../styles/theme';

export function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: theme.typography.sizes.base,
      fontWeight: theme.typography.weights.bold,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      color: theme.colors.textFaint,
      marginBottom: theme.spacing.sm,
    }}>
      {children}
    </div>
  );
}
