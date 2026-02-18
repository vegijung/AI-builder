import { BUILDING_BLOCKS } from '../../data/buildingBlocks';
import { USE_CASES } from '../../data/useCases';
import { theme } from '../../styles/theme';

export function Header({ searchSlot }) {
  return (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.xxl, flexWrap: 'wrap', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: theme.radii.xl,
          background: 'linear-gradient(135deg, #FBB740, #F47B20)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 16,
          fontWeight: theme.typography.weights.black,
          flexShrink: 0,
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {searchSlot}
        <span style={{ fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.bold, color: theme.colors.textFaint, letterSpacing: '0.05em' }}>
          MMG Management Consulting
        </span>
      </div>
    </header>
  );
}
