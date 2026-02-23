import { useState, useMemo } from 'react';
import { getMaturityLevel } from '../../utils/maturity';
import { getFitLabel, generateWhyText, getImplementationComplexity, getDominantCategory } from '../../utils/assessment';
import { BuildingBlockTag } from '../shared/BuildingBlockTag';
import { MMG_EXPERTISE } from '../../data/constants';
import { theme } from '../../styles/theme';

export function RecommendationCard({ rec, index, readinessScore, areaRatings, priorities, valueChainShortLabels, onAddToRoadmap, buildingBlockMap, isInRoadmap, dimensionScores, isMobile }) {
  const [expanded, setExpanded] = useState(false);
  const [showBlocks, setShowBlocks] = useState(false);
  const uc = rec.useCase;
  const ml = getMaturityLevel(rec.maturity);
  const fit = getFitLabel(rec.score);
  const whyText = useMemo(() => generateWhyText(rec, readinessScore, areaRatings, priorities), [rec, readinessScore, areaRatings, priorities]);
  const whyPreview = useMemo(() => {
    if (!whyText) return '';
    const firstSentence = whyText.split('. ')[0];
    return firstSentence.length > 90 ? firstSentence.slice(0, 87) + '...' : firstSentence + '.';
  }, [whyText]);
  const complexity = useMemo(() => getImplementationComplexity(rec, dimensionScores), [rec, dimensionScores]);
  const dominantCat = useMemo(() => getDominantCategory(uc, buildingBlockMap), [uc, buildingBlockMap]);
  const mmgStrength = dominantCat ? MMG_EXPERTISE.categoryStrengths[dominantCat] : null;
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
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: 8,
        }}>
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
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
            ...(isMobile ? { paddingLeft: 32, marginTop: 4 } : {}),
          }}>
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
          <div style={{
            background: theme.colors.surfaceAlt, borderRadius: theme.radii.lg, padding: 12, marginTop: 12,
            border: '1px solid ' + theme.colors.borderLight,
          }}>
            <div style={{ fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.bold, color: theme.colors.textPrimary, marginBottom: 4 }}>
              Why This Fits You
            </div>
            <p style={{ margin: 0, fontSize: theme.typography.sizes.lg, color: theme.colors.textTertiary, lineHeight: 1.6 }}>
              {whyText}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'flex-start' : 'center',
              gap: isMobile ? 4 : 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: theme.radii.circle, background: complexity.color, flexShrink: 0,
                }} />
                <span style={{ fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.semibold, color: complexity.color }}>
                  {complexity.level} Complexity
                </span>
              </div>
              <span style={{ fontSize: theme.typography.sizes.base, color: theme.colors.textMuted, ...(isMobile ? { paddingLeft: 16 } : {}) }}>
                {!isMobile && <>&mdash; </>}{complexity.hint}
              </span>
            </div>
            {mmgStrength && (
              <div style={{ fontSize: theme.typography.sizes.base, color: theme.colors.textMuted, lineHeight: 1.4, paddingLeft: 16 }}>
                <span style={{ fontWeight: theme.typography.weights.bold, color: theme.colors.primary }}>MMG</span>{' '}
                {mmgStrength}
              </div>
            )}
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); setShowBlocks(!showBlocks); }}
            style={{
              background: 'none', border: 'none', padding: '8px 0 0 0',
              color: theme.colors.textMuted, fontSize: theme.typography.sizes.base,
              cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            {showBlocks ? 'Hide' : 'Show'} building blocks ({(uc.buildingBlocks || []).length})
          </button>
          {showBlocks && (
            <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 5, animation: 'fadeIn 0.2s ease-out' }}>
              {(uc.buildingBlocks || []).map(bName => (
                <BuildingBlockTag key={bName} name={bName} showScore />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
