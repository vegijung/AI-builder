import { useState } from 'react';
import { theme } from '../../styles/theme';

export function AdminLogin({ onSignIn, onVerify }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email'); // 'email' | 'otp'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendLink = async (e) => {
    e.preventDefault();
    if (!email.toLowerCase().endsWith('@mmgmc.ch')) {
      setError('Only @mmgmc.ch email addresses are allowed.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onSignIn(email);
      setStep('otp');
    } catch (err) {
      setError(err.message || 'Failed to send magic link.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter the 6-digit code.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onVerify(email, otp);
    } catch (err) {
      setError(err.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: 420, margin: '60px auto', textAlign: 'center',
      animation: 'fadeIn 0.3s ease-out',
    }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>&#128274;</div>
      <h2 style={{ fontSize: 22, fontWeight: theme.typography.weights.black, color: theme.colors.textPrimary, marginBottom: 8 }}>
        Admin Access
      </h2>
      <p style={{ fontSize: theme.typography.sizes.lg, color: theme.colors.textTertiary, marginBottom: 24 }}>
        Sign in with your MMG email to manage use cases and building blocks.
      </p>

      <div style={{
        background: theme.colors.surface, border: '1px solid ' + theme.colors.border,
        borderRadius: theme.radii.xl, padding: 24, boxShadow: theme.shadows.card,
        textAlign: 'left',
      }}>
        {step === 'email' ? (
          <form onSubmit={handleSendLink}>
            <label style={{ fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.semibold, color: theme.colors.textSecondary, display: 'block', marginBottom: 6 }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="yourname@mmgmc.ch"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: theme.radii.lg,
                border: '1px solid ' + theme.colors.borderMedium, fontSize: theme.typography.sizes.xxl,
                fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                transition: `border-color ${theme.transitions.fast}`,
              }}
              onFocus={e => { e.target.style.borderColor = theme.colors.primary; }}
              onBlur={e => { e.target.style.borderColor = theme.colors.borderMedium; }}
            />
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '10px 16px', borderRadius: theme.radii.lg, border: 'none',
              background: theme.colors.primary, color: '#fff', fontSize: theme.typography.sizes.xxl,
              fontWeight: theme.typography.weights.bold, cursor: loading ? 'wait' : 'pointer',
              fontFamily: 'inherit', marginTop: 12, opacity: loading ? 0.7 : 1,
              transition: `all ${theme.transitions.fast}`,
            }}>
              {loading ? 'Sending...' : 'Send Magic Link'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <p style={{ fontSize: theme.typography.sizes.lg, color: theme.colors.textSecondary, marginTop: 0, marginBottom: 12 }}>
              We sent a 6-digit code to <strong>{email}</strong>. Check your inbox.
            </p>
            <label style={{ fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.semibold, color: theme.colors.textSecondary, display: 'block', marginBottom: 6 }}>
              Verification Code
            </label>
            <input
              type="text"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: theme.radii.lg,
                border: '1px solid ' + theme.colors.borderMedium, fontSize: 22,
                fontFamily: 'inherit', outline: 'none', letterSpacing: 8, textAlign: 'center',
                boxSizing: 'border-box', transition: `border-color ${theme.transitions.fast}`,
              }}
              onFocus={e => { e.target.style.borderColor = theme.colors.primary; }}
              onBlur={e => { e.target.style.borderColor = theme.colors.borderMedium; }}
              autoFocus
            />
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '10px 16px', borderRadius: theme.radii.lg, border: 'none',
              background: theme.colors.primary, color: '#fff', fontSize: theme.typography.sizes.xxl,
              fontWeight: theme.typography.weights.bold, cursor: loading ? 'wait' : 'pointer',
              fontFamily: 'inherit', marginTop: 12, opacity: loading ? 0.7 : 1,
              transition: `all ${theme.transitions.fast}`,
            }}>
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </button>
            <button type="button" onClick={() => { setStep('email'); setOtp(''); setError(''); }} style={{
              width: '100%', padding: '8px 16px', borderRadius: theme.radii.lg,
              border: '1px solid ' + theme.colors.borderMedium, background: 'transparent',
              color: theme.colors.textTertiary, fontSize: theme.typography.sizes.lg,
              fontWeight: theme.typography.weights.medium, cursor: 'pointer',
              fontFamily: 'inherit', marginTop: 8,
            }}>
              Use a different email
            </button>
          </form>
        )}

        {error && (
          <div style={{
            marginTop: 12, padding: '8px 12px', borderRadius: theme.radii.md,
            background: '#D9407015', color: '#D94070', fontSize: theme.typography.sizes.lg,
            fontWeight: theme.typography.weights.medium,
          }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
