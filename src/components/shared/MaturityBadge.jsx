import { getMaturityLevel } from '../../utils/maturity';
import { MaturityDots } from './MaturityDots';
import { theme } from '../../styles/theme';

export function MaturityBadge({ avg }) {
  const { label, color } = getMaturityLevel(avg);
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '3px 10px',
      borderRadius: theme.radii.md,
      background: color + '15',
      border: '1px solid ' + color + '30',
    }}>
      <MaturityDots score={Math.round(avg)} size={5} />
      <span style={{ fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.bold, color }}>{avg.toFixed(1)}</span>
      <span style={{ fontSize: theme.typography.sizes.sm, color, fontWeight: theme.typography.weights.medium }}>{label}</span>
    </span>
  );
}
