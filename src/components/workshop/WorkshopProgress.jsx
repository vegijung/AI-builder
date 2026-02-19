import { theme } from '../../styles/theme';

const STAGES = [
  { label: 'Assess', icon: '\u2713' },
  { label: 'Discover', icon: '\u2713' },
  { label: 'Prioritize', icon: '\u2713' },
  { label: 'Plan & Report', icon: '\u2713' },
];

export function WorkshopProgress({ currentStage, isMobile }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'stretch' : 'center',
      justifyContent: 'center',
      gap: isMobile ? 6 : 0,
    }}>
      {STAGES.map((s, i) => {
        const stageNum = i + 1;
        const isComplete = currentStage > stageNum;
        const isCurrent = currentStage === stageNum;
        const isPending = currentStage < stageNum;

        return (
          <div key={s.label} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 0,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: theme.radii.xl,
              background: isCurrent ? 'rgba(255,255,255,0.15)' : 'transparent',
              transition: `all ${theme.transitions.normal}`,
            }}>
              <span style={{
                display: 'inline-flex',
                width: 24,
                height: 24,
                borderRadius: theme.radii.circle,
                background: isComplete ? '#50D8A8' : isCurrent ? '#fff' : 'rgba(255,255,255,0.2)',
                color: isComplete ? '#fff' : isCurrent ? '#1a1a2e' : 'rgba(255,255,255,0.5)',
                fontSize: 12,
                fontWeight: theme.typography.weights.black,
                alignItems: 'center',
                justifyContent: 'center',
                transition: `all ${theme.transitions.normal}`,
              }}>
                {isComplete ? s.icon : stageNum}
              </span>
              <span style={{
                fontSize: theme.typography.sizes.lg,
                fontWeight: isCurrent ? theme.typography.weights.bold : theme.typography.weights.medium,
                color: isPending ? 'rgba(255,255,255,0.4)' : '#fff',
                transition: `color ${theme.transitions.normal}`,
              }}>
                {s.label}
              </span>
            </div>
            {i < STAGES.length - 1 && !isMobile && (
              <div style={{
                width: 32,
                height: 2,
                background: isComplete ? '#50D8A8' : 'rgba(255,255,255,0.15)',
                margin: '0 4px',
                borderRadius: 1,
                transition: `background ${theme.transitions.normal}`,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
