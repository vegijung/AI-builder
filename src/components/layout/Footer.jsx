import { CATEGORIES, CATEGORY_NAMES } from '../../data/categories';
import { MATURITY_LABELS, MATURITY_COLORS } from '../../data/constants';
import { theme } from '../../styles/theme';

export function Footer() {
  return (
    <footer style={{
      marginTop: theme.spacing.xxxxl,
      paddingTop: theme.spacing.lg,
      borderTop: '1px solid ' + theme.colors.border,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
        {CATEGORY_NAMES.map(cat => (
          <span key={cat} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: theme.radii.sm, background: CATEGORIES[cat].color }} />
            <span style={{ fontSize: theme.typography.sizes.base, color: theme.colors.textFaint }}>{cat}</span>
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        {MATURITY_LABELS.slice(1).map((label, idx) => (
          <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: theme.radii.circle, background: MATURITY_COLORS[idx + 1] }} />
            <span style={{ fontSize: theme.typography.sizes.sm, color: theme.colors.textFaint }}>{label}</span>
          </span>
        ))}
      </div>
    </footer>
  );
}
