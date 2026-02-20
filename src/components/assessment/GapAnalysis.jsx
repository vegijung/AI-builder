import { useMemo } from 'react';
import { computeGapAnalysis, computeReadinessScore, getRecommendedUseCases } from '../../utils/assessment';
import { getUseCaseAvgMaturity, getMaturityLevel } from '../../utils/maturity';
import { useData } from '../../contexts/DataContext';
import { SectionLabel } from '../shared/SectionLabel';
import { MaturityBadge } from '../shared/MaturityBadge';
import { MaturityDots } from '../shared/MaturityDots';
import { ReadinessRadar } from './ReadinessRadar';
import { theme } from '../../styles/theme';

export function GapAnalysis({ areaRatings, readinessRatings, onAddToRoadmap, isMobile }) {
  const { valueChainShortLabels, useCases, buildingBlockMap } = useData();

  const gaps = useMemo(() => computeGapAnalysis(areaRatings, useCases, buildingBlockMap), [areaRatings, useCases, buildingBlockMap]);
  const readinessScore = useMemo(() => computeReadinessScore(readinessRatings), [readinessRatings]);
  const recommendations = useMemo(() => getRecommendedUseCases(areaRatings, readinessRatings, 10, useCases, buildingBlockMap), [areaRatings, readinessRatings, useCases, buildingBlockMap]);

  const overallReadiness = getMaturityLevel(readinessScore);

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 24, marginBottom: 28 }}>
        <div style={{ flex: 1 }}>
          <SectionLabel>Readiness Overview</SectionLabel>
          <div style={{
            background: theme.colors.surface, border: '1px solid ' + theme.colors.border, borderRadius: theme.radii.xl,
            padding: 20, boxShadow: theme.shadows.card, textAlign: 'center',
          }}>
            <ReadinessRadar ratings={readinessRatings} />
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: theme.typography.sizes.stat, fontWeight: theme.typography.weights.black, color: overallReadiness.color }}>{readinessScore.toFixed(1)}</span>
              <span style={{ fontSize: theme.typography.sizes.lg, color: theme.colors.textMuted }}>/ 5.0 Overall Readiness</span>
            </div>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <SectionLabel>Gap Analysis by Area</SectionLabel>
          <div style={{
            background: theme.colors.surface, border: '1px solid ' + theme.colors.border, borderRadius: theme.radii.xl,
            padding: 20, boxShadow: theme.shadows.card,
          }}>
            {gaps.map(({ area, userRating, availableMaturity, gap }) => {
              const positive = gap >= 0;
              return (
                <div key={area} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.semibold, color: theme.colors.textSecondary }}>
                      {valueChainShortLabels[area] || area}
                    </span>
                    <span style={{
                      fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.bold,
                      color: positive ? theme.colors.activityPrimary : theme.colors.primaryDark,
                    }}>
                      {positive ? '+' : ''}{gap.toFixed(1)} gap
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <span style={{ fontSize: theme.typography.sizes.sm, color: theme.colors.textMuted, width: 50 }}>You: {userRating}</span>
                    <div style={{ flex: 1, height: 6, background: theme.colors.surfaceMuted, borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
                      <div style={{
                        position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 3,
                        width: (userRating / 5) * 100 + '%', background: theme.colors.activitySupport + '60',
                      }} />
                      <div style={{
                        position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 3,
                        width: (availableMaturity / 5) * 100 + '%', background: theme.colors.primary + '40',
                        borderRight: '2px solid ' + theme.colors.primary,
                      }} />
                    </div>
                    <span style={{ fontSize: theme.typography.sizes.sm, color: theme.colors.textMuted, width: 60 }}>Avail: {availableMaturity.toFixed(1)}</span>
                  </div>
                </div>
              );
            })}
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid ' + theme.colors.borderLight, display: 'flex', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 12, height: 6, borderRadius: 2, background: theme.colors.activitySupport + '60' }} />
                <span style={{ fontSize: theme.typography.sizes.sm, color: theme.colors.textMuted }}>Your Rating</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 12, height: 6, borderRadius: 2, background: theme.colors.primary + '40', borderRight: '2px solid ' + theme.colors.primary }} />
                <span style={{ fontSize: theme.typography.sizes.sm, color: theme.colors.textMuted }}>Available Maturity</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SectionLabel>Recommended Starting Points</SectionLabel>
      <p style={{ fontSize: theme.typography.sizes.lg, color: theme.colors.textTertiary, marginBottom: 12, marginTop: 0 }}>
        Use cases best matched to your current maturity and readiness — sorted by fit score.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 'calc(100vh - 400px)', overflowY: 'auto' }}>
        {recommendations.map((rec, i) => {
          const uc = rec.useCase;
          const ml = getMaturityLevel(rec.maturity);
          return (
            <div key={uc.name} style={{
              background: theme.colors.surface, border: '1px solid ' + theme.colors.border, borderRadius: theme.radii.xl,
              padding: '12px 16px', borderLeft: '3px solid ' + ml.color, boxShadow: theme.shadows.card,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8,
              animation: 'fadeSlideIn 0.3s ease-out both', animationDelay: `${i * 40}ms`,
              transition: `box-shadow ${theme.transitions.fast}, transform ${theme.transitions.fast}`,
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = theme.shadows.cardHover; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = theme.shadows.card; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                <span style={{
                  display: 'inline-flex', width: 22, height: 22, borderRadius: theme.radii.circle, background: theme.colors.primary + '20',
                  color: theme.colors.primary, fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.black, alignItems: 'center', justifyContent: 'center',
                }}>
                  {i + 1}
                </span>
                <div>
                  <span style={{ fontWeight: theme.typography.weights.bold, fontSize: theme.typography.sizes.xl, color: theme.colors.textPrimary }}>{uc.name}</span>
                  <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                    <span style={{ fontSize: theme.typography.sizes.sm, color: theme.colors.textMuted }}>{valueChainShortLabels[uc.valueChainArea]}</span>
                    <span style={{ fontSize: theme.typography.sizes.sm, color: uc.activityType === 'Primary' ? '#3aaa88' : '#4aa8b4' }}>{uc.activityType}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: theme.typography.sizes.sm, color: theme.colors.textMuted }}>Fit Score</div>
                  <div style={{ fontSize: theme.typography.sizes.xxl, fontWeight: theme.typography.weights.black, color: theme.colors.primary }}>{rec.score.toFixed(1)}</div>
                </div>
                <MaturityBadge avg={rec.maturity} />
                {onAddToRoadmap && (
                  <button
                    onClick={() => onAddToRoadmap(uc)}
                    style={{
                      padding: '6px 12px', borderRadius: theme.radii.lg, border: '1px solid ' + theme.colors.borderMedium,
                      background: theme.colors.surface, color: theme.colors.textTertiary, fontSize: theme.typography.sizes.base,
                      fontWeight: theme.typography.weights.semibold, cursor: 'pointer', fontFamily: 'inherit',
                      transition: `all ${theme.transitions.fast}`,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = theme.colors.primary; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = theme.colors.primary; }}
                    onMouseLeave={e => { e.currentTarget.style.background = theme.colors.surface; e.currentTarget.style.color = theme.colors.textTertiary; e.currentTarget.style.borderColor = theme.colors.borderMedium; }}
                  >
                    + Roadmap
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
