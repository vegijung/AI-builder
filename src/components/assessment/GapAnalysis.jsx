import { useState, useMemo } from 'react';
import {
  computeGapAnalysis, computeReadinessScore, computeDimensionScores,
  getRecommendedUseCases, generateExecutiveSummary, getReadinessInterpretation,
  getTrafficLight, getFitLabel, generateWhyText, generateWhatYouNeed,
} from '../../utils/assessment';
import { getMaturityLevel } from '../../utils/maturity';
import { useData } from '../../contexts/DataContext';
import { SectionLabel } from '../shared/SectionLabel';
import { MaturityBadge } from '../shared/MaturityBadge';
import { BuildingBlockTag } from '../shared/BuildingBlockTag';
import { ReadinessRadar } from './ReadinessRadar';
import { LeadCaptureCard } from './LeadCaptureCard';
import { STRATEGIC_PRIORITIES, READINESS_DIMENSIONS } from '../../data/constants';
import { theme } from '../../styles/theme';

const priorityMap = Object.fromEntries(STRATEGIC_PRIORITIES.map(p => [p.id, p.label]));

// ---------------------------------------------------------------------------
// ProfileSummary
// ---------------------------------------------------------------------------
function ProfileSummary({ companyProfile, priorities }) {
  const hasProfile = companyProfile && (companyProfile.industry || companyProfile.companySize || companyProfile.role);
  const hasPriorities = priorities && priorities.length > 0;
  if (!hasProfile && !hasPriorities) return null;

  return (
    <div style={{
      background: theme.colors.surface, border: '1px solid ' + theme.colors.border, borderRadius: theme.radii.xl,
      padding: 16, marginBottom: 24, boxShadow: theme.shadows.card,
    }}>
      <div style={{ fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold, color: theme.colors.textPrimary, marginBottom: 8 }}>
        Your Profile
      </div>
      {hasProfile && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: hasPriorities ? 10 : 0 }}>
          {companyProfile.industry && (
            <span style={{ padding: '4px 10px', borderRadius: theme.radii.lg, background: theme.colors.surfaceMuted, fontSize: theme.typography.sizes.lg, color: theme.colors.textSecondary }}>
              {companyProfile.industry}
            </span>
          )}
          {companyProfile.companySize && (
            <span style={{ padding: '4px 10px', borderRadius: theme.radii.lg, background: theme.colors.surfaceMuted, fontSize: theme.typography.sizes.lg, color: theme.colors.textSecondary }}>
              {companyProfile.companySize} employees
            </span>
          )}
          {companyProfile.role && (
            <span style={{ padding: '4px 10px', borderRadius: theme.radii.lg, background: theme.colors.surfaceMuted, fontSize: theme.typography.sizes.lg, color: theme.colors.textSecondary }}>
              {companyProfile.role}
            </span>
          )}
        </div>
      )}
      {hasPriorities && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <span style={{ fontSize: theme.typography.sizes.lg, color: theme.colors.textMuted, marginRight: 4, alignSelf: 'center' }}>Priorities:</span>
          {priorities.map(pId => (
            <span key={pId} style={{
              padding: '3px 10px', borderRadius: theme.radii.lg,
              background: theme.colors.primary + '15', color: theme.colors.primary,
              fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.semibold,
            }}>
              {priorityMap[pId] || pId}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ExecutiveSummary
// ---------------------------------------------------------------------------
function ExecutiveSummary({ items }) {
  if (!items || !items.length) return null;
  return (
    <div style={{
      background: `linear-gradient(135deg, ${theme.colors.textPrimary}, #3a3530)`,
      borderRadius: theme.radii.xl, padding: 24, marginBottom: 24,
      boxShadow: theme.shadows.elevated, animation: 'fadeIn 0.3s ease-out',
    }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: theme.typography.weights.black, color: theme.colors.primary }}>
        What to Do Next
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{
              display: 'inline-flex', width: 24, height: 24, borderRadius: theme.radii.circle, flexShrink: 0,
              background: theme.colors.primary + '25', color: theme.colors.primary,
              fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.black,
              alignItems: 'center', justifyContent: 'center', marginTop: 1,
            }}>
              {i + 1}
            </span>
            <div>
              <div style={{ fontSize: theme.typography.sizes.xxl, fontWeight: theme.typography.weights.bold, color: theme.colors.primary, marginBottom: 2 }}>
                {item.title}
              </div>
              <div style={{ fontSize: theme.typography.sizes.xl, color: '#ccc8c4', lineHeight: 1.5 }}>
                {item.text}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ReadinessBreakdown
// ---------------------------------------------------------------------------
function ReadinessBreakdown({ readinessRatings, dimensionScores }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
      {READINESS_DIMENSIONS.map(dim => {
        const avg = dimensionScores[dim.id] ?? 3;
        const tl = getTrafficLight(avg);
        const interpretation = getReadinessInterpretation(dim.id, avg);
        return (
          <div key={dim.id} style={{
            background: theme.colors.surfaceAlt, borderRadius: theme.radii.lg, padding: '12px 14px',
            border: '1px solid ' + theme.colors.borderLight,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 10, height: 10, borderRadius: theme.radii.circle, background: tl.color, flexShrink: 0,
                }} />
                <span style={{ fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.bold, color: theme.colors.textPrimary }}>
                  {dim.label}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: theme.typography.sizes.xxl, fontWeight: theme.typography.weights.black, color: tl.color }}>
                  {avg.toFixed(1)}
                </span>
                <span style={{ fontSize: theme.typography.sizes.base, color: theme.colors.textMuted }}>/5</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              {dim.subQuestions.map(sq => {
                const val = readinessRatings[sq.id] ?? 3;
                const sqTl = getTrafficLight(val);
                return (
                  <div key={sq.id} style={{ flex: 1 }}>
                    <div style={{ fontSize: theme.typography.sizes.sm, color: theme.colors.textMuted, marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {sq.label}
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: theme.colors.surfaceMuted, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 3, width: (val / 5) * 100 + '%', background: sqTl.color, transition: 'width 0.3s ease' }} />
                    </div>
                    <div style={{ fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.bold, color: sqTl.color, marginTop: 2 }}>
                      {val}/5
                    </div>
                  </div>
                );
              })}
            </div>
            <p style={{ margin: 0, fontSize: theme.typography.sizes.lg, color: theme.colors.textTertiary, lineHeight: 1.5 }}>
              {interpretation}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// FitIndicator
// ---------------------------------------------------------------------------
function FitIndicator({ score }) {
  const fit = getFitLabel(score);
  return (
    <div style={{ textAlign: 'right', minWidth: 80 }}>
      <div style={{ fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.semibold, color: fit.color, marginBottom: 3 }}>
        {fit.label}
      </div>
      <div style={{ width: 60, height: 5, borderRadius: 3, background: theme.colors.surfaceMuted, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 3, width: Math.min(100, (score / 5) * 100) + '%', background: fit.color }} />
      </div>
      <div style={{ fontSize: theme.typography.sizes.sm, color: theme.colors.textMuted, marginTop: 2 }}>
        {score.toFixed(1)}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// RecommendationCard
// ---------------------------------------------------------------------------
function RecommendationCard({ rec, index, readinessScore, areaRatings, priorities, dimensionScores, valueChainShortLabels, onAddToRoadmap, buildingBlockMap }) {
  const [expanded, setExpanded] = useState(false);
  const uc = rec.useCase;
  const ml = getMaturityLevel(rec.maturity);
  const whyText = useMemo(() => generateWhyText(rec, readinessScore, areaRatings, priorities), [rec, readinessScore, areaRatings, priorities]);
  const whatYouNeed = useMemo(() => generateWhatYouNeed(rec, dimensionScores, buildingBlockMap), [rec, dimensionScores, buildingBlockMap]);

  return (
    <div style={{
      background: theme.colors.surface, border: '1px solid ' + theme.colors.border, borderRadius: theme.radii.xl,
      borderLeft: '3px solid ' + ml.color, boxShadow: theme.shadows.card, overflow: 'hidden',
      animation: 'fadeSlideIn 0.3s ease-out both', animationDelay: `${index * 40}ms`,
      transition: `box-shadow ${theme.transitions.fast}, transform ${theme.transitions.fast}`,
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = theme.shadows.cardHover; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = theme.shadows.card; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Collapsed header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, padding: '12px 16px', cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <span style={{
            display: 'inline-flex', width: 22, height: 22, borderRadius: theme.radii.circle, background: theme.colors.primary + '20',
            color: theme.colors.primary, fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.black, alignItems: 'center', justifyContent: 'center',
          }}>
            {index + 1}
          </span>
          <div>
            <span style={{ fontWeight: theme.typography.weights.bold, fontSize: theme.typography.sizes.xl, color: theme.colors.textPrimary }}>{uc.name}</span>
            <div style={{ display: 'flex', gap: 8, marginTop: 2, flexWrap: 'wrap' }}>
              <span style={{ fontSize: theme.typography.sizes.sm, color: theme.colors.textMuted }}>{valueChainShortLabels[uc.valueChainArea]}</span>
              <span style={{ fontSize: theme.typography.sizes.sm, color: uc.activityType === 'Primary' ? '#3aaa88' : '#4aa8b4' }}>{uc.activityType}</span>
              {rec.alignedPriorities && rec.alignedPriorities.map(p => (
                <span key={p.id} style={{
                  fontSize: theme.typography.sizes.sm, padding: '1px 6px', borderRadius: theme.radii.md,
                  background: theme.colors.primary + '15', color: theme.colors.primary, fontWeight: theme.typography.weights.semibold,
                }}>
                  {p.label}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FitIndicator score={rec.score} />
          <MaturityBadge avg={rec.maturity} />
          {onAddToRoadmap && (
            <button
              onClick={(e) => { e.stopPropagation(); onAddToRoadmap(uc); }}
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
          <span style={{
            fontSize: theme.typography.sizes.lg, color: theme.colors.textMuted,
            transition: `transform ${theme.transitions.fast}`, transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
          }}>
            &#9660;
          </span>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid ' + theme.colors.borderLight, animation: 'fadeIn 0.2s ease-out' }}>
          {/* Building blocks */}
          <div style={{ marginTop: 12, marginBottom: 14 }}>
            <div style={{ fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.semibold, color: theme.colors.textMuted, marginBottom: 6 }}>
              AI Building Blocks
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {(uc.buildingBlocks || []).map(bName => (
                <BuildingBlockTag key={bName} name={bName} showScore />
              ))}
            </div>
          </div>

          {/* Why this fits */}
          <div style={{
            background: theme.colors.surfaceAlt, borderRadius: theme.radii.lg, padding: 12, marginBottom: 10,
            border: '1px solid ' + theme.colors.borderLight,
          }}>
            <div style={{ fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.bold, color: theme.colors.textPrimary, marginBottom: 4 }}>
              Why This Fits You
            </div>
            <p style={{ margin: 0, fontSize: theme.typography.sizes.lg, color: theme.colors.textTertiary, lineHeight: 1.6 }}>
              {whyText}
            </p>
          </div>

          {/* What you'd need */}
          {whatYouNeed.length > 0 && (
            <div style={{
              background: '#D9407008', borderRadius: theme.radii.lg, padding: 12,
              border: '1px solid #D9407020',
            }}>
              <div style={{ fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.bold, color: theme.colors.textPrimary, marginBottom: 4 }}>
                What You&rsquo;d Need
              </div>
              {whatYouNeed.map((need, ni) => (
                <p key={ni} style={{ margin: ni > 0 ? '6px 0 0 0' : 0, fontSize: theme.typography.sizes.lg, color: theme.colors.textTertiary, lineHeight: 1.5 }}>
                  &bull; {need.text}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// GapAnalysis (main export)
// ---------------------------------------------------------------------------
export function GapAnalysis({ areaRatings, readinessRatings, onAddToRoadmap, isMobile, selectedAreas, priorities, companyProfile, leadSubmitted, onLeadSubmitted }) {
  const { valueChainShortLabels, useCases, buildingBlockMap } = useData();
  const [showReadinessDetail, setShowReadinessDetail] = useState(false);
  const [showGapAnalysis, setShowGapAnalysis] = useState(false);

  const gaps = useMemo(() => computeGapAnalysis(areaRatings, useCases, buildingBlockMap), [areaRatings, useCases, buildingBlockMap]);
  const readinessScore = useMemo(() => computeReadinessScore(readinessRatings), [readinessRatings]);
  const dimensionScores = useMemo(() => computeDimensionScores(readinessRatings), [readinessRatings]);
  const recommendations = useMemo(
    () => getRecommendedUseCases(areaRatings, readinessRatings, 10, useCases, buildingBlockMap, priorities),
    [areaRatings, readinessRatings, useCases, buildingBlockMap, priorities],
  );
  const execSummary = useMemo(
    () => generateExecutiveSummary(dimensionScores, recommendations, priorities, areaRatings, useCases),
    [dimensionScores, recommendations, priorities, areaRatings, useCases],
  );

  const overallReadiness = getMaturityLevel(readinessScore);

  const toggleBtnStyle = {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
    borderRadius: theme.radii.lg, border: '1px solid ' + theme.colors.borderMedium,
    background: theme.colors.surface, color: theme.colors.textTertiary,
    fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.semibold,
    cursor: 'pointer', fontFamily: 'inherit', transition: `all ${theme.transitions.fast}`,
    marginBottom: 16,
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <ProfileSummary companyProfile={companyProfile} priorities={priorities} />

      <ExecutiveSummary items={execSummary} />

      <LeadCaptureCard
        selectedAreas={selectedAreas || Object.keys(areaRatings)}
        areaRatings={areaRatings}
        readinessRatings={readinessRatings}
        overallScore={readinessScore}
        companyProfile={companyProfile}
        priorities={priorities}
        leadSubmitted={leadSubmitted}
        onLeadSubmitted={onLeadSubmitted}
      />

      <SectionLabel>Recommended Starting Points</SectionLabel>
      <p style={{ fontSize: theme.typography.sizes.lg, color: theme.colors.textTertiary, marginBottom: 12, marginTop: 0 }}>
        Use cases best matched to your current maturity, readiness, and strategic priorities. Click any card to see why it was recommended.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 28 }}>
        {recommendations.map((rec, i) => (
          <RecommendationCard
            key={rec.useCase.name}
            rec={rec}
            index={i}
            readinessScore={readinessScore}
            areaRatings={areaRatings}
            priorities={priorities}
            dimensionScores={dimensionScores}
            valueChainShortLabels={valueChainShortLabels}
            onAddToRoadmap={onAddToRoadmap}
            buildingBlockMap={buildingBlockMap}
          />
        ))}
      </div>

      {/* Collapsible: Readiness Overview */}
      <button
        onClick={() => setShowReadinessDetail(!showReadinessDetail)}
        style={toggleBtnStyle}
        onMouseEnter={e => { e.currentTarget.style.borderColor = theme.colors.primary; e.currentTarget.style.color = theme.colors.primaryDark; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = theme.colors.borderMedium; e.currentTarget.style.color = theme.colors.textTertiary; }}
      >
        <span style={{
          transition: `transform ${theme.transitions.fast}`,
          transform: showReadinessDetail ? 'rotate(180deg)' : 'rotate(0)',
          fontSize: theme.typography.sizes.sm,
        }}>&#9660;</span>
        {showReadinessDetail ? 'Hide' : 'Show'} Readiness Details ({readinessScore.toFixed(1)}/5)
      </button>
      {showReadinessDetail && (
        <div style={{ marginBottom: 28, animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{
            background: theme.colors.surface, border: '1px solid ' + theme.colors.border, borderRadius: theme.radii.xl,
            padding: 20, boxShadow: theme.shadows.card,
          }}>
            <div style={{ textAlign: 'center' }}>
              <ReadinessRadar ratings={readinessRatings} />
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: theme.typography.sizes.stat, fontWeight: theme.typography.weights.black, color: overallReadiness.color }}>{readinessScore.toFixed(1)}</span>
                <span style={{ fontSize: theme.typography.sizes.lg, color: theme.colors.textMuted }}>/ 5.0 Overall Readiness</span>
              </div>
            </div>
            <ReadinessBreakdown readinessRatings={readinessRatings} dimensionScores={dimensionScores} />
          </div>
        </div>
      )}

      {/* Collapsible: Gap Analysis */}
      <button
        onClick={() => setShowGapAnalysis(!showGapAnalysis)}
        style={toggleBtnStyle}
        onMouseEnter={e => { e.currentTarget.style.borderColor = theme.colors.primary; e.currentTarget.style.color = theme.colors.primaryDark; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = theme.colors.borderMedium; e.currentTarget.style.color = theme.colors.textTertiary; }}
      >
        <span style={{
          transition: `transform ${theme.transitions.fast}`,
          transform: showGapAnalysis ? 'rotate(180deg)' : 'rotate(0)',
          fontSize: theme.typography.sizes.sm,
        }}>&#9660;</span>
        {showGapAnalysis ? 'Hide' : 'Show'} Gap Analysis by Area
      </button>
      {showGapAnalysis && (
        <div style={{ marginBottom: 28, animation: 'fadeIn 0.2s ease-out' }}>
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
      )}
    </div>
  );
}
