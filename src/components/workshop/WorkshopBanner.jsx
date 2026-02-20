import { useState, useEffect } from 'react';
import { PrioritizationStep } from './PrioritizationStep';
import { WorkshopReport } from './WorkshopReport';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { theme } from '../../styles/theme';

const STAGES = [
  { num: 1, label: 'Assess', tab: 'assessment' },
  { num: 2, label: 'Explore', tab: 'explore' },
  { num: 3, label: 'Prioritize', tab: null },
  { num: 4, label: 'Report', tab: null },
];

export function WorkshopBanner({ workshop, assessment, roadmap, activeTab, onNavigate }) {
  const [nameInput, setNameInput] = useState('');
  const { isMobile } = useBreakpoint();
  const { isActive, workshopName, stage, priorities, startWorkshop, goToStage, setPriority, endWorkshop } = workshop;

  useEffect(() => {
    if (stage === 1 && activeTab !== 'assessment') onNavigate('assessment');
    if (stage === 2 && activeTab !== 'explore') onNavigate('explore');
  }, [stage]);

  if (!isActive) return null;

  const canAdvance = () => {
    if (stage === 1) return assessment.isComplete;
    if (stage === 2) return roadmap.shortlist.length > 0;
    if (stage === 3) return Object.keys(priorities).length > 0;
    return false;
  };

  const handleNext = () => {
    const nextStage = stage + 1;
    goToStage(nextStage);
    const stageInfo = STAGES.find(s => s.num === nextStage);
    if (stageInfo?.tab) onNavigate(stageInfo.tab);
  };

  const handleBack = () => {
    const prevStage = Math.max(1, stage - 1);
    goToStage(prevStage);
    const stageInfo = STAGES.find(s => s.num === prevStage);
    if (stageInfo?.tab) onNavigate(stageInfo.tab);
  };

  if (stage === 0) {
    return (
      <div style={{
        background: theme.colors.surface, border: '1px solid ' + theme.colors.borderMedium,
        borderRadius: theme.radii.xl, padding: isMobile ? 16 : 24,
        marginBottom: theme.spacing.lg, animation: 'fadeIn 0.2s ease-out',
      }}>
        <div style={{
          display: 'flex', alignItems: isMobile ? 'stretch' : 'center',
          flexDirection: isMobile ? 'column' : 'row', gap: 12,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: theme.typography.sizes.lg, fontWeight: theme.typography.weights.black, color: theme.colors.textPrimary, marginBottom: 4 }}>
              Start AI Strategy Workshop
            </div>
            <div style={{ fontSize: theme.typography.sizes.sm, color: theme.colors.textMuted }}>
              Guided process: assess readiness, explore use cases, prioritize, and build a roadmap.
            </div>
          </div>
          <input
            type="text" value={nameInput} onChange={e => setNameInput(e.target.value)}
            placeholder="Workshop name"
            style={{
              padding: '8px 14px', borderRadius: theme.radii.lg,
              border: '1px solid ' + theme.colors.borderMedium, background: theme.colors.background,
              fontSize: theme.typography.sizes.md, fontFamily: 'inherit', outline: 'none',
              minWidth: 200, transition: `border-color ${theme.transitions.fast}`,
            }}
            onFocus={e => { e.target.style.borderColor = theme.colors.primary; }}
            onBlur={e => { e.target.style.borderColor = theme.colors.borderMedium; }}
            onKeyDown={e => { if (e.key === 'Enter' && nameInput.trim()) startWorkshop(nameInput.trim()); }}
          />
          <button
            onClick={() => startWorkshop(nameInput.trim() || 'AI Strategy Workshop')}
            style={{
              padding: '8px 20px', borderRadius: theme.radii.lg, border: 'none',
              background: 'linear-gradient(135deg, #FBB740, #F47B20)', color: '#fff',
              fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.bold,
              cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
              transition: `all ${theme.transitions.fast}`,
            }}
          >
            Begin &rarr;
          </button>
          <button onClick={endWorkshop} style={{
            padding: '8px 14px', borderRadius: theme.radii.lg,
            border: '1px solid ' + theme.colors.borderMedium, background: 'transparent',
            color: theme.colors.textMuted, fontSize: theme.typography.sizes.sm,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  const stageHint = {
    1: 'Complete the AI readiness assessment to continue.',
    2: 'Add use cases to your roadmap to continue.',
    3: 'Rate each use case by impact and feasibility.',
    4: 'Review your workshop results and export the report.',
  }[stage] || '';

  return (
    <>
      <div style={{
        background: theme.colors.surface, border: '1px solid ' + theme.colors.borderMedium,
        borderRadius: theme.radii.xl, padding: isMobile ? '10px 14px' : '10px 20px',
        marginBottom: theme.spacing.lg, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.bold,
            color: theme.colors.primaryDark, background: theme.colors.primary + '20',
            padding: '3px 8px', borderRadius: theme.radii.md,
          }}>
            Workshop
          </span>
          <span style={{ fontSize: theme.typography.sizes.md, fontWeight: theme.typography.weights.semibold, color: theme.colors.textPrimary }}>
            {workshopName}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {STAGES.map((s, i) => {
            const isComplete = stage > s.num;
            const isCurrent = stage === s.num;
            return (
              <div key={s.num} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '4px 10px', borderRadius: theme.radii.lg,
                  background: isCurrent ? theme.colors.primary + '18' : 'transparent',
                }}>
                  <span style={{
                    display: 'inline-flex', width: 20, height: 20, borderRadius: theme.radii.circle,
                    background: isComplete ? theme.colors.activityPrimary : isCurrent ? theme.colors.primary : theme.colors.inactive,
                    color: isComplete || isCurrent ? '#fff' : theme.colors.textMuted,
                    fontSize: 10, fontWeight: theme.typography.weights.black,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isComplete ? '\u2713' : s.num}
                  </span>
                  {!isMobile && (
                    <span style={{
                      fontSize: theme.typography.sizes.sm,
                      fontWeight: isCurrent ? theme.typography.weights.bold : theme.typography.weights.medium,
                      color: isCurrent ? theme.colors.textPrimary : theme.colors.textMuted,
                    }}>
                      {s.label}
                    </span>
                  )}
                </div>
                {i < STAGES.length - 1 && !isMobile && (
                  <div style={{
                    width: 16, height: 2,
                    background: isComplete ? theme.colors.activityPrimary : theme.colors.inactive,
                    borderRadius: 1, margin: '0 2px',
                  }} />
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: theme.typography.sizes.xs, color: theme.colors.textMuted, maxWidth: 200 }}>
            {stageHint}
          </span>
          {stage > 1 && stage <= 4 && (
            <button onClick={handleBack} style={{
              padding: '5px 12px', borderRadius: theme.radii.lg,
              border: '1px solid ' + theme.colors.borderMedium, background: theme.colors.surface,
              color: theme.colors.textTertiary, fontSize: theme.typography.sizes.sm,
              fontWeight: theme.typography.weights.semibold, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              &larr; Back
            </button>
          )}
          {stage < 4 && (
            <button onClick={handleNext} disabled={!canAdvance()} style={{
              padding: '5px 12px', borderRadius: theme.radii.lg, border: 'none',
              background: canAdvance() ? theme.colors.activityPrimary : theme.colors.inactive,
              color: canAdvance() ? '#fff' : theme.colors.textMuted,
              fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.bold,
              cursor: canAdvance() ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
              transition: `all ${theme.transitions.fast}`,
            }}>
              Next &rarr;
            </button>
          )}
          <button onClick={endWorkshop} style={{
            padding: '5px 10px', borderRadius: theme.radii.lg,
            border: '1px solid ' + theme.colors.borderMedium, background: 'transparent',
            color: theme.colors.textMuted, fontSize: theme.typography.sizes.sm,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Exit
          </button>
        </div>
      </div>

      {stage === 3 && (
        <div style={{
          background: theme.colors.surface, border: '1px solid ' + theme.colors.borderMedium,
          borderRadius: theme.radii.xl, padding: isMobile ? 16 : 24, marginBottom: theme.spacing.lg,
          animation: 'fadeIn 0.3s ease-out',
        }}>
          <PrioritizationStep
            roadmapShortlist={roadmap.shortlist}
            priorities={priorities}
            onSetPriority={setPriority}
          />
        </div>
      )}

      {stage === 4 && (
        <div style={{
          background: theme.colors.surface, border: '1px solid ' + theme.colors.borderMedium,
          borderRadius: theme.radii.xl, padding: isMobile ? 16 : 24, marginBottom: theme.spacing.lg,
          animation: 'fadeIn 0.3s ease-out',
        }}>
          <WorkshopReport
            workshopName={workshopName}
            assessment={assessment}
            priorities={priorities}
            roadmapShortlist={roadmap.shortlist}
          />
        </div>
      )}
    </>
  );
}
