import { theme } from '../../styles/theme';

export function AiBadge({ label = 'AI-generated', variant = 'inline', dark = false }) {
  const isBlock = variant === 'block';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      fontSize: isBlock ? theme.typography.sizes.sm : theme.typography.sizes.xs,
      fontWeight: theme.typography.weights.semibold,
      color: dark ? (theme.colors.primary + 'cc') : (theme.colors.primary + '99'),
      background: dark ? (theme.colors.primary + '20') : (theme.colors.primary + '12'),
      padding: isBlock ? '3px 8px' : '1px 6px',
      borderRadius: theme.radii.md,
      lineHeight: 1.4,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: isBlock ? 12 : 10 }}>&#10024;</span>
      {label}
    </span>
  );
}

export function AiSkeleton({ lines = 3, dark = false }) {
  const bg = dark ? 'rgba(255,255,255,0.08)' : theme.colors.surfaceMuted;
  const shimmer = dark ? 'rgba(255,255,255,0.12)' : theme.colors.borderLight;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} style={{
          height: 12,
          borderRadius: 4,
          width: i === lines - 1 ? '60%' : '100%',
          background: `linear-gradient(90deg, ${bg} 25%, ${shimmer} 50%, ${bg} 75%)`,
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s ease-in-out infinite',
        }} />
      ))}
    </div>
  );
}

export function AiExplainButton({ onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        padding: '7px 14px', borderRadius: theme.radii.lg,
        border: '1px solid ' + theme.colors.primary + '40',
        background: theme.colors.primary + '08', color: theme.colors.primary,
        fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.semibold,
        cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit',
        transition: `all ${theme.transitions.fast}`,
        display: 'inline-flex', alignItems: 'center', gap: 6,
      }}
    >
      {loading ? 'Generating...' : 'Explain this use case'}
      {!loading && <span style={{ fontSize: 13 }}>&#10024;</span>}
    </button>
  );
}

export function AiExplainBox({ explanation }) {
  return (
    <div style={{
      background: theme.colors.primary + '08', borderRadius: theme.radii.lg, padding: 12,
      border: '1px solid ' + theme.colors.primary + '20',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div style={{ fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.bold, color: theme.colors.primary }}>
          AI Explanation
        </div>
        <AiBadge />
      </div>
      <p style={{ margin: 0, fontSize: theme.typography.sizes.lg, color: theme.colors.textSecondary, lineHeight: 1.6 }}>
        {explanation}
      </p>
    </div>
  );
}
