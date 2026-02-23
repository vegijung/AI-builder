import { useMemo, useState } from 'react';
import { ROADMAP_PHASES } from '../../data/constants';
import { getUseCaseAvgMaturity, getMaturityLevel, getBlockColor } from '../../utils/maturity';
import { computePhaseBlocks, findDependencies, generateRoadmapText } from '../../utils/roadmap';
import { generateRoadmapHtml, openHtmlReport } from '../../utils/exportHtml';
import { useData } from '../../contexts/DataContext';
import { SectionLabel } from '../shared/SectionLabel';
import { MaturityBadge } from '../shared/MaturityBadge';
import { MaturityDots } from '../shared/MaturityDots';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { theme } from '../../styles/theme';

function PhaseColumn({ phase, items, allItems, onRemove, onPhaseChange }) {
  const { buildingBlockMap, categories, valueChainShortLabels } = useData();
  const blocks = useMemo(() => computePhaseBlocks(items.map(i => i.useCase)), [items]);
  const avgMaturity = items.length ? items.reduce((s, i) => s + getUseCaseAvgMaturity(i.useCase, buildingBlockMap), 0) / items.length : 0;

  return (
    <div style={{
      flex: 1, minWidth: 220, background: theme.colors.surfaceAlt, borderRadius: theme.radii.xl, padding: 16,
      borderTop: '3px solid ' + phase.color,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: theme.typography.sizes.xxl, fontWeight: theme.typography.weights.black, color: theme.colors.textPrimary }}>{phase.label}</div>
          <div style={{ fontSize: theme.typography.sizes.base, color: theme.colors.textMuted }}>{phase.timeframe}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: theme.typography.sizes.stat, fontWeight: theme.typography.weights.black, color: phase.color }}>{items.length}</span>
          {items.length > 0 && <MaturityDots score={Math.round(avgMaturity)} size={4} />}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minHeight: 100 }}>
        {items.length === 0 && (
          <div style={{ padding: 20, textAlign: 'center', color: theme.colors.textMuted, fontSize: theme.typography.sizes.lg, border: '2px dashed ' + theme.colors.borderMedium, borderRadius: theme.radii.xl }}>
            {phase.description}
          </div>
        )}
        {items.map((item, i) => {
          const uc = item.useCase;
          const maturity = getUseCaseAvgMaturity(uc, buildingBlockMap);
          const ml = getMaturityLevel(maturity);
          const deps = findDependencies(uc, allItems.map(x => x.useCase));

          return (
            <div key={uc.name} style={{
              background: theme.colors.surface, border: '1px solid ' + theme.colors.border, borderRadius: theme.radii.xl,
              padding: '10px 12px', boxShadow: theme.shadows.card,
              animation: 'fadeSlideIn 0.3s ease-out both', animationDelay: `${i * 40}ms`,
              transition: `box-shadow ${theme.transitions.fast}`,
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = theme.shadows.cardHover; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = theme.shadows.card; }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 4 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: theme.typography.weights.bold, fontSize: theme.typography.sizes.lg, color: theme.colors.textPrimary, marginBottom: 2 }}>{uc.name}</div>
                  <div style={{ fontSize: theme.typography.sizes.sm, color: theme.colors.textMuted }}>{valueChainShortLabels[uc.valueChainArea]}</div>
                </div>
                <button onClick={() => onRemove(uc.name)} style={{
                  border: 'none', background: 'none', cursor: 'pointer', color: theme.colors.textMuted, fontSize: 14, padding: '0 2px', lineHeight: 1,
                }} title="Remove">&#10005;</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                <MaturityDots score={Math.round(maturity)} size={4} />
                <span style={{ fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.bold, color: ml.color }}>{maturity.toFixed(1)}</span>
              </div>
              {deps.length > 0 && (
                <div style={{ marginTop: 6, fontSize: theme.typography.sizes.sm, color: theme.colors.activitySupport }}>
                  Shares {deps[0].count} blocks with {deps[0].useCase.name}
                </div>
              )}
              <div style={{ marginTop: 6, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                {ROADMAP_PHASES.filter(p => p.id !== item.phase).map(p => (
                  <button key={p.id} onClick={() => onPhaseChange(uc.name, p.id)} style={{
                    fontSize: theme.typography.sizes.sm, padding: '2px 6px', borderRadius: theme.radii.md,
                    border: '1px solid ' + p.color + '40', background: 'transparent', color: p.color,
                    cursor: 'pointer', fontFamily: 'inherit', fontWeight: theme.typography.weights.medium,
                    transition: `all ${theme.transitions.fast}`,
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = p.color + '15'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    Move to {p.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {blocks.length > 0 && (
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid ' + theme.colors.borderLight }}>
          <div style={{ fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.bold, color: theme.colors.textMuted, marginBottom: 4 }}>
            Required Blocks ({blocks.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {blocks.map(b => (
              <span key={b} style={{
                display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 6px', borderRadius: theme.radii.md,
                background: getBlockColor(b, buildingBlockMap, categories) + '15', fontSize: theme.typography.sizes.sm, color: getBlockColor(b, buildingBlockMap, categories), fontWeight: theme.typography.weights.medium,
              }}>
                <span style={{ width: 4, height: 4, borderRadius: 1, background: getBlockColor(b, buildingBlockMap, categories) }} />
                {b}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function RoadmapTab({ roadmap }) {
  const { shortlist, removeFromRoadmap, setPhase, clearRoadmap } = roadmap;
  const { isMobile } = useBreakpoint();
  const { buildingBlockMap, categories, valueChainShortLabels } = useData();
  const [copied, setCopied] = useState(false);

  const phaseItems = useMemo(() => {
    const grouped = { quickWins: [], mediumTerm: [], strategic: [] };
    shortlist.forEach(item => {
      if (grouped[item.phase]) grouped[item.phase].push(item);
    });
    return grouped;
  }, [shortlist]);

  const totalBlocks = useMemo(() => {
    const all = new Set();
    shortlist.forEach(item => item.useCase.buildingBlocks.forEach(b => all.add(b)));
    return all.size;
  }, [shortlist]);

  const handleExportHtml = () => {
    const html = generateRoadmapHtml(shortlist, buildingBlockMap, categories, valueChainShortLabels);
    openHtmlReport(html);
  };

  const handleCopyText = async () => {
    const text = generateRoadmapText(phaseItems, shortlist, buildingBlockMap);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const w = window.open('', '_blank');
      if (w) { w.document.write('<pre>' + text.replace(/</g, '&lt;') + '</pre>'); }
    }
  };

  if (shortlist.length === 0) {
    return (
      <div style={{ animation: 'fadeIn 0.3s ease-out', textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>&#128736;</div>
        <h2 style={{ fontSize: 20, fontWeight: theme.typography.weights.black, color: theme.colors.textPrimary, marginBottom: 8 }}>
          Your Roadmap is Empty
        </h2>
        <p style={{ fontSize: theme.typography.sizes.xxl, color: theme.colors.textTertiary, maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
          Add use cases from the <strong>Explore</strong> or <strong>Assessment</strong> tabs
          to start building your AI implementation roadmap.
        </p>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <SectionLabel>Implementation Roadmap</SectionLabel>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <span style={{ fontSize: theme.typography.sizes.lg, color: theme.colors.textTertiary }}>
              {shortlist.length} use cases &middot; {totalBlocks} unique building blocks
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleExportHtml} style={{
            padding: '8px 16px', borderRadius: theme.radii.lg, border: 'none',
            background: theme.colors.textPrimary, color: theme.colors.primary,
            fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold,
            cursor: 'pointer', fontFamily: 'inherit', transition: `all ${theme.transitions.fast}`,
          }}>
            Export Report
          </button>
          <button onClick={handleCopyText} style={{
            padding: '8px 16px', borderRadius: theme.radii.lg, border: '1px solid ' + theme.colors.borderStrong,
            background: theme.colors.surface, color: theme.colors.textTertiary,
            fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.semibold,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            {copied ? '\u2713 Copied!' : 'Copy Text'}
          </button>
          <button onClick={clearRoadmap} style={{
            padding: '8px 16px', borderRadius: theme.radii.lg, border: '1px solid ' + theme.colors.borderStrong,
            background: theme.colors.surface, color: theme.colors.textTertiary,
            fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.semibold,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Clear All
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 16 }}>
        {ROADMAP_PHASES.map(phase => (
          <PhaseColumn
            key={phase.id}
            phase={phase}
            items={phaseItems[phase.id] || []}
            allItems={shortlist}
            onRemove={removeFromRoadmap}
            onPhaseChange={setPhase}
          />
        ))}
      </div>

      <div style={{
        marginTop: 24, padding: '14px 20px', borderRadius: theme.radii.xl,
        background: theme.colors.surfaceAlt, border: '1px solid ' + theme.colors.borderLight,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10,
      }}>
        <span style={{ fontSize: theme.typography.sizes.lg, color: theme.colors.textTertiary }}>
          Need help implementing these? <strong style={{ color: theme.colors.textSecondary }}>MMG can help you go from roadmap to reality.</strong>
        </span>
        <a
          href={import.meta.env.VITE_BOOKING_URL || 'mailto:janis.locher@mmgmc.ch?subject=AI%20Roadmap%20Support'}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block', padding: '8px 18px', borderRadius: theme.radii.lg,
            background: theme.colors.textPrimary, color: theme.colors.primary,
            fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold,
            textDecoration: 'none', transition: `opacity ${theme.transitions.fast}`, flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
        >
          Book a Strategy Session
        </a>
      </div>
    </div>
  );
}
