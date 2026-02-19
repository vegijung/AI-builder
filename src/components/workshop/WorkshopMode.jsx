import { useState } from 'react';
import { WorkshopProgress } from './WorkshopProgress';
import { PrioritizationStep } from './PrioritizationStep';
import { WorkshopReport } from './WorkshopReport';
import { AssessmentTab } from '../tabs/AssessmentTab';
import { FinderTab } from '../tabs/FinderTab';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { theme } from '../../styles/theme';

export function WorkshopMode({ workshop, assessment, roadmap }) {
  const [nameInput, setNameInput] = useState('');
  const { isMobile } = useBreakpoint();
  const { isActive, workshopName, stage, priorities, startWorkshop, goToStage, setPriority, endWorkshop, resetWorkshop } = workshop;

  if (!isActive) return null;

  const canAdvance = () => {
    if (stage === 1) return assessment.isComplete;
    if (stage === 2) return roadmap.shortlist.length > 0;
    if (stage === 3) return Object.keys(priorities).length > 0;
    return false;
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: theme.colors.background,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e, #2d2b55)',
        padding: isMobile ? '12px 16px' : '14px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: theme.radii.xl,
            background: 'linear-gradient(135deg, #FBB740, #F47B20)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 12, fontWeight: 800,
          }}>WS</div>
          <div>
            <div style={{ fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.black, color: '#fff' }}>
              {workshopName || 'Workshop'}
            </div>
            <div style={{ fontSize: theme.typography.sizes.sm, color: 'rgba(255,255,255,0.5)' }}>AI Strategy Workshop</div>
          </div>
        </div>

        {stage > 0 && <WorkshopProgress currentStage={stage} isMobile={isMobile} />}

        <div style={{ display: 'flex', gap: 8 }}>
          {stage > 0 && stage < 4 && (
            <button onClick={() => goToStage(Math.max(1, stage - 1))} style={{
              padding: '6px 14px', borderRadius: theme.radii.lg, border: '1px solid rgba(255,255,255,0.2)',
              background: 'transparent', color: '#fff', fontSize: theme.typography.sizes.lg,
              fontWeight: theme.typography.weights.semibold, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              &larr; Back
            </button>
          )}
          {stage > 0 && stage < 4 && (
            <button
              onClick={() => goToStage(stage + 1)}
              disabled={!canAdvance()}
              style={{
                padding: '6px 14px', borderRadius: theme.radii.lg, border: 'none',
                background: canAdvance() ? '#50D8A8' : 'rgba(255,255,255,0.1)',
                color: canAdvance() ? '#1a1a2e' : 'rgba(255,255,255,0.3)',
                fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.bold,
                cursor: canAdvance() ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
                transition: `all ${theme.transitions.fast}`,
              }}
            >
              Next &rarr;
            </button>
          )}
          <button onClick={() => { endWorkshop(); }} style={{
            padding: '6px 14px', borderRadius: theme.radii.lg, border: '1px solid rgba(255,255,255,0.15)',
            background: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: theme.typography.sizes.lg,
            fontWeight: theme.typography.weights.medium, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Exit Workshop
          </button>
        </div>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: isMobile ? 16 : 32,
      }}>
        {stage === 0 && (
          <div style={{
            maxWidth: 500, margin: '80px auto', textAlign: 'center',
            animation: 'fadeIn 0.3s ease-out',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: theme.radii.xl,
              background: 'linear-gradient(135deg, #FBB740, #F47B20)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 24, fontWeight: 800, margin: '0 auto 20px',
            }}>AI</div>
            <h2 style={{ fontSize: 24, fontWeight: theme.typography.weights.black, color: theme.colors.textPrimary, marginBottom: 8 }}>
              Start AI Strategy Workshop
            </h2>
            <p style={{ fontSize: theme.typography.sizes.xxl, color: theme.colors.textTertiary, marginBottom: 28, lineHeight: 1.6 }}>
              Walk through a guided process: assess your readiness, discover relevant use cases, prioritize them, and build an implementation roadmap.
            </p>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Workshop name (e.g. Acme Corp AI Strategy)"
              style={{
                width: '100%', padding: '12px 16px', borderRadius: theme.radii.xl,
                border: '2px solid ' + theme.colors.borderMedium, background: theme.colors.surface,
                color: theme.colors.textPrimary, fontSize: theme.typography.sizes.xxl,
                fontFamily: 'inherit', outline: 'none', marginBottom: 16,
                transition: `border-color ${theme.transitions.fast}`,
                boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = theme.colors.primary; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = theme.colors.borderMedium; }}
              onKeyDown={(e) => { if (e.key === 'Enter' && nameInput.trim()) startWorkshop(nameInput.trim()); }}
            />
            <button
              onClick={() => startWorkshop(nameInput.trim() || 'AI Strategy Workshop')}
              style={{
                padding: '12px 32px', borderRadius: theme.radii.xl, border: 'none',
                background: 'linear-gradient(135deg, #FBB740, #F47B20)',
                color: '#fff', fontSize: theme.typography.sizes.xxl, fontWeight: theme.typography.weights.bold,
                cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 4px 12px rgba(251,183,64,0.3)',
                transition: `all ${theme.transitions.fast}`,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              Begin Workshop &rarr;
            </button>
          </div>
        )}

        {stage === 1 && (
          <div style={{ maxWidth: 900, margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ marginBottom: 16, padding: '12px 16px', background: theme.colors.primary + '10', borderRadius: theme.radii.xl, border: '1px solid ' + theme.colors.primary + '20' }}>
              <span style={{ fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.semibold, color: theme.colors.primary }}>
                Stage 1: </span>
              <span style={{ fontSize: theme.typography.sizes.xl, color: theme.colors.textTertiary }}>
                Assess your organization's AI readiness across key dimensions.
              </span>
            </div>
            <AssessmentTab assessment={assessment} onAddToRoadmap={roadmap.addToRoadmap} />
          </div>
        )}

        {stage === 2 && (
          <div style={{ maxWidth: 1000, margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ marginBottom: 16, padding: '12px 16px', background: theme.colors.primary + '10', borderRadius: theme.radii.xl, border: '1px solid ' + theme.colors.primary + '20' }}>
              <span style={{ fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.semibold, color: theme.colors.primary }}>
                Stage 2: </span>
              <span style={{ fontSize: theme.typography.sizes.xl, color: theme.colors.textTertiary }}>
                Discover relevant AI use cases and add them to your roadmap.
              </span>
            </div>
            <FinderTab roadmapState={roadmap} assessmentState={assessment} />
          </div>
        )}

        {stage === 3 && (
          <div style={{ maxWidth: 1000, margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ marginBottom: 16, padding: '12px 16px', background: theme.colors.primary + '10', borderRadius: theme.radii.xl, border: '1px solid ' + theme.colors.primary + '20' }}>
              <span style={{ fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.semibold, color: theme.colors.primary }}>
                Stage 3: </span>
              <span style={{ fontSize: theme.typography.sizes.xl, color: theme.colors.textTertiary }}>
                Prioritize your selected use cases by business impact and implementation feasibility.
              </span>
            </div>
            <PrioritizationStep
              roadmapShortlist={roadmap.shortlist}
              priorities={priorities}
              onSetPriority={setPriority}
            />
          </div>
        )}

        {stage === 4 && (
          <div style={{ maxWidth: 1000, margin: '0 auto', animation: 'fadeIn 0.3s ease-out' }}>
            <div style={{ marginBottom: 16, padding: '12px 16px', background: '#50D8A815', borderRadius: theme.radii.xl, border: '1px solid #50D8A830' }}>
              <span style={{ fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.semibold, color: '#50D8A8' }}>
                Workshop Complete! </span>
              <span style={{ fontSize: theme.typography.sizes.xl, color: theme.colors.textTertiary }}>
                Review your results below and export the report.
              </span>
            </div>
            <WorkshopReport
              workshopName={workshopName}
              assessment={assessment}
              priorities={priorities}
              roadmapShortlist={roadmap.shortlist}
            />
          </div>
        )}
      </div>
    </div>
  );
}
