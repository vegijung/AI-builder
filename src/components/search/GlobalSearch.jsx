import { useState, useRef, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { getBlockColor } from '../../utils/maturity';
import { theme } from '../../styles/theme';

function HighlightText({ text, query }) {
  if (!query || query.length < 2) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: theme.colors.primary + '40', color: 'inherit', borderRadius: 2, padding: '0 1px' }}>{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export function GlobalSearch({ search, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const { buildingBlockMap, categories } = useData();

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (search.totalResults > 0 && search.inputValue.length >= 2) setIsOpen(true);
    else setIsOpen(false);
    setFocusIndex(-1);
  }, [search.totalResults, search.inputValue]);

  const allResults = [];
  search.results.useCases.forEach(uc => allResults.push({ type: 'useCase', item: uc, label: uc.name }));
  search.results.blocks.forEach(b => allResults.push({ type: 'block', item: b, label: b.name }));
  search.results.categories.forEach(c => allResults.push({ type: 'category', item: c, label: c }));
  search.results.areas.forEach(a => allResults.push({ type: 'area', item: a, label: a }));

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocusIndex(i => Math.min(i + 1, allResults.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setFocusIndex(i => Math.max(i - 1, -1)); }
    else if (e.key === 'Enter' && focusIndex >= 0) { e.preventDefault(); handleSelect(allResults[focusIndex]); }
    else if (e.key === 'Escape') { setIsOpen(false); inputRef.current?.blur(); }
  };

  const handleSelect = (result) => {
    setIsOpen(false);
    search.clearSearch();
    if (result.type === 'useCase') onNavigate?.({ tab: 'explorer', filter: { area: result.item.valueChainArea } });
    else if (result.type === 'block') onNavigate?.({ tab: 'explorer', filter: { block: result.item.name } });
    else if (result.type === 'category') onNavigate?.({ tab: 'explorer', filter: { category: result.item } });
    else if (result.type === 'area') onNavigate?.({ tab: 'explorer', filter: { area: result.item } });
  };

  const typeLabels = { useCase: 'Use Cases', block: 'Building Blocks', category: 'Categories', area: 'Value Chain' };
  const typeColors = { useCase: theme.colors.textPrimary, block: theme.colors.primaryDark, category: theme.colors.activityPrimary, area: theme.colors.activitySupport };

  let currentType = '';

  return (
    <div ref={containerRef} style={{ position: 'relative', width: 280 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 12px',
        borderRadius: theme.radii.xl,
        border: '1px solid ' + (isOpen ? theme.colors.primary : theme.colors.borderMedium),
        background: theme.colors.surface,
        transition: `border-color ${theme.transitions.fast}, box-shadow ${theme.transitions.fast}`,
        boxShadow: isOpen ? '0 0 0 3px ' + theme.colors.primary + '20' : 'none',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.colors.textMuted} strokeWidth="2.5" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search use cases, blocks..."
          value={search.inputValue}
          onChange={e => search.updateQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (search.totalResults > 0) setIsOpen(true); }}
          style={{
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: theme.typography.sizes.lg,
            fontFamily: 'inherit',
            color: theme.colors.textPrimary,
            flex: 1,
            width: '100%',
          }}
        />
        {search.inputValue && (
          <button onClick={() => search.clearSearch()} style={{
            border: 'none', background: 'none', cursor: 'pointer', color: theme.colors.textMuted, fontSize: 14, padding: 0, lineHeight: 1,
          }}>&#10005;</button>
        )}
      </div>
      {isOpen && allResults.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: 4,
          background: theme.colors.surface,
          border: '1px solid ' + theme.colors.border,
          borderRadius: theme.radii.xl,
          boxShadow: theme.shadows.dropdown,
          maxHeight: 400,
          overflowY: 'auto',
          zIndex: 100,
          animation: 'scaleIn 0.15s ease-out',
        }}>
          {allResults.map((result, idx) => {
            const showHeader = result.type !== currentType;
            currentType = result.type;
            return (
              <div key={result.type + '-' + result.label}>
                {showHeader && (
                  <div style={{
                    padding: '8px 12px 4px',
                    fontSize: theme.typography.sizes.sm,
                    fontWeight: theme.typography.weights.bold,
                    color: typeColors[result.type],
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderTop: idx > 0 ? '1px solid ' + theme.colors.borderLight : 'none',
                  }}>
                    {typeLabels[result.type]}
                  </div>
                )}
                <div
                  onClick={() => handleSelect(result)}
                  style={{
                    padding: '6px 12px',
                    cursor: 'pointer',
                    fontSize: theme.typography.sizes.lg,
                    fontWeight: theme.typography.weights.medium,
                    color: theme.colors.textSecondary,
                    background: focusIndex === idx ? theme.colors.surfaceMuted : 'transparent',
                    transition: `background ${theme.transitions.fast}`,
                  }}
                  onMouseEnter={() => setFocusIndex(idx)}
                >
                  <HighlightText text={result.label} query={search.query} />
                  {result.type === 'useCase' && (
                    <span style={{ marginLeft: 8, fontSize: theme.typography.sizes.sm, color: theme.colors.textMuted }}>
                      {result.item.valueChainArea} &middot; {result.item.activityType}
                    </span>
                  )}
                  {result.type === 'block' && (
                    <span style={{ marginLeft: 8, display: 'inline-block', width: 6, height: 6, borderRadius: 1, background: getBlockColor(result.item.name, buildingBlockMap, categories), verticalAlign: 'middle' }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
