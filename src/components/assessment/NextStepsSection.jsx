import { MMG_EXPERTISE } from '../../data/constants';
import { theme } from '../../styles/theme';

const BOOKING_URL = import.meta.env.VITE_BOOKING_URL || null;

export function NextStepsSection({ isMobile, onDownloadReport }) {
  const url = BOOKING_URL || 'mailto:janis.locher@mmgmc.ch?subject=AI%20Strategy%20Session';
  const steps = MMG_EXPERTISE.nextSteps;
  const stats = MMG_EXPERTISE.stats;
  return (
    <div style={{
      background: `linear-gradient(135deg, ${theme.colors.textPrimary}, #3a3530)`,
      borderRadius: theme.radii.xl,
      padding: isMobile ? '16px 18px' : '24px 28px',
      marginTop: 24,
      boxShadow: theme.shadows.elevated, animation: 'fadeIn 0.3s ease-out',
    }}>
      <div style={{ fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.black, color: theme.colors.primary, marginBottom: 16 }}>
        What Happens Next
      </div>
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: 16,
        flexWrap: 'wrap',
        marginBottom: 20,
      }}>
        {steps.map((step, i) => (
          <div key={i} style={{ flex: '1 1 180px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{
              display: 'inline-flex', width: 28, height: 28, borderRadius: theme.radii.circle, flexShrink: 0,
              background: theme.colors.primary + '25', color: theme.colors.primary,
              fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.black,
              alignItems: 'center', justifyContent: 'center',
            }}>{i + 1}</span>
            <div>
              <div style={{ fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.bold, color: '#fff', marginBottom: 2 }}>
                {step.title}
              </div>
              <div style={{ fontSize: theme.typography.sizes.lg, color: '#b0aca8', lineHeight: 1.4 }}>
                {step.description}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a href={url} target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-block', padding: '12px 28px', borderRadius: theme.radii.xl,
            background: theme.colors.primary, color: theme.colors.textPrimary,
            fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.bold,
            textDecoration: 'none', transition: `opacity ${theme.transitions.fast}`,
          }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            Book a Free Session &rarr;
          </a>
          {onDownloadReport && (
            <button onClick={onDownloadReport} style={{
              padding: '12px 24px', borderRadius: theme.radii.xl,
              border: '1px solid ' + theme.colors.primary + '50', background: 'transparent',
              color: theme.colors.primary, fontSize: theme.typography.sizes.xl,
              fontWeight: theme.typography.weights.semibold, cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 6,
              transition: `all ${theme.transitions.fast}`,
            }}
              onMouseEnter={e => { e.currentTarget.style.background = theme.colors.primary + '15'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: 14 }}>&#128196;</span> Download Report
            </button>
          )}
        </div>
        <div style={{ fontSize: theme.typography.sizes.base, color: '#8a8580' }}>
          Trusted across {stats.industries} industries &middot; {stats.engagements} AI engagements delivered &middot; Avg. {stats.avgTimeToValue} to value
        </div>
      </div>
    </div>
  );
}
