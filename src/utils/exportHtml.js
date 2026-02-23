import { getUseCaseAvgMaturity, getMaturityLevel } from './maturity';
import { ROADMAP_PHASES, MATURITY_COLORS } from '../data/constants';

const MMG_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', -apple-system, sans-serif; background: #F8F7F5; color: #2A2520; line-height: 1.5; }
  .header { background: #1E293B; color: #fff; padding: 32px 40px; }
  .header h1 { font-size: 28px; font-weight: 900; margin-bottom: 4px; }
  .header .subtitle { font-size: 14px; color: #94A3B8; }
  .header .accent { height: 4px; background: linear-gradient(90deg, #38BDF8, #EC4899, #FBB740); margin-top: 16px; border-radius: 2px; }
  .container { max-width: 900px; margin: 0 auto; padding: 32px 40px; }
  .section { margin-bottom: 32px; }
  .section-title { font-size: 18px; font-weight: 900; color: #1E293B; border-bottom: 2px solid #E2E0DC; padding-bottom: 6px; margin-bottom: 16px; }
  .card { background: #fff; border: 1px solid #E2E0DC; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(42,37,32,0.06); }
  .phase-col { flex: 1; border-top: 3px solid; border-radius: 10px; padding: 14px; background: #FAFAF8; }
  .phase-item { padding: 6px 0; border-bottom: 1px solid #F0EFEB; display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
  .dots { display: inline-flex; gap: 3px; }
  .dot { width: 6px; height: 6px; border-radius: 50%; }
  .footer { text-align: center; padding: 24px 40px; color: #8E8E93; font-size: 12px; border-top: 1px solid #E2E0DC; margin-top: 32px; }
  @media print { body { background: #fff; } .header { break-after: avoid; } .section { break-inside: avoid; } }
`;

function maturityDots(score) {
  return Array.from({ length: 5 }, (_, i) => {
    const filled = i < score;
    const color = filled ? (MATURITY_COLORS[score] || '#8E8E93') : '#E2E0DC';
    return `<span class="dot" style="background:${color}"></span>`;
  }).join('');
}

export function generateRoadmapHtml(shortlist, buildingBlockMap, categories, valueChainShortLabels) {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const totalBlocks = new Set();
  shortlist.forEach(item => item.useCase.buildingBlocks.forEach(b => totalBlocks.add(b)));

  const phases = { quickWins: [], mediumTerm: [], strategic: [] };
  shortlist.forEach(item => {
    if (phases[item.phase]) phases[item.phase].push(item);
  });

  const phaseCols = ROADMAP_PHASES.map(phase => {
    const items = phases[phase.id] || [];
    const itemsHtml = items.length === 0
      ? '<div style="color:#C7C5C1;font-size:12px;font-style:italic;padding:8px 0;">No items</div>'
      : items.map(item => {
          const uc = item.useCase;
          const maturity = getUseCaseAvgMaturity(uc, buildingBlockMap);
          const ml = getMaturityLevel(maturity);
          const vcLabel = valueChainShortLabels?.[uc.valueChainArea] || uc.valueChainArea;
          return `<div style="background:#fff;border:1px solid #E2E0DC;border-radius:10px;padding:10px 12px;margin-bottom:8px;border-left:3px solid ${ml.color};">
            <div style="font-weight:600;font-size:13px;color:#2A2520;">${uc.name}</div>
            <div style="font-size:11px;color:#8E8E93;margin-top:2px;">${vcLabel} &middot; ${uc.activityType}</div>
            <div style="display:flex;align-items:center;gap:6px;margin-top:4px;">
              <span class="dots">${maturityDots(Math.round(maturity))}</span>
              <span style="font-size:11px;font-weight:700;color:${ml.color};">${maturity.toFixed(1)}</span>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:3px;margin-top:6px;">
              ${uc.buildingBlocks.map(b => `<span style="font-size:10px;padding:1px 5px;border-radius:4px;background:#5B8AC415;color:#5B8AC4;font-weight:500;">${b}</span>`).join('')}
            </div>
          </div>`;
        }).join('');

    return `<div class="phase-col" style="border-top-color:${phase.color};">
      <div style="font-size:16px;font-weight:900;color:#2A2520;margin-bottom:2px;">${phase.label}</div>
      <div style="font-size:12px;color:#8E8E93;margin-bottom:12px;">${phase.timeframe} &middot; ${items.length} items</div>
      ${itemsHtml}
    </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Implementation Roadmap</title>
  <style>${MMG_STYLES}</style>
</head>
<body>
  <div class="header">
    <h1>AI Implementation Roadmap</h1>
    <div class="subtitle">${date} &middot; ${shortlist.length} use cases &middot; ${totalBlocks.size} unique building blocks &middot; MMG Management Consulting</div>
    <div class="accent"></div>
  </div>
  <div class="container">
    <div class="section">
      <div style="display:flex;gap:16px;">${phaseCols}</div>
    </div>
  </div>
  <div class="footer">
    Generated by AI Building Blocks Framework &mdash; MMG Management Consulting &mdash; <a href="https://www.mmgmc.ch" style="color:#5B8AC4;">www.mmgmc.ch</a>
  </div>
</body>
</html>`;
}

export function generateAssessmentHtml({ companyProfile, executiveSummary, recommendations, dimensionScores, readinessScore, areaRatings, valueChainShortLabels }) {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const profileHtml = companyProfile && (companyProfile.industry || companyProfile.companySize || companyProfile.role)
    ? `<div class="card" style="margin-bottom:20px;">
        <div style="font-weight:700;font-size:14px;margin-bottom:8px;">Company Profile</div>
        <div style="display:flex;gap:16px;flex-wrap:wrap;font-size:13px;color:#5C5A56;">
          ${companyProfile.industry ? `<span>Industry: <strong>${companyProfile.industry}</strong></span>` : ''}
          ${companyProfile.companySize ? `<span>Size: <strong>${companyProfile.companySize} employees</strong></span>` : ''}
          ${companyProfile.role ? `<span>Role: <strong>${companyProfile.role}</strong></span>` : ''}
        </div>
      </div>`
    : '';

  const summaryHtml = executiveSummary
    ? `<div class="card" style="margin-bottom:20px;background:#1E293B;color:#ccc8c4;">
        <div style="font-weight:900;font-size:15px;color:#FBB740;margin-bottom:10px;">Executive Summary</div>
        <div style="font-size:13px;line-height:1.7;white-space:pre-line;">${executiveSummary}</div>
      </div>`
    : '';

  const FIT_COLORS = { 'Strong Fit': '#3aaa88', 'Good Fit': '#5B8AC4', 'Moderate Fit': '#FBB740', 'Weak Fit': '#D94070' };

  const recsHtml = (recommendations || []).map((rec, i) => {
    const uc = rec.useCase || {};
    const fitLabel = rec.score >= 4 ? 'Strong Fit' : rec.score >= 3 ? 'Good Fit' : rec.score >= 2 ? 'Moderate Fit' : 'Weak Fit';
    const fitColor = FIT_COLORS[fitLabel] || '#8E8E93';
    const areaLabel = (valueChainShortLabels || {})[uc.valueChainArea] || uc.valueChainArea || '';
    return `<div class="card" style="margin-bottom:10px;border-left:3px solid ${fitColor};">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <div style="display:flex;align-items:center;gap:8px;">
          <span style="display:inline-flex;width:20px;height:20px;border-radius:50%;background:${fitColor}20;color:${fitColor};font-size:11px;font-weight:900;align-items:center;justify-content:center;">${i + 1}</span>
          <strong style="font-size:14px;">${uc.name || ''}</strong>
          <span style="font-size:11px;color:#8E8E93;">${areaLabel}</span>
        </div>
        <span style="font-size:11px;font-weight:700;color:${fitColor};">${fitLabel}</span>
      </div>
      ${rec.whyText ? `<div style="font-size:12px;color:#5C5A56;line-height:1.5;margin-top:4px;">${rec.whyText}</div>` : ''}
      <div style="display:flex;flex-wrap:wrap;gap:3px;margin-top:8px;">
        ${(uc.buildingBlocks || []).map(b => `<span style="font-size:10px;padding:1px 5px;border-radius:4px;background:#5B8AC415;color:#5B8AC4;font-weight:500;">${b}</span>`).join('')}
      </div>
    </div>`;
  }).join('');

  const DIM_LABELS = { data: 'Data & Infrastructure', talent: 'Talent & Skills', process: 'Process & Governance', culture: 'Culture & Leadership' };
  const DIM_COLORS = { data: '#5B8AC4', talent: '#3aaa88', process: '#FBB740', culture: '#EC4899' };

  const readinessHtml = dimensionScores
    ? `<div class="card" style="margin-bottom:20px;">
        <div style="font-weight:700;font-size:14px;margin-bottom:10px;">Readiness Overview (${(readinessScore || 0).toFixed(1)}/5)</div>
        ${Object.entries(dimensionScores).map(([key, val]) => {
          const color = DIM_COLORS[key] || '#8E8E93';
          return `<div style="margin-bottom:8px;">
            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px;">
              <span style="font-weight:600;">${DIM_LABELS[key] || key}</span>
              <span style="font-weight:700;color:${color};">${val.toFixed(1)}/5</span>
            </div>
            <div style="height:6px;background:#F0EFEB;border-radius:3px;overflow:hidden;">
              <div style="height:100%;width:${(val / 5) * 100}%;background:${color};border-radius:3px;"></div>
            </div>
          </div>`;
        }).join('')}
      </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Readiness Assessment Report</title>
  <style>${MMG_STYLES}</style>
</head>
<body>
  <div class="header">
    <h1>AI Readiness Assessment Report</h1>
    <div class="subtitle">${date} &middot; ${(recommendations || []).length} recommendations &middot; MMG Management Consulting</div>
    <div class="accent"></div>
  </div>
  <div class="container">
    ${profileHtml}
    ${summaryHtml}
    ${readinessHtml}
    <div class="section">
      <div class="section-title">Recommended AI Use Cases</div>
      ${recsHtml}
    </div>
  </div>
  <div class="footer">
    Generated by AI Building Blocks Framework &mdash; MMG Management Consulting &mdash; <a href="https://www.mmgmc.ch" style="color:#5B8AC4;">www.mmgmc.ch</a>
  </div>
</body>
</html>`;
}

export function openHtmlReport(html) {
  const w = window.open('', '_blank');
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}
