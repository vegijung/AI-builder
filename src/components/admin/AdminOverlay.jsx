import { AdminLogin } from './AdminLogin';
import { AdminTab } from './AdminTab';
import { theme } from '../../styles/theme';

export function AdminOverlay({ auth, onClose }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 900,
        background: 'rgba(42,37,32,0.4)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: 40, overflow: 'auto',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: theme.colors.background,
        borderRadius: theme.radii.xl,
        boxShadow: theme.shadows.elevated,
        width: '95vw',
        maxWidth: 1100,
        maxHeight: 'calc(100vh - 80px)',
        overflow: 'auto',
        padding: 32,
        position: 'relative',
        animation: 'fadeIn 0.2s ease-out',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'sticky', top: 0, float: 'right',
            width: 36, height: 36, borderRadius: theme.radii.circle,
            border: '1px solid ' + theme.colors.borderMedium,
            background: theme.colors.surface,
            color: theme.colors.textTertiary,
            fontSize: 18, cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 2,
          }}
          title="Close"
        >
          &times;
        </button>

        {auth.isAdmin ? (
          <AdminTab onSignOut={auth.signOut} userEmail={auth.user?.email} />
        ) : (
          <AdminLogin onSignIn={auth.signIn} onVerify={auth.verify} />
        )}
      </div>
    </div>
  );
}
