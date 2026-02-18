import { MATURITY_COLORS } from '../../data/constants';
import { theme } from '../../styles/theme';

export function MaturityDots({ score, size = 7 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{
          display: 'inline-block',
          width: size,
          height: size,
          borderRadius: theme.radii.circle,
          background: i <= score ? (MATURITY_COLORS[score] || theme.colors.primary) : theme.colors.inactive,
          transition: `background ${theme.transitions.fast}`,
        }} />
      ))}
    </span>
  );
}
