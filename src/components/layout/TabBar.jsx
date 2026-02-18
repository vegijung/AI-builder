import { useRef, useState, useEffect } from 'react';
import { theme } from '../../styles/theme';

export function TabBar({ tabs, activeTab, onTabChange }) {
  const containerRef = useRef(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const activeBtn = containerRef.current.querySelector(`[data-tab="${activeTab}"]`);
    if (activeBtn) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();
      setIndicator({ left: btnRect.left - containerRect.left, width: btnRect.width });
    }
  }, [activeTab]);

  const handleKeyDown = (e) => {
    const currentIndex = tabs.findIndex(t => t.id === activeTab);
    if (e.key === 'ArrowRight' && currentIndex < tabs.length - 1) {
      e.preventDefault();
      onTabChange(tabs[currentIndex + 1].id);
    } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
      e.preventDefault();
      onTabChange(tabs[currentIndex - 1].id);
    }
  };

  return (
    <div
      ref={containerRef}
      role="tablist"
      onKeyDown={handleKeyDown}
      style={{ display: 'flex', marginBottom: theme.spacing.xxl, borderBottom: '1px solid ' + theme.colors.borderSubtle, position: 'relative' }}
    >
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            data-tab={tab.id}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onTabChange(tab.id)}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderBottom: '2px solid transparent',
              background: 'transparent',
              color: isActive ? theme.colors.textPrimary : theme.colors.textFaint,
              fontSize: theme.typography.sizes.xl,
              fontWeight: isActive ? theme.typography.weights.bold : theme.typography.weights.medium,
              cursor: 'pointer',
              fontFamily: 'inherit',
              marginBottom: -1,
              transition: `color ${theme.transitions.fast}`,
              position: 'relative',
            }}
          >
            {tab.label}
          </button>
        );
      })}
      <div style={{
        position: 'absolute',
        bottom: -1,
        left: indicator.left,
        width: indicator.width,
        height: 2,
        background: theme.colors.primary,
        transition: `left ${theme.transitions.normal}, width ${theme.transitions.normal}`,
        borderRadius: 1,
      }} />
    </div>
  );
}
