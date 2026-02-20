import { useState, useMemo } from 'react';
import { generateWorkshopReport, computeQuadrant, getQuadrantLabel, getQuadrantColor } from '../../utils/workshop';
import { computeReadinessScore } from '../../utils/assessment';
import { getUseCaseAvgMaturity, getMaturityLevel } from '../../utils/maturity';
import { generateWorkshopHtml, openHtmlReport } from '../../utils/exportHtml';
import { READINESS_DIMENSIONS, ROADMAP_PHASES } from '../../data/constants';
import { useData } from '../../contexts/DataContext';
import { ReadinessRadar } from '../assessment/ReadinessRadar';
import { MaturityDots } from '../shared/MaturityDots';
import { SectionLabel } from '../shared/SectionLabel';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { theme } from '../../styles/theme';

export function WorkshopReport({ workshopName, assessment, priorities, roadmapShortlist }) {
  const [copied, setCopied] = useState(false);
  const { isMobile } = useBreakpoint();
  const { valueChainShortLabels, buildingBlockMap } = useData();

  const readinessScore = useMemo(() => {
    if (!assessment?.isComplete) return 0;
    return computeReadinessScore(assessment.readinessRatings);
  }, [assessment]);

  const prioritized = useMemo(() => {
    return Object.entries(priorities).map(([name, { impact, feasibility }]) => ({
      name, impact, feasibility, quadrant: computeQuadrant(impact, feasibility),
    })).sort((a, b) => (b.impact + b.feasibility) - (a.impact + a.feasibility));
  }, [priorities]);

  const phaseItems = useMemo(() => {
    const grouped = { quickWins: [], mediumTerm: [], strategic: [] };
    (roadmapShortlist || []).forEach(item => {
      if (grouped[item.phase]) grouped[item.phase].push(item);
    });
    return grouped;
  }, [roadmapShortlist]);

  const handleExportHtml = () => {
    const html = generateWorkshopHtml(workshopName, assessment, priorities, roadmapShortlist, buildingBlockMap);
    openHtmlReport(html);
  };

  const handleCopyText = async () => {
    const text = generateWorkshopReport(workshopName, assessment, priorities, roadmapShortlist);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const w = window.open('', '_blank');
      if (w) { w.document.write('<pre>' + text.replace(/</g, '&lt;') + '</pre>'); }
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: theme.typography.weights.black, color: theme.colors.textPrimary }}>
            {workshopName || 'Workshop Report'}
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: theme.typography.sizes.lg, color: theme.colors.textMuted }}>
            {new Date().toLocaleDateString()} &middot; {Object.keys(priorities).length} use cases evaluated
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleExportHtml} style={{
            padding: '8px 16px', borderRadius: theme.radii.lg, border: 'none',
            background: theme.colors.textPrimary, color: theme.colors.primary,
            fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold,
            cursor: 'pointer', fontFamily: 'inherit',
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
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 20, marginBottom: 24 }}>
        {assessment?.isComplete && (
          <div style={{
            flex: 1, background: theme.colors.surface, border: '1px solid ' + theme.colors.border,
            borderRadius: theme.radii.xl, padding: 20, boxShadow: theme.shadows.card,
          }}>
            <SectionLabel>Readiness Overview</SectionLabel>
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <ReadinessRadar ratings={assessment.readinessRatings} />
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, alignItems: 'baseline', marginTop: 8 }}>
                <span style={{ fontSize: 28, fontWeight: theme.typography.weights.black, color: getMaturityLevel(readinessScore).color }}>
                  {readinessScore.toFixed(1)}
                </span>
                <span style={{ fontSize: theme.typography.sizes.lg, color: theme.colors.textMuted }}>/ 5.0</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {READINESS_DIMENSIONS.map(dim => (
                <div key={dim.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: theme.typography.sizes.base, color: theme.colors.textMuted }}>{dim.label}</span>
                  <span style={{ fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold, color: theme.colors.textPrimary }}>
                    {assessment.readinessRatings[dim.id]}/5
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{
          flex: 1, background: theme.colors.surface, border: '1px solid ' + theme.colors.border,
          borderRadius: theme.radii.xl, padding: 20, boxShadow: theme.shadows.card,
        }}>
          <SectionLabel>Priority Summary</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { q: 'doFirst', label: 'Do First', color: '#50D8A8' },
              { q: 'plan', label: 'Plan Carefully', color: '#FBB740' },
              { q: 'delegate', label: 'Delegate', color: '#5BC8D4' },
              { q: 'reconsider', label: 'Reconsider', color: '#8E8E93' },
            ].map(({ q, label, color }) => {
              const count = prioritized.filter(p => p.quadrant === q).length;
              return (
                <div key={q} style={{ textAlign: 'center', padding: 8, borderRadius: theme.radii.xl, background: color + '10' }}>
                  <div style={{ fontSize: 24, fontWeight: theme.typography.weights.black, color }}>{count}</div>
                  <div style={{ fontSize: theme.typography.sizes.base, color: theme.colors.textMuted }}>{label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{
        background: theme.colors.surface, border: '1px solid ' + theme.colors.border,
        borderRadius: theme.radii.xl, padding: 20, boxShadow: theme.shadows.card, marginBottom: 24,
      }}>
        <SectionLabel>Prioritized Use Cases</SectionLabel>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: theme.typography.sizes.lg }}>
            <thead>
              <tr style={{ borderBottom: '2px solid ' + theme.colors.borderMedium }}>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: theme.colors.textMuted, fontWeight: theme.typography.weights.semibold }}>#</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: theme.colors.textMuted, fontWeight: theme.typography.weights.semibold }}>Use Case</th>
                <th style={{ textAlign: 'center', padding: '8px 12px', color: theme.colors.textMuted, fontWeight: theme.typography.weights.semibold }}>Impact</th>
                <th style={{ textAlign: 'center', padding: '8px 12px', color: theme.colors.textMuted, fontWeight: theme.typography.weights.semibold }}>Feasibility</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', color: theme.colors.textMuted, fontWeight: theme.typography.weights.semibold }}>Quadrant</th>
              </tr>
            </thead>
            <tbody>
              {prioritized.map((p, i) => (
                <tr key={p.name} style={{
                  borderBottom: '1px solid ' + theme.colors.borderLight,
                  animation: 'fadeSlideIn 0.3s ease-out both',
                  animationDelay: `${i * 30}ms`,
                }}>
                  <td style={{ padding: '10px 12px', color: theme.colors.textMuted }}>{i + 1}</td>
                  <td style={{ padding: '10px 12px', fontWeight: theme.typography.weights.bold, color: theme.colors.textPrimary }}>{p.name}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <span style={{ fontWeight: theme.typography.weights.bold, color: theme.colors.primary }}>{p.impact}</span>/5
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <span style={{ fontWeight: theme.typography.weights.bold, color: theme.colors.primary }}>{p.feasibility}</span>/5
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '2px 8px', borderRadius: theme.radii.md,
                      background: getQuadrantColor(p.quadrant) + '20',
                      color: getQuadrantColor(p.quadrant),
                      fontWeight: theme.typography.weights.semibold,
                      fontSize: theme.typography.sizes.base,
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: 3, background: getQuadrantColor(p.quadrant) }} />
                      {getQuadrantLabel(p.quadrant)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(roadmapShortlist?.length > 0) && (
        <div style={{
          background: theme.colors.surface, border: '1px solid ' + theme.colors.border,
          borderRadius: theme.radii.xl, padding: 20, boxShadow: theme.shadows.card,
        }}>
          <SectionLabel>Implementation Roadmap</SectionLabel>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 16 }}>
            {ROADMAP_PHASES.map(phase => {
              const items = phaseItems[phase.id] || [];
              return (
                <div key={phase.id} style={{
                  flex: 1, borderTop: '3px solid ' + phase.color,
                  background: theme.colors.surfaceAlt, borderRadius: theme.radii.xl, padding: 14,
                }}>
                  <div style={{ fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.black, color: theme.colors.textPrimary, marginBottom: 2 }}>
                    {phase.label}
                  </div>
                  <div style={{ fontSize: theme.typography.sizes.base, color: theme.colors.textMuted, marginBottom: 10 }}>{phase.timeframe}</div>
                  {items.length === 0 ? (
                    <div style={{ fontSize: theme.typography.sizes.base, color: theme.colors.textDisabled, fontStyle: 'italic' }}>No items</div>
                  ) : items.map(item => {
                    const maturity = getUseCaseAvgMaturity(item.useCase, buildingBlockMap);
                    return (
                      <div key={item.useCase.name} style={{
                        padding: '6px 0', borderBottom: '1px solid ' + theme.colors.borderLight,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}>
                        <span style={{ fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.semibold, color: theme.colors.textSecondary }}>
                          {item.useCase.name}
                        </span>
                        <MaturityDots score={Math.round(maturity)} size={4} />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
