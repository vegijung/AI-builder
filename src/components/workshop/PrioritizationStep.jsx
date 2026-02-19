import { useMemo } from 'react';
import { getUseCaseAvgMaturity, getMaturityLevel } from '../../utils/maturity';
import { computeQuadrant, getQuadrantLabel, getQuadrantColor } from '../../utils/workshop';
import { VALUE_CHAIN_SHORT_LABELS } from '../../data/constants';
import { MaturityDots } from '../shared/MaturityDots';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { theme } from '../../styles/theme';

function RatingButtons({ value, onChange, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: theme.typography.sizes.base, color: theme.colors.textMuted, width: 64, textAlign: 'right' }}>{label}</span>
      {[1, 2, 3, 4, 5].map(v => (
        <button key={v} onClick={() => onChange(v)} style={{
          width: 28, height: 28, borderRadius: theme.radii.md, border: 'none',
          background: value === v ? theme.colors.primary : theme.colors.surfaceMuted,
          color: value === v ? '#fff' : theme.colors.textMuted,
          fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold,
          cursor: 'pointer', fontFamily: 'inherit',
          transition: `all ${theme.transitions.fast}`,
        }}>
          {v}
        </button>
      ))}
    </div>
  );
}

function Matrix({ items, priorities }) {
  const size = 280;
  const pad = 32;
  const inner = size - pad * 2;

  const quadrants = [
    { label: 'Plan Carefully', x: pad, y: pad, color: '#FBB74020' },
    { label: 'Do First', x: pad + inner / 2, y: pad, color: '#50D8A820' },
    { label: 'Reconsider', x: pad, y: pad + inner / 2, color: '#8E8E9320' },
    { label: 'Delegate', x: pad + inner / 2, y: pad + inner / 2, color: '#5BC8D420' },
  ];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', margin: '0 auto' }}>
      {quadrants.map(q => (
        <g key={q.label}>
          <rect x={q.x} y={q.y} width={inner / 2} height={inner / 2} fill={q.color} rx={4} />
          <text x={q.x + inner / 4} y={q.y + inner / 4} textAnchor="middle" dominantBaseline="middle"
            fontSize={9} fill="#888" fontWeight={600}>{q.label}</text>
        </g>
      ))}

      <line x1={pad} y1={pad} x2={pad} y2={size - pad} stroke={theme.colors.borderMedium} strokeWidth={1} />
      <line x1={pad} y1={size - pad} x2={size - pad} y2={size - pad} stroke={theme.colors.borderMedium} strokeWidth={1} />
      <text x={size / 2} y={size - 6} textAnchor="middle" fontSize={10} fill={theme.colors.textMuted} fontWeight={600}>Feasibility &rarr;</text>
      <text x={8} y={size / 2} textAnchor="middle" fontSize={10} fill={theme.colors.textMuted} fontWeight={600}
        transform={`rotate(-90, 8, ${size / 2})`}>Impact &uarr;</text>

      {items.map((item, i) => {
        const p = priorities[item.useCase.name];
        if (!p) return null;
        const cx = pad + ((p.feasibility - 0.5) / 5) * inner;
        const cy = size - pad - ((p.impact - 0.5) / 5) * inner;
        const q = computeQuadrant(p.impact, p.feasibility);
        const color = getQuadrantColor(q);
        return (
          <g key={item.useCase.name}>
            <circle cx={cx} cy={cy} r={8} fill={color} stroke="#fff" strokeWidth={2}
              style={{ animation: 'scaleIn 0.3s ease-out both', animationDelay: `${i * 60}ms` }} />
            <text x={cx} y={cy + 0.5} textAnchor="middle" dominantBaseline="middle"
              fontSize={8} fill="#fff" fontWeight={800}>{i + 1}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function PrioritizationStep({ roadmapShortlist, priorities, onSetPriority }) {
  const { isMobile } = useBreakpoint();

  const stats = useMemo(() => {
    const counts = { doFirst: 0, plan: 0, delegate: 0, reconsider: 0 };
    roadmapShortlist.forEach(item => {
      const p = priorities[item.useCase.name];
      if (p) counts[computeQuadrant(p.impact, p.feasibility)]++;
    });
    return counts;
  }, [roadmapShortlist, priorities]);

  if (roadmapShortlist.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>&#9878;</div>
        <h3 style={{ fontSize: 18, fontWeight: theme.typography.weights.black, color: theme.colors.textPrimary, marginBottom: 8 }}>
          No Use Cases to Prioritize
        </h3>
        <p style={{ fontSize: theme.typography.sizes.xxl, color: theme.colors.textTertiary, maxWidth: 400, margin: '0 auto' }}>
          Go back to the Discover stage and add use cases to your roadmap first.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 24 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{ fontSize: 16, fontWeight: theme.typography.weights.black, color: theme.colors.textPrimary, marginTop: 0, marginBottom: 4 }}>
          Rate each use case
        </h3>
        <p style={{ fontSize: theme.typography.sizes.lg, color: theme.colors.textTertiary, marginTop: 0, marginBottom: 16 }}>
          Score Business Impact and Implementation Feasibility for each use case (1 = Low, 5 = High).
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 'calc(100vh - 360px)', overflowY: 'auto', paddingRight: 4 }}>
          {roadmapShortlist.map((item, i) => {
            const uc = item.useCase;
            const maturity = getUseCaseAvgMaturity(uc);
            const ml = getMaturityLevel(maturity);
            const p = priorities[uc.name] || { impact: 3, feasibility: 3 };
            const q = computeQuadrant(p.impact, p.feasibility);

            return (
              <div key={uc.name} style={{
                background: theme.colors.surface,
                border: '1px solid ' + theme.colors.border,
                borderRadius: theme.radii.xl,
                padding: '12px 14px',
                borderLeft: '3px solid ' + getQuadrantColor(q),
                boxShadow: theme.shadows.card,
                animation: 'fadeSlideIn 0.3s ease-out both',
                animationDelay: `${i * 40}ms`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      display: 'inline-flex', width: 20, height: 20, borderRadius: theme.radii.circle,
                      background: theme.colors.surfaceMuted, color: theme.colors.textMuted,
                      fontSize: 10, fontWeight: theme.typography.weights.black, alignItems: 'center', justifyContent: 'center',
                    }}>{i + 1}</span>
                    <span style={{ fontWeight: theme.typography.weights.bold, fontSize: theme.typography.sizes.xl, color: theme.colors.textPrimary }}>{uc.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MaturityDots score={Math.round(maturity)} size={4} />
                    <span style={{ fontSize: theme.typography.sizes.sm, color: theme.colors.textMuted }}>{VALUE_CHAIN_SHORT_LABELS[uc.valueChainArea]}</span>
                    <span style={{
                      fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.semibold,
                      padding: '1px 6px', borderRadius: theme.radii.md,
                      background: getQuadrantColor(q) + '20', color: getQuadrantColor(q),
                    }}>{getQuadrantLabel(q)}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 6 : 16 }}>
                  <RatingButtons
                    label="Impact"
                    value={p.impact}
                    onChange={(v) => onSetPriority(uc.name, v, p.feasibility)}
                  />
                  <RatingButtons
                    label="Feasibility"
                    value={p.feasibility}
                    onChange={(v) => onSetPriority(uc.name, p.impact, v)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ width: isMobile ? '100%' : 320, flexShrink: 0 }}>
        <h3 style={{ fontSize: 16, fontWeight: theme.typography.weights.black, color: theme.colors.textPrimary, marginTop: 0, marginBottom: 12 }}>
          Impact-Feasibility Matrix
        </h3>
        <div style={{
          background: theme.colors.surface, border: '1px solid ' + theme.colors.border, borderRadius: theme.radii.xl,
          padding: 16, boxShadow: theme.shadows.card,
        }}>
          <Matrix items={roadmapShortlist} priorities={priorities} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12, justifyContent: 'center' }}>
            {[
              { q: 'doFirst', label: 'Do First' },
              { q: 'plan', label: 'Plan Carefully' },
              { q: 'delegate', label: 'Delegate' },
              { q: 'reconsider', label: 'Reconsider' },
            ].map(({ q, label }) => (
              <div key={q} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 10, height: 10, borderRadius: theme.radii.circle, background: getQuadrantColor(q) }} />
                <span style={{ fontSize: theme.typography.sizes.base, color: theme.colors.textMuted }}>
                  {label} ({stats[q]})
                </span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <h4 style={{ fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold, color: theme.colors.textSecondary, marginBottom: 6 }}>Legend</h4>
          {roadmapShortlist.map((item, i) => {
            const p = priorities[item.useCase.name];
            const q = p ? computeQuadrant(p.impact, p.feasibility) : null;
            return (
              <div key={item.useCase.name} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0' }}>
                <span style={{
                  display: 'inline-flex', width: 16, height: 16, borderRadius: theme.radii.circle,
                  background: q ? getQuadrantColor(q) : theme.colors.surfaceMuted,
                  color: '#fff', fontSize: 8, fontWeight: 800, alignItems: 'center', justifyContent: 'center',
                }}>{i + 1}</span>
                <span style={{ fontSize: theme.typography.sizes.base, color: theme.colors.textSecondary }}>{item.useCase.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
