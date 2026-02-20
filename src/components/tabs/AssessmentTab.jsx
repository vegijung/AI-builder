import { READINESS_DIMENSIONS, ADOPTION_LEVELS } from '../../data/constants';
import { useData } from '../../contexts/DataContext';
import { SectionLabel } from '../shared/SectionLabel';
import { GapAnalysis } from '../assessment/GapAnalysis';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { theme } from '../../styles/theme';

function StepIndicator({ current, total }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            display: 'inline-flex', width: 28, height: 28, borderRadius: theme.radii.circle,
            background: i <= current ? theme.colors.textPrimary : theme.colors.surfaceMuted,
            color: i <= current ? theme.colors.primary : theme.colors.textMuted,
            fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.black,
            alignItems: 'center', justifyContent: 'center',
            transition: `all ${theme.transitions.normal}`,
          }}>
            {i < current ? '\u2713' : i + 1}
          </span>
          <span style={{
            fontSize: theme.typography.sizes.lg, fontWeight: i === current ? theme.typography.weights.bold : theme.typography.weights.medium,
            color: i <= current ? theme.colors.textPrimary : theme.colors.textMuted,
          }}>
            {['Select Areas', 'Rate Maturity', 'Readiness', 'Results'][i]}
          </span>
          {i < total - 1 && <div style={{ width: 24, height: 1, background: theme.colors.borderLight }} />}
        </div>
      ))}
    </div>
  );
}

function RatingSlider({ value, onChange, labels }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(v => (
        <button key={v} onClick={() => onChange(v)} style={{
          flex: 1, padding: '8px 4px', borderRadius: theme.radii.lg,
          border: value === v ? '2px solid ' + theme.colors.primary : '1px solid ' + theme.colors.borderMedium,
          background: value === v ? theme.colors.primary + '15' : theme.colors.surface,
          color: value === v ? theme.colors.primary : theme.colors.textTertiary,
          fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.semibold,
          cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center',
          transition: `all ${theme.transitions.fast}`,
        }}>
          <div style={{ fontSize: theme.typography.sizes.xxl, fontWeight: theme.typography.weights.black }}>{v}</div>
          {labels && <div style={{ fontSize: theme.typography.sizes.sm, marginTop: 2 }}>{labels[v - 1]}</div>}
        </button>
      ))}
    </div>
  );
}

export function AssessmentTab({ assessment, onAddToRoadmap }) {
  const { useCases, valueChainAreaNames, valueChainShortLabels } = useData();
  const { isMobile } = useBreakpoint();
  const { selectedAreas, areaRatings, readinessRatings, step, isComplete,
    toggleArea, setAreaRating, setReadinessRating, setStep, completeAssessment, resetAssessment } = assessment;

  if (step === 3 && isComplete) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <StepIndicator current={3} total={4} />
          <button onClick={resetAssessment} style={{
            padding: '6px 14px', borderRadius: theme.radii.lg, border: '1px solid ' + theme.colors.borderStrong,
            background: theme.colors.surface, color: theme.colors.textTertiary, fontSize: theme.typography.sizes.md,
            fontWeight: theme.typography.weights.semibold, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Restart Assessment
          </button>
        </div>
        <GapAnalysis areaRatings={areaRatings} readinessRatings={readinessRatings} onAddToRoadmap={onAddToRoadmap} isMobile={isMobile} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 750, animation: 'fadeIn 0.3s ease-out' }}>
      <StepIndicator current={step} total={4} />

      {step === 0 && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: theme.typography.weights.black, color: theme.colors.textPrimary, marginBottom: 4 }}>
            Which areas of your organization are you assessing?
          </h2>
          <p style={{ fontSize: theme.typography.sizes.xxl, color: theme.colors.textTertiary, marginBottom: 20 }}>
            Select the value chain areas where you want to explore AI opportunities.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {valueChainAreaNames.map(area => {
              const sel = selectedAreas.includes(area);
              const count = useCases.filter(uc => uc.valueChainArea === area).length;
              return (
                <button key={area} onClick={() => toggleArea(area)} style={{
                  padding: '10px 16px', borderRadius: theme.radii.xl,
                  border: sel ? '2px solid ' + theme.colors.textPrimary : '1px solid ' + theme.colors.borderMedium,
                  background: sel ? theme.colors.textPrimary : theme.colors.surface,
                  color: sel ? theme.colors.primary : theme.colors.textTertiary,
                  fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.semibold,
                  cursor: 'pointer', fontFamily: 'inherit', transition: `all ${theme.transitions.fast}`,
                }}>
                  {valueChainShortLabels[area]} <span style={{ opacity: 0.6, fontSize: theme.typography.sizes.base }}>({count})</span>
                </button>
              );
            })}
          </div>
          <button onClick={() => setStep(1)} disabled={!selectedAreas.length} style={{
            marginTop: 24, padding: '12px 32px', borderRadius: theme.radii.xl, border: 'none',
            background: selectedAreas.length ? theme.colors.textPrimary : theme.colors.borderMedium,
            color: selectedAreas.length ? theme.colors.primary : theme.colors.textDisabled,
            fontSize: theme.typography.sizes.xxl, fontWeight: theme.typography.weights.bold,
            cursor: selectedAreas.length ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
          }}>
            Next: Rate Maturity &rarr;
          </button>
        </div>
      )}

      {step === 1 && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: theme.typography.weights.black, color: theme.colors.textPrimary, marginBottom: 4 }}>
            Rate your current AI adoption in each area
          </h2>
          <p style={{ fontSize: theme.typography.sizes.xxl, color: theme.colors.textTertiary, marginBottom: 20 }}>
            How advanced is your organization's AI usage in these value chain areas?
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {selectedAreas.map(area => (
              <div key={area} style={{
                background: theme.colors.surface, border: '1px solid ' + theme.colors.border, borderRadius: theme.radii.xl,
                padding: 16, boxShadow: theme.shadows.card,
              }}>
                <div style={{ fontSize: theme.typography.sizes.xxl, fontWeight: theme.typography.weights.bold, color: theme.colors.textPrimary, marginBottom: 8 }}>
                  {valueChainShortLabels[area]}
                </div>
                <RatingSlider
                  value={areaRatings[area] || 1}
                  onChange={(v) => setAreaRating(area, v)}
                  labels={ADOPTION_LEVELS.map(l => l.label)}
                />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
            <button onClick={() => setStep(0)} style={{
              padding: '12px 24px', borderRadius: theme.radii.xl, border: '1px solid ' + theme.colors.borderStrong,
              background: theme.colors.surface, color: theme.colors.textTertiary, fontSize: theme.typography.sizes.xxl,
              fontWeight: theme.typography.weights.semibold, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              &larr; Back
            </button>
            <button onClick={() => setStep(2)} style={{
              padding: '12px 32px', borderRadius: theme.radii.xl, border: 'none',
              background: theme.colors.textPrimary, color: theme.colors.primary,
              fontSize: theme.typography.sizes.xxl, fontWeight: theme.typography.weights.bold, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Next: Readiness &rarr;
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: theme.typography.weights.black, color: theme.colors.textPrimary, marginBottom: 4 }}>
            Assess your organizational readiness
          </h2>
          <p style={{ fontSize: theme.typography.sizes.xxl, color: theme.colors.textTertiary, marginBottom: 20 }}>
            Rate your organization's capabilities across these foundational dimensions.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {READINESS_DIMENSIONS.map(dim => (
              <div key={dim.id} style={{
                background: theme.colors.surface, border: '1px solid ' + theme.colors.border, borderRadius: theme.radii.xl,
                padding: 16, boxShadow: theme.shadows.card,
              }}>
                <div style={{ fontSize: theme.typography.sizes.xxl, fontWeight: theme.typography.weights.bold, color: theme.colors.textPrimary, marginBottom: 2 }}>
                  {dim.label}
                </div>
                <div style={{ fontSize: theme.typography.sizes.lg, color: theme.colors.textMuted, marginBottom: 10 }}>{dim.description}</div>
                <RatingSlider
                  value={readinessRatings[dim.id] || 3}
                  onChange={(v) => setReadinessRating(dim.id, v)}
                  labels={['Very Low', 'Low', 'Medium', 'High', 'Very High']}
                />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
            <button onClick={() => setStep(1)} style={{
              padding: '12px 24px', borderRadius: theme.radii.xl, border: '1px solid ' + theme.colors.borderStrong,
              background: theme.colors.surface, color: theme.colors.textTertiary, fontSize: theme.typography.sizes.xxl,
              fontWeight: theme.typography.weights.semibold, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              &larr; Back
            </button>
            <button onClick={completeAssessment} style={{
              padding: '12px 32px', borderRadius: theme.radii.xl, border: 'none',
              background: theme.colors.textPrimary, color: theme.colors.primary,
              fontSize: theme.typography.sizes.xxl, fontWeight: theme.typography.weights.bold, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              View Results &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
