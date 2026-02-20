import { useState, useEffect, useCallback } from 'react';
import { theme } from '../../styles/theme';

const STORAGE_KEY = 'ai-builder-onboarding-complete';

const STEPS = [
  {
    title: 'Welcome to AI Building Blocks',
    description: 'This tool by MMG helps you discover which AI use cases fit your organization and how to get started. Let us show you around!',
    target: null,
  },
  {
    title: 'AI Readiness Assessment',
    description: 'Start here: Take a 5-minute AI readiness assessment. Rate your organization\'s AI adoption and readiness, then get personalized recommendations tailored to your industry.',
    target: 'assessment',
  },
  {
    title: 'Explore Use Cases',
    description: 'Browse all AI use cases: Filter by value chain area, technology category, or maturity level to discover opportunities relevant to your business.',
    target: 'explore',
  },
  {
    title: 'Your AI Roadmap',
    description: 'Build your AI roadmap: Add use cases from the Assessment results or the Explore tab, then organize them into implementation phases.',
    target: 'roadmap',
  },
  {
    title: 'Ready to get started?',
    description: 'Start with the Assessment to get tailored recommendations, or jump straight into Explore to browse all available use cases.',
    target: null,
  },
];

export function OnboardingTour({ visible, onClose, onNavigate }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [tabPositions, setTabPositions] = useState({});

  useEffect(() => {
    if (!visible) return;
    setCurrentStep(0);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const measure = () => {
      const positions = {};
      ['assessment', 'explore', 'roadmap'].forEach(tab => {
        const el = document.querySelector(`[data-tab="${tab}"]`);
        if (el) {
          const rect = el.getBoundingClientRect();
          positions[tab] = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
        }
      });
      setTabPositions(positions);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [visible]);

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) setCurrentStep(s => s + 1);
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    onClose();
  }, [onClose]);

  const handleFinish = useCallback((tab) => {
    localStorage.setItem(STORAGE_KEY, 'true');
    onClose();
    if (tab) onNavigate(tab);
  }, [onClose, onNavigate]);

  if (!visible) return null;

  const stepData = STEPS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === STEPS.length - 1;
  const isCentered = !stepData.target;
  const targetPos = stepData.target ? tabPositions[stepData.target] : null;

  const cardWidth = 380;
  const cardStyle = {
    position: 'fixed',
    zIndex: 10002,
    width: cardWidth,
    maxWidth: 'calc(100vw - 32px)',
    background: theme.colors.surface,
    borderRadius: theme.radii.xl,
    boxShadow: theme.shadows.dropdown,
    padding: '28px 24px 20px',
    fontFamily: theme.typography.fontFamily,
  };

  if (isCentered) {
    cardStyle.top = '50%';
    cardStyle.left = '50%';
    cardStyle.transform = 'translate(-50%, -50%)';
  } else if (targetPos) {
    cardStyle.top = targetPos.top + targetPos.height + 12;
    cardStyle.left = Math.max(16, Math.min(targetPos.left + targetPos.width / 2 - cardWidth / 2, window.innerWidth - cardWidth - 16));
  } else {
    cardStyle.top = '50%';
    cardStyle.left = '50%';
    cardStyle.transform = 'translate(-50%, -50%)';
  }

  return (
    <>
      {/* Backdrop */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(42,37,32,0.45)', transition: theme.transitions.normal,
      }} onClick={handleSkip} />

      {/* Highlight ring around target tab */}
      {targetPos && (
        <div style={{
          position: 'fixed', zIndex: 10001,
          left: targetPos.left - 4, top: targetPos.top - 4,
          width: targetPos.width + 8, height: targetPos.height + 8,
          borderRadius: theme.radii.lg,
          border: `2px solid ${theme.colors.primary}`,
          boxShadow: `0 0 0 4px ${theme.colors.primary}33`,
          pointerEvents: 'none',
          transition: 'all 300ms ease',
        }} />
      )}

      {/* Card */}
      <div style={cardStyle}>
        {/* Step icon */}
        {isFirst && (
          <div style={{ textAlign: 'center', marginBottom: 12, fontSize: 32 }}>&#128075;</div>
        )}

        <h3 style={{
          margin: '0 0 8px', fontSize: theme.typography.sizes.xxl,
          fontWeight: theme.typography.weights.bold, color: theme.colors.textPrimary,
        }}>
          {stepData.title}
        </h3>

        <p style={{
          margin: '0 0 20px', fontSize: theme.typography.sizes.md,
          color: theme.colors.textSecondary, lineHeight: 1.5,
        }}>
          {stepData.description}
        </p>

        {/* Step dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              width: i === currentStep ? 20 : 8, height: 8,
              borderRadius: 4,
              background: i === currentStep ? theme.colors.primary : theme.colors.inactive,
              transition: theme.transitions.fast,
            }} />
          ))}
        </div>

        {/* Buttons */}
        {isLast ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => handleFinish('assessment')} style={{
              flex: 1, padding: '10px 16px', borderRadius: theme.radii.lg,
              border: 'none', background: theme.colors.primary,
              color: '#fff', fontSize: theme.typography.sizes.md,
              fontWeight: theme.typography.weights.semibold, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Start Assessment
            </button>
            <button onClick={() => handleFinish('explore')} style={{
              flex: 1, padding: '10px 16px', borderRadius: theme.radii.lg,
              border: `1px solid ${theme.colors.borderStrong}`, background: theme.colors.surface,
              color: theme.colors.textPrimary, fontSize: theme.typography.sizes.md,
              fontWeight: theme.typography.weights.semibold, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Explore
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={handleSkip} style={{
              padding: '6px 12px', border: 'none', background: 'none',
              color: theme.colors.textMuted, fontSize: theme.typography.sizes.base,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Skip tour
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              {!isFirst && (
                <button onClick={handleBack} style={{
                  padding: '8px 16px', borderRadius: theme.radii.lg,
                  border: `1px solid ${theme.colors.borderStrong}`, background: theme.colors.surface,
                  color: theme.colors.textPrimary, fontSize: theme.typography.sizes.md,
                  fontWeight: theme.typography.weights.medium, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  Back
                </button>
              )}
              <button onClick={handleNext} style={{
                padding: '8px 16px', borderRadius: theme.radii.lg,
                border: 'none', background: theme.colors.primary,
                color: '#fff', fontSize: theme.typography.sizes.md,
                fontWeight: theme.typography.weights.semibold, cursor: 'pointer', fontFamily: 'inherit',
              }}>
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
