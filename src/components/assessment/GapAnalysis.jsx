import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  computeGapAnalysis, computeReadinessScore, computeDimensionScores,
  getRecommendedUseCases, generateExecutiveSummary, getReadinessInterpretation,
  getTrafficLight, getFitLabel, generateWhyText,
} from '../../utils/assessment';
import { getMaturityLevel } from '../../utils/maturity';
import { useData } from '../../contexts/DataContext';
import { SectionLabel } from '../shared/SectionLabel';
import { BuildingBlockTag } from '../shared/BuildingBlockTag';
import { ReadinessRadar } from './ReadinessRadar';
import { LeadCaptureCard } from './LeadCaptureCard';
import { READINESS_DIMENSIONS } from '../../data/constants';
import { fetchAISummary } from '../../services/aiService';
import { AiBadge, AiSkeleton } from '../shared/AiBadge';
import { generateAssessmentHtml, openHtmlReport } from '../../utils/exportHtml';
import { theme } from '../../styles/theme';

const BOOKING_URL = import.meta.env.VITE_BOOKING_URL || null;

// ---------------------------------------------------------------------------
// ExecutiveSummary
// ---------------------------------------------------------------------------
function ExecutiveSummary({ items, aiSummary, aiLoading, onRegenerate }) {
  if (!items || !items.length) return null;

  const showAI = aiSummary && !aiLoading;

  return (
    <div style={{
      background: `linear-gradient(135deg, ${theme.colors.textPrimary}, #3a3530)`,
      borderRadius: theme.radii.xl, padding: 24, marginBottom: 24,
      boxShadow: theme.shadows.elevated, animation: 'fadeIn 0.3s ease-out',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: theme.typography.weights.black, color: theme.colors.primary }}>
          What to Do Next
        </h3>
        {(showAI || aiLoading) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AiBadge label={aiLoading ? 'Generating...' : 'AI-generated'} variant="block" dark />
            {showAI && onRegenerate && (
              <button onClick={onRegenerate} style={{
                border: 'none', background: 'none', color: theme.colors.primary + '88',
                fontSize: theme.typography.sizes.sm, cursor: 'pointer', fontFamily: 'inherit',
                padding: '2px 4px', textDecoration: 'underline',
              }}>
                Regenerate
              </button>
            )}
          </div>
        )}
      </div>

      {showAI ? (
        <div style={{ fontSize: theme.typography.sizes.xl, color: '#ccc8c4', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
          {aiSummary}
        </div>
      ) : (
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
          {aiLoading && (
            <div style={{ marginTop: 8 }}>
              <AiSkeleton lines={3} dark />
            </div>
          )}
        </div>
      )}
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
// RecommendationCard (simplified)
// ---------------------------------------------------------------------------
function RecommendationCard({ rec, index, readinessScore, areaRatings, priorities, valueChainShortLabels, onAddToRoadmap, buildingBlockMap, isInRoadmap }) {
  const [expanded, setExpanded] = useState(false);
  const uc = rec.useCase;
  const ml = getMaturityLevel(rec.maturity);
  const fit = getFitLabel(rec.score);
  const whyText = useMemo(() => generateWhyText(rec, readinessScore, areaRatings, priorities), [rec, readinessScore, areaRatings, priorities]);
  const whyPreview = useMemo(() => {
    if (!whyText) return '';
    const firstSentence = whyText.split('. ')[0];
    return firstSentence.length > 90 ? firstSentence.slice(0, 87) + '...' : firstSentence + '.';
  }, [whyText]);
  const inRoadmap = isInRoadmap?.(uc.name);

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
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ padding: '12px 16px', cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
            <span style={{
              display: 'inline-flex', width: 22, height: 22, borderRadius: theme.radii.circle, background: theme.colors.primary + '20',
              color: theme.colors.primary, fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.black,
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {index + 1}
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: theme.typography.weights.bold, fontSize: theme.typography.sizes.xl, color: theme.colors.textPrimary }}>{uc.name}</span>
                <span style={{ fontSize: theme.typography.sizes.sm, color: theme.colors.textMuted }}>{valueChainShortLabels[uc.valueChainArea]}</span>
              </div>
              <div style={{ fontSize: theme.typography.sizes.base, color: theme.colors.textMuted, marginTop: 2, lineHeight: 1.4 }}>
                {whyPreview}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <span style={{ fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.bold, color: fit.color, whiteSpace: 'nowrap' }}>
              {fit.label}
            </span>
            {onAddToRoadmap && (
              <button
                onClick={(e) => { e.stopPropagation(); if (!inRoadmap) onAddToRoadmap(uc); }}
                disabled={inRoadmap}
                style={{
                  padding: '6px 12px', borderRadius: theme.radii.lg,
                  border: '1px solid ' + (inRoadmap ? theme.colors.activityPrimary : theme.colors.borderMedium),
                  background: inRoadmap ? theme.colors.activityPrimary + '15' : theme.colors.surface,
                  color: inRoadmap ? theme.colors.activityPrimary : theme.colors.textTertiary,
                  fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.semibold,
                  cursor: inRoadmap ? 'default' : 'pointer', fontFamily: 'inherit',
                  transition: `all ${theme.transitions.fast}`,
                }}
                onMouseEnter={e => { if (!inRoadmap) { e.currentTarget.style.background = theme.colors.primary; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = theme.colors.primary; } }}
                onMouseLeave={e => { if (!inRoadmap) { e.currentTarget.style.background = theme.colors.surface; e.currentTarget.style.color = theme.colors.textTertiary; e.currentTarget.style.borderColor = theme.colors.borderMedium; } }}
              >
                {inRoadmap ? '\u2713 In Roadmap' : '+ Roadmap'}
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
      </div>

      {expanded && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid ' + theme.colors.borderLight, animation: 'fadeIn 0.2s ease-out' }}>
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

          <div style={{
            background: theme.colors.surfaceAlt, borderRadius: theme.radii.lg, padding: 12,
            border: '1px solid ' + theme.colors.borderLight,
          }}>
            <div style={{ fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.bold, color: theme.colors.textPrimary, marginBottom: 4 }}>
              Why This Fits You
            </div>
            <p style={{ margin: 0, fontSize: theme.typography.sizes.lg, color: theme.colors.textTertiary, lineHeight: 1.6 }}>
              {whyText}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// BookingBanner (shown after lead capture)
// ---------------------------------------------------------------------------
function BookingBanner() {
  const url = BOOKING_URL || 'mailto:info@mmgmc.ch?subject=AI%20Strategy%20Session';
  return (
    <div style={{
      background: `linear-gradient(135deg, ${theme.colors.textPrimary}, #3a3530)`,
      borderRadius: theme.radii.xl, padding: '20px 24px', marginTop: 24,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
      boxShadow: theme.shadows.elevated, animation: 'fadeIn 0.3s ease-out',
    }}>
      <div>
        <div style={{ fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.bold, color: theme.colors.primary, marginBottom: 2 }}>
          Ready to take the next step?
        </div>
        <div style={{ fontSize: theme.typography.sizes.lg, color: '#ccc8c4' }}>
          Book a free 30-minute strategy session with an MMG AI consultant.
        </div>
      </div>
      <a href={url} target="_blank" rel="noopener noreferrer" style={{
        display: 'inline-block', padding: '10px 24px', borderRadius: theme.radii.xl,
        background: theme.colors.primary, color: theme.colors.textPrimary,
        fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold,
        textDecoration: 'none', transition: `opacity ${theme.transitions.fast}`, flexShrink: 0,
      }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
      >
        Book a Session &rarr;
      </a>
    </div>
  );
}

// ---------------------------------------------------------------------------
// GapAnalysis (main export)
// ---------------------------------------------------------------------------
export function GapAnalysis({ areaRatings, readinessRatings, onAddToRoadmap, isInRoadmap, isMobile, selectedAreas, priorities, companyProfile, leadSubmitted, onLeadSubmitted }) {
  const { valueChainShortLabels, useCases, buildingBlockMap } = useData();
  const [showReadinessDetail, setShowReadinessDetail] = useState(false);
  const [showGapAnalysis, setShowGapAnalysis] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);

  const gaps = useMemo(() => computeGapAnalysis(areaRatings, useCases, buildingBlockMap), [areaRatings, useCases, buildingBlockMap]);
  const readinessScore = useMemo(() => computeReadinessScore(readinessRatings), [readinessRatings]);
  const dimensionScores = useMemo(() => computeDimensionScores(readinessRatings), [readinessRatings]);
  const recommendations = useMemo(
    () => getRecommendedUseCases(areaRatings, readinessRatings, 10, useCases, buildingBlockMap, priorities, dimensionScores),
    [areaRatings, readinessRatings, useCases, buildingBlockMap, priorities, dimensionScores],
  );
  const execSummary = useMemo(
    () => generateExecutiveSummary(dimensionScores, recommendations, priorities, areaRatings, useCases),
    [dimensionScores, recommendations, priorities, areaRatings, useCases],
  );

  const lowestDimension = useMemo(() => {
    let lowest = null;
    READINESS_DIMENSIONS.forEach(dim => {
      const score = dimensionScores[dim.id] ?? 3;
      if (!lowest || score < lowest.score) lowest = { id: dim.id, label: dim.label, score };
    });
    return lowest;
  }, [dimensionScores]);

  const loadAISummary = useCallback(async () => {
    setAiSummaryLoading(true);
    const result = await fetchAISummary({
      dimensionScores, recommendations, priorities, areaRatings, companyProfile, readinessScore,
    });
    setAiSummary(result);
    setAiSummaryLoading(false);
  }, [dimensionScores, recommendations, priorities, areaRatings, companyProfile, readinessScore]);

  useEffect(() => {
    if (recommendations.length > 0 && !aiSummary) loadAISummary();
  }, [recommendations.length > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const overallReadiness = getMaturityLevel(readinessScore);
  const freeRecs = recommendations.slice(0, 3);
  const gatedRecs = recommendations.slice(3);

  const toggleBtnStyle = {
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
    borderRadius: theme.radii.lg, border: '1px solid ' + theme.colors.borderMedium,
    background: theme.colors.surface, color: theme.colors.textTertiary,
    fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.semibold,
    cursor: 'pointer', fontFamily: 'inherit', transition: `all ${theme.transitions.fast}`,
    marginBottom: 16,
  };

  const renderCard = (rec, i) => (
    <RecommendationCard
      key={rec.useCase.name}
      rec={rec}
      index={i}
      readinessScore={readinessScore}
      areaRatings={areaRatings}
      priorities={priorities}
      valueChainShortLabels={valueChainShortLabels}
      onAddToRoadmap={onAddToRoadmap}
      buildingBlockMap={buildingBlockMap}
      isInRoadmap={isInRoadmap}
    />
  );

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <ExecutiveSummary items={execSummary} aiSummary={aiSummary} aiLoading={aiSummaryLoading} onRegenerate={loadAISummary} />

      {/* Top 3 recommendations -- always visible */}
      <SectionLabel>Your Top Recommendations</SectionLabel>
      <p style={{ fontSize: theme.typography.sizes.lg, color: theme.colors.textTertiary, marginBottom: 12, marginTop: 0 }}>
        Use cases best matched to your maturity, readiness, and goals. Click any card for details.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24 }}>
        {freeRecs.map((rec, i) => renderCard(rec, i))}
      </div>

      {/* Lead capture gate */}
      <LeadCaptureCard
        selectedAreas={selectedAreas || Object.keys(areaRatings)}
        areaRatings={areaRatings}
        readinessRatings={readinessRatings}
        overallScore={readinessScore}
        companyProfile={companyProfile}
        priorities={priorities}
        leadSubmitted={leadSubmitted}
        onLeadSubmitted={onLeadSubmitted}
        recommendationCount={recommendations.length}
        topUseCaseName={recommendations[0]?.useCase?.name}
        lowestDimension={lowestDimension}
        onDownloadReport={() => {
          const recsWithWhy = recommendations.map(rec => ({
            ...rec,
            whyText: generateWhyText(rec, readinessScore, areaRatings, priorities),
          }));
          const html = generateAssessmentHtml({
            companyProfile,
            executiveSummary: aiSummary || execSummary.map(s => `${s.title}: ${s.text}`).join('\n\n'),
            recommendations: recsWithWhy,
            dimensionScores,
            readinessScore,
            areaRatings,
            valueChainShortLabels,
          });
          openHtmlReport(html);
        }}
      />

      {/* Remaining recommendations -- gated or unlocked */}
      {gatedRecs.length > 0 && (
        <div style={{ position: 'relative', marginBottom: 24 }}>
          {!leadSubmitted && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(253,252,250,0.3)', borderRadius: theme.radii.xl,
            }}>
              <div style={{
                background: theme.colors.surface, border: '1px solid ' + theme.colors.border,
                borderRadius: theme.radii.xl, padding: '16px 24px', boxShadow: theme.shadows.elevated,
                textAlign: 'center', maxWidth: 340,
              }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>&#128274;</div>
                <div style={{ fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.bold, color: theme.colors.textPrimary, marginBottom: 4 }}>
                  {gatedRecs.length} more recommendations
                </div>
                <div style={{ fontSize: theme.typography.sizes.lg, color: theme.colors.textMuted }}>
                  Leave your details above to unlock all results.
                </div>
              </div>
            </div>
          )}
          <div style={{
            filter: leadSubmitted ? 'none' : 'blur(6px)',
            pointerEvents: leadSubmitted ? 'auto' : 'none',
            userSelect: leadSubmitted ? 'auto' : 'none',
            transition: 'filter 0.3s ease',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {gatedRecs.map((rec, i) => renderCard(rec, i + 3))}
            </div>
          </div>
        </div>
      )}

      {/* Booking banner -- shown after lead capture */}
      {leadSubmitted && <BookingBanner />}

      {/* Collapsible: Readiness Overview */}
      <div style={{ marginTop: 28 }}>
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
    </div>
  );
}
