import { BUILDING_BLOCKS } from '../../data/buildingBlocks';
import { USE_CASES } from '../../data/useCases';
import { theme } from '../../styles/theme';

export function Header({ searchSlot, onStartWorkshop }) {
  return (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.xxl, flexWrap: 'wrap', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: theme.radii.xl,
          background: 'linear-gradient(135deg, #FBB740, #F47B20)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 16, fontWeight: theme.typography.weights.black, flexShrink: 0,
        }}>
          AI
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: theme.typography.sizes.heading, fontWeight: theme.typography.weights.black, color: theme.colors.textPrimary }}>
            AI Building Blocks Framework
          </h1>
          <p style={{ margin: 0, fontSize: theme.typography.sizes.md, color: theme.colors.textFaint }}>
            {BUILDING_BLOCKS.length} Building Blocks &middot; {USE_CASES.length} Use Cases &middot; 5-Level Maturity Model
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {searchSlot}
        {onStartWorkshop && (
          <button onClick={onStartWorkshop} style={{
            padding: '8px 16px', borderRadius: theme.radii.xl, border: 'none',
            background: 'linear-gradient(135deg, #FBB740, #F47B20)', color: '#fff',
            fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold,
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 2px 8px rgba(251,183,64,0.3)',
            transition: `all ${theme.transitions.fast}`, transform: 'scale(1)',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(251,183,64,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(251,183,64,0.3)'; }}
          >
            Start Workshop
          </button>
        )}
        <span style={{ fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.bold, color: theme.colors.textFaint, letterSpacing: '0.05em' }}>
          MMG Management Consulting
        </span>
      </div>
    </header>
  );
}
