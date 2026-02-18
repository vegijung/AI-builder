import { theme } from '../../styles/theme';

export function StatCard({ label, value, color = theme.colors.textPrimary }) {
  return (
    <div style={{
      background: theme.colors.surface,
      border: '1px solid ' + theme.colors.border,
      borderRadius: theme.radii.xl,
      padding: '14px 12px',
      boxShadow: theme.shadows.card,
      transition: `box-shadow ${theme.transitions.fast}`,
    }}>
      <div style={{ fontSize: theme.typography.sizes.statLarge, fontWeight: theme.typography.weights.black, color }}>{value}</div>
      <div style={{ fontSize: theme.typography.sizes.base, color: theme.colors.textMuted }}>{label}</div>
    </div>
  );
}
