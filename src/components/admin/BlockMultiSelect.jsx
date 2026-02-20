import { useState, useRef, useEffect } from 'react';
import { theme } from '../../styles/theme';

export function BlockMultiSelect({ selected = [], options = [], onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = options.filter(o =>
    !selected.includes(o) && o.toLowerCase().includes(filter.toLowerCase())
  );

  const handleAdd = (block) => {
    onChange([...selected, block]);
    setFilter('');
  };

  const handleRemove = (block) => {
    onChange(selected.filter(b => b !== block));
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 4, padding: '6px 8px',
        border: '1px solid ' + theme.colors.borderMedium, borderRadius: theme.radii.lg,
        minHeight: 36, alignItems: 'center', cursor: 'text',
        background: theme.colors.surface,
      }}
        onClick={() => setIsOpen(true)}
      >
        {selected.map(b => (
          <span key={b} style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 8px', borderRadius: theme.radii.md,
            background: theme.colors.primary + '15', color: theme.colors.primary,
            fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.medium,
          }}>
            {b}
            <span onClick={(e) => { e.stopPropagation(); handleRemove(b); }}
              style={{ cursor: 'pointer', fontWeight: theme.typography.weights.bold, fontSize: 12, lineHeight: 1 }}>
              &#10005;
            </span>
          </span>
        ))}
        <input
          type="text"
          value={filter}
          onChange={e => { setFilter(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          placeholder={selected.length === 0 ? 'Add building blocks...' : ''}
          style={{
            border: 'none', outline: 'none', flex: 1, minWidth: 100,
            fontSize: theme.typography.sizes.lg, fontFamily: 'inherit',
            background: 'transparent', padding: '2px 0',
          }}
        />
      </div>
      {isOpen && filtered.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
          background: theme.colors.surface, border: '1px solid ' + theme.colors.borderMedium,
          borderRadius: theme.radii.lg, boxShadow: theme.shadows.elevated,
          maxHeight: 200, overflowY: 'auto', marginTop: 4,
        }}>
          {filtered.map(o => (
            <div key={o} onClick={() => handleAdd(o)} style={{
              padding: '6px 10px', cursor: 'pointer', fontSize: theme.typography.sizes.lg,
              color: theme.colors.textSecondary, transition: `background ${theme.transitions.fast}`,
            }}
              onMouseEnter={e => { e.currentTarget.style.background = theme.colors.surfaceMuted; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              {o}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
