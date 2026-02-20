import { theme } from '../../styles/theme';

export function Header({ searchSlot, onAdminClick, isAdmin, onHelpClick }) {
  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: theme.spacing.xxl, flexWrap: 'wrap', gap: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 44, height: 44, borderRadius: theme.radii.xl,
          background: 'linear-gradient(135deg, #FBB740, #F47B20)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 17, fontWeight: theme.typography.weights.black, flexShrink: 0,
        }}>
          AI
        </div>
        <h1 style={{
          margin: 0, fontSize: theme.typography.sizes.heading,
          fontWeight: theme.typography.weights.black, color: theme.colors.textPrimary,
        }}>
          AI Building Blocks
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {searchSlot}
        <button
          onClick={onHelpClick}
          title="App tour"
          style={{
            width: 38, height: 38, borderRadius: theme.radii.circle,
            border: `1px solid ${theme.colors.borderMedium}`,
            background: theme.colors.surface,
            color: theme.colors.textMuted,
            fontSize: 17, fontWeight: theme.typography.weights.bold, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: `all ${theme.transitions.fast}`, fontFamily: 'inherit',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = theme.colors.primary; e.currentTarget.style.color = theme.colors.primaryDark; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = theme.colors.borderMedium; e.currentTarget.style.color = theme.colors.textMuted; }}
        >
          ?
        </button>
        <button
          onClick={onAdminClick}
          title={isAdmin ? 'Admin Panel' : 'Admin Login'}
          style={{
            width: 38, height: 38, borderRadius: theme.radii.circle,
            border: isAdmin ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.borderMedium}`,
            background: isAdmin ? theme.colors.surfaceAlt : theme.colors.surface,
            color: isAdmin ? theme.colors.primaryDark : theme.colors.textMuted,
            fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: `all ${theme.transitions.fast}`,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = theme.colors.primary; e.currentTarget.style.color = theme.colors.primaryDark; }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = isAdmin ? theme.colors.primary : theme.colors.borderMedium;
            e.currentTarget.style.color = isAdmin ? theme.colors.primaryDark : theme.colors.textMuted;
          }}
        >
          &#9881;
        </button>
      </div>
    </header>
  );
}
