import { useState, useEffect, useCallback } from 'react';
import { onAiToast } from '../../services/aiService';
import { theme } from '../../styles/theme';

const TYPE_STYLES = {
  error: { bg: '#D9407015', border: '#D9407040', color: '#D94070' },
  warning: { bg: '#FBB74020', border: '#FBB74060', color: '#e6a020' },
};

export function Toast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev.slice(-2), { ...toast, id }]);
  }, []);

  useEffect(() => onAiToast(addToast), [addToast]);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts(prev => prev.slice(1));
    }, 4000);
    return () => clearTimeout(timer);
  }, [toasts]);

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 8,
      pointerEvents: 'none',
    }}>
      {toasts.map(t => {
        const s = TYPE_STYLES[t.type] || TYPE_STYLES.error;
        return (
          <div key={t.id} style={{
            background: theme.colors.surface, border: '1px solid ' + s.border,
            borderLeft: '3px solid ' + s.color,
            borderRadius: theme.radii.lg, padding: '10px 16px',
            boxShadow: theme.shadows.dropdown,
            fontSize: theme.typography.sizes.md, color: theme.colors.textSecondary,
            fontFamily: theme.typography.fontFamily,
            maxWidth: 360,
            animation: 'fadeSlideIn 0.25s ease-out',
            pointerEvents: 'auto',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>{t.type === 'warning' ? '⚠' : '✕'}</span>
              <span>{t.message}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
