import { READINESS_DIMENSIONS, ADOPTION_LEVELS, READINESS_RATING_LABELS, STRATEGIC_PRIORITIES, INDUSTRIES, COMPANY_SIZES } from '../../data/constants';
import { useData } from '../../contexts/DataContext';
import { GapAnalysis } from '../assessment/GapAnalysis';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { theme } from '../../styles/theme';

const STEP_LABELS = ['About You', 'Select Areas', 'Adoption', 'Readiness', 'Priorities', 'Results'];
const TOTAL_STEPS = STEP_LABELS.length;

function StepIndicator({ current, total }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
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
            {STEP_LABELS[i]}
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

function NavButtons({ onBack, onNext, nextLabel, nextDisabled }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
      {onBack && (
        <button onClick={onBack} style={{
          padding: '12px 24px', borderRadius: theme.radii.xl, border: '1px solid ' + theme.colors.borderStrong,
          background: theme.colors.surface, color: theme.colors.textTertiary, fontSize: theme.typography.sizes.xxl,
          fontWeight: theme.typography.weights.semibold, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          &larr; Back
        </button>
      )}
      <button onClick={onNext} disabled={nextDisabled} style={{
        padding: '12px 32px', borderRadius: theme.radii.xl, border: 'none',
        background: nextDisabled ? theme.colors.borderMedium : theme.colors.textPrimary,
        color: nextDisabled ? theme.colors.textDisabled : theme.colors.primary,
        fontSize: theme.typography.sizes.xxl, fontWeight: theme.typography.weights.bold,
        cursor: nextDisabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
      }}>
        {nextLabel}
      </button>
    </div>
  );
}

const selectStyle = {
  width: '100%', padding: '10px 12px', borderRadius: theme.radii.lg,
  border: '1px solid ' + theme.colors.borderMedium, background: theme.colors.surface,
  fontSize: theme.typography.sizes.xl, fontFamily: theme.typography.fontFamily,
  color: theme.colors.textPrimary, outline: 'none', boxSizing: 'border-box',
  cursor: 'pointer', appearance: 'auto',
};

const inputStyle = {
  ...selectStyle, cursor: 'text', appearance: 'none',
};

const fieldLabel = {
  display: 'block', fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.semibold,
  color: theme.colors.textSecondary, marginBottom: 4,
};

export function AssessmentTab({ assessment, onAddToRoadmap, isInRoadmap }) {
  const { useCases, valueChainAreaNames, valueChainShortLabels } = useData();
  const { isMobile } = useBreakpoint();
  const {
    companyProfile, selectedAreas, areaRatings, readinessRatings, priorities,
    step, isComplete, leadSubmitted,
    setCompanyProfile, toggleArea, setAreaRating, setReadinessRating, togglePriority,
    setStep, completeAssessment, editAssessment, resetAssessment, setLeadSubmitted,
  } = assessment;

  // Step 5: Results
  if (step === 5 && isComplete) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <StepIndicator current={5} total={TOTAL_STEPS} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={editAssessment} style={{
              padding: '6px 14px', borderRadius: theme.radii.lg, border: '1px solid ' + theme.colors.primary,
              background: theme.colors.primary + '10', color: theme.colors.primary, fontSize: theme.typography.sizes.md,
              fontWeight: theme.typography.weights.semibold, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              &larr; Edit Answers
            </button>
            <button onClick={resetAssessment} style={{
              padding: '6px 14px', borderRadius: theme.radii.lg, border: '1px solid ' + theme.colors.borderStrong,
              background: theme.colors.surface, color: theme.colors.textTertiary, fontSize: theme.typography.sizes.md,
              fontWeight: theme.typography.weights.semibold, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Restart Assessment
            </button>
          </div>
        </div>
        <GapAnalysis
          areaRatings={areaRatings}
          readinessRatings={readinessRatings}
          onAddToRoadmap={onAddToRoadmap}
          isInRoadmap={isInRoadmap}
          isMobile={isMobile}
          selectedAreas={selectedAreas}
          priorities={priorities}
          companyProfile={companyProfile}
          leadSubmitted={leadSubmitted}
          onLeadSubmitted={setLeadSubmitted}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 750, animation: 'fadeIn 0.3s ease-out' }}>
      <StepIndicator current={step} total={TOTAL_STEPS} />

      {/* Step 0: About You */}
      {step === 0 && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: theme.typography.weights.black, color: theme.colors.textPrimary, marginBottom: 4 }}>
            Let&rsquo;s personalize your assessment
          </h2>
          <p style={{ fontSize: theme.typography.sizes.xxl, color: theme.colors.textTertiary, marginBottom: 20 }}>
            This helps us tailor recommendations to your context. All fields are optional.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={fieldLabel}>Industry</label>
              <select value={companyProfile.industry} onChange={e => setCompanyProfile({ ...companyProfile, industry: e.target.value })} style={selectStyle}>
                <option value="">Select your industry...</option>
                {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
              </select>
            </div>
            <div>
              <label style={fieldLabel}>Company Size</label>
              <select value={companyProfile.companySize} onChange={e => setCompanyProfile({ ...companyProfile, companySize: e.target.value })} style={selectStyle}>
                <option value="">Select company size...</option>
                {COMPANY_SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
              </select>
            </div>
            <div>
              <label style={fieldLabel}>Your Role / Title</label>
              <input type="text" value={companyProfile.role} onChange={e => setCompanyProfile({ ...companyProfile, role: e.target.value })}
                placeholder="e.g. Head of Digital, CTO, COO" maxLength={100} style={inputStyle} />
            </div>
          </div>
          <NavButtons onNext={() => setStep(1)} nextLabel="Next: Select Areas &rarr;" />
        </div>
      )}

      {/* Step 1: Select Areas */}
      {step === 1 && (
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
          <NavButtons
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
            nextLabel="Next: Rate Adoption &rarr;"
            nextDisabled={!selectedAreas.length}
          />
        </div>
      )}

      {/* Step 2: Rate Adoption */}
      {step === 2 && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: theme.typography.weights.black, color: theme.colors.textPrimary, marginBottom: 4 }}>
            Rate your current AI adoption in each area
          </h2>
          <p style={{ fontSize: theme.typography.sizes.xxl, color: theme.colors.textTertiary, marginBottom: 20 }}>
            How advanced is your organization&rsquo;s AI usage in these value chain areas?
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {selectedAreas.map(area => {
              const currentLevel = ADOPTION_LEVELS.find(l => l.score === (areaRatings[area] || 1));
              return (
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
                  {currentLevel && (
                    <div style={{
                      marginTop: 10, padding: '10px 14px', borderRadius: theme.radii.lg,
                      background: theme.colors.surfaceMuted, border: '1px solid ' + theme.colors.borderLight,
                    }}>
                      <div style={{ fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.semibold, color: theme.colors.textSecondary, marginBottom: 4 }}>
                        Level {currentLevel.score}: {currentLevel.label} &mdash; {currentLevel.description}
                      </div>
                      {currentLevel.examples && (
                        <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {currentLevel.examples.map((ex, i) => (
                            <li key={i} style={{ fontSize: theme.typography.sizes.md, color: theme.colors.textMuted }}>{ex}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <NavButtons
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
            nextLabel="Next: Readiness Deep-Dive &rarr;"
          />
        </div>
      )}

      {/* Step 3: Readiness Deep-Dive (12 sub-questions) */}
      {step === 3 && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: theme.typography.weights.black, color: theme.colors.textPrimary, marginBottom: 4 }}>
            Assess your organizational readiness
          </h2>
          <p style={{ fontSize: theme.typography.sizes.xxl, color: theme.colors.textTertiary, marginBottom: 20 }}>
            Rate your organization across 12 key capability areas. This takes about 2 minutes.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {READINESS_DIMENSIONS.map(dim => {
              const subScores = dim.subQuestions.map(sq => readinessRatings[sq.id] || 3);
              const avg = (subScores.reduce((a, b) => a + b, 0) / subScores.length).toFixed(1);
              return (
                <div key={dim.id} style={{
                  background: theme.colors.surface, border: '1px solid ' + theme.colors.border, borderRadius: theme.radii.xl,
                  padding: 20, boxShadow: theme.shadows.card,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: theme.typography.weights.black, color: theme.colors.textPrimary }}>
                      {dim.label}
                    </h3>
                    <span style={{
                      padding: '4px 10px', borderRadius: theme.radii.lg,
                      background: theme.colors.primary + '15', color: theme.colors.primary,
                      fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold,
                    }}>
                      Avg: {avg}/5
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {dim.subQuestions.map(sq => {
                      const val = readinessRatings[sq.id] || 3;
                      const guideTier = val <= 2 ? 'low' : val <= 3 ? 'mid' : 'high';
                      const guideText = sq.guide?.[guideTier];
                      return (
                        <div key={sq.id}>
                          <div style={{ fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.bold, color: theme.colors.textPrimary, marginBottom: 2 }}>
                            {sq.label}
                          </div>
                          <div style={{ fontSize: theme.typography.sizes.lg, color: theme.colors.textMuted, marginBottom: 8 }}>
                            {sq.description}
                          </div>
                          <RatingSlider
                            value={val}
                            onChange={(v) => setReadinessRating(sq.id, v)}
                            labels={READINESS_RATING_LABELS}
                          />
                          {guideText && (
                            <div style={{
                              marginTop: 8, padding: '8px 12px', borderRadius: theme.radii.lg,
                              background: theme.colors.surfaceMuted, border: '1px solid ' + theme.colors.borderLight,
                              fontSize: theme.typography.sizes.md, color: theme.colors.textMuted, lineHeight: 1.4,
                            }}>
                              <span style={{ fontWeight: theme.typography.weights.semibold, color: theme.colors.textTertiary }}>
                                {READINESS_RATING_LABELS[val - 1]} ({val}/5):
                              </span>{' '}
                              {guideText}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <NavButtons
            onBack={() => setStep(2)}
            onNext={() => setStep(4)}
            nextLabel="Next: Strategic Priorities &rarr;"
          />
        </div>
      )}

      {/* Step 4: Strategic Priorities */}
      {step === 4 && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: theme.typography.weights.black, color: theme.colors.textPrimary, marginBottom: 4 }}>
            What are your top strategic goals?
          </h2>
          <p style={{ fontSize: theme.typography.sizes.xxl, color: theme.colors.textTertiary, marginBottom: 20 }}>
            Select up to 3 priorities. This shapes which use cases we recommend for you.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {STRATEGIC_PRIORITIES.map(p => {
              const sel = priorities.includes(p.id);
              const maxed = priorities.length >= 3 && !sel;
              return (
                <button key={p.id} onClick={() => togglePriority(p.id)} disabled={maxed} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14, textAlign: 'left',
                  padding: '16px 20px', borderRadius: theme.radii.xl, cursor: maxed ? 'not-allowed' : 'pointer',
                  border: sel ? '2px solid ' + theme.colors.primary : '1px solid ' + theme.colors.borderMedium,
                  background: sel ? theme.colors.primary + '10' : theme.colors.surface,
                  fontFamily: 'inherit', transition: `all ${theme.transitions.fast}`,
                  opacity: maxed ? 0.5 : 1,
                }}>
                  <span style={{
                    display: 'inline-flex', width: 24, height: 24, borderRadius: theme.radii.circle, flexShrink: 0, marginTop: 2,
                    border: sel ? '2px solid ' + theme.colors.primary : '2px solid ' + theme.colors.borderMedium,
                    background: sel ? theme.colors.primary : 'transparent',
                    alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 14, fontWeight: theme.typography.weights.black,
                  }}>
                    {sel && '\u2713'}
                  </span>
                  <div>
                    <div style={{ fontSize: theme.typography.sizes.xxl, fontWeight: theme.typography.weights.bold, color: theme.colors.textPrimary, marginBottom: 2 }}>
                      {p.label}
                    </div>
                    <div style={{ fontSize: theme.typography.sizes.lg, color: theme.colors.textMuted }}>
                      {p.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <p style={{ fontSize: theme.typography.sizes.lg, color: theme.colors.textMuted, marginTop: 12 }}>
            {priorities.length}/3 selected
          </p>
          <NavButtons
            onBack={() => setStep(3)}
            onNext={completeAssessment}
            nextLabel="View Results &rarr;"
            nextDisabled={!priorities.length}
          />
        </div>
      )}
    </div>
  );
}
