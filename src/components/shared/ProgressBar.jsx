import { theme } from '../../styles/theme';

export function ProgressBar({ value, max, color, height = 8, showLabel, labelInside }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ flex: 1, height, background: theme.colors.surfaceMuted, borderRadius: theme.radii.md, overflow: 'hidden' }}>
      <div style={{
        width: pct + '%',
        height: '100%',
        borderRadius: theme.radii.md,
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingRight: labelInside ? 4 : 0,
        transition: `width ${theme.transitions.normal}`,
        minWidth: labelInside && value > 0 ? 24 : 0,
      }}>
        {labelInside && <span style={{ fontSize: theme.typography.sizes.xs, fontWeight: theme.typography.weights.black, color: '#fff' }}>{value}</span>}
      </div>
    </div>
  );
}
