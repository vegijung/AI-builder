import { computeQuadrant, getQuadrantLabel, getQuadrantColor } from './workshop';
import { computeReadinessScore } from './assessment';
import { getUseCaseAvgMaturity, getMaturityLevel } from './maturity';
import { READINESS_DIMENSIONS, ROADMAP_PHASES, MATURITY_LABELS, MATURITY_COLORS } from '../data/constants';

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
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .stat-box { text-align: center; padding: 12px; border-radius: 10px; }
  .stat-value { font-size: 28px; font-weight: 900; }
  .stat-label { font-size: 12px; color: #8E8E93; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; padding: 8px 12px; font-weight: 600; color: #8E8E93; font-size: 11px; text-transform: uppercase; border-bottom: 2px solid #E2E0DC; }
  td { padding: 10px 12px; border-bottom: 1px solid #F0EFEB; color: #49453F; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; }
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

function radarSvg(ratings) {
  const dims = READINESS_DIMENSIONS;
  const cx = 100, cy = 100, r = 70;
  const n = dims.length;
  const angleStep = (2 * Math.PI) / n;

  const gridLines = [1, 2, 3, 4, 5].map(level => {
    const pts = dims.map((_, i) => {
      const angle = -Math.PI / 2 + i * angleStep;
      const x = cx + (r * level / 5) * Math.cos(angle);
      const y = cy + (r * level / 5) * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
    return `<polygon points="${pts}" fill="none" stroke="#E2E0DC" stroke-width="0.5" />`;
  }).join('');

  const axes = dims.map((_, i) => {
    const angle = -Math.PI / 2 + i * angleStep;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#E2E0DC" stroke-width="0.5" />`;
  }).join('');

  const dataPts = dims.map((dim, i) => {
    const val = ratings[dim.id] || 0;
    const angle = -Math.PI / 2 + i * angleStep;
    const x = cx + (r * val / 5) * Math.cos(angle);
    const y = cy + (r * val / 5) * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  const labels = dims.map((dim, i) => {
    const angle = -Math.PI / 2 + i * angleStep;
    const x = cx + (r + 18) * Math.cos(angle);
    const y = cy + (r + 18) * Math.sin(angle);
    const anchor = Math.abs(Math.cos(angle)) < 0.1 ? 'middle' : Math.cos(angle) > 0 ? 'start' : 'end';
    return `<text x="${x}" y="${y}" text-anchor="${anchor}" dominant-baseline="middle" font-size="10" fill="#8E8E93" font-weight="600">${dim.label}</text>`;
  }).join('');

  return `<svg width="220" height="220" viewBox="0 0 200 200" style="display:block;margin:0 auto;">
    ${gridLines}${axes}
    <polygon points="${dataPts}" fill="#5B8AC430" stroke="#5B8AC4" stroke-width="2" />
    ${labels}
  </svg>`;
}

function matrixSvg(priorities) {
  const size = 260, pad = 30, inner = size - pad * 2;
  const quadrants = [
    { label: 'Plan Carefully', x: pad, y: pad, color: '#FBB74020' },
    { label: 'Do First', x: pad + inner / 2, y: pad, color: '#50D8A820' },
    { label: 'Reconsider', x: pad, y: pad + inner / 2, color: '#8E8E9320' },
    { label: 'Delegate', x: pad + inner / 2, y: pad + inner / 2, color: '#5BC8D420' },
  ];

  const rects = quadrants.map(q =>
    `<rect x="${q.x}" y="${q.y}" width="${inner / 2}" height="${inner / 2}" fill="${q.color}" rx="4"/>
     <text x="${q.x + inner / 4}" y="${q.y + inner / 4}" text-anchor="middle" dominant-baseline="middle" font-size="9" fill="#888" font-weight="600">${q.label}</text>`
  ).join('');

  const entries = Object.entries(priorities);
  const dots = entries.map(([name, { impact, feasibility }], i) => {
    const cx = pad + ((feasibility - 0.5) / 5) * inner;
    const cy = size - pad - ((impact - 0.5) / 5) * inner;
    const q = computeQuadrant(impact, feasibility);
    const color = getQuadrantColor(q);
    return `<circle cx="${cx}" cy="${cy}" r="8" fill="${color}" stroke="#fff" stroke-width="2"/>
            <text x="${cx}" y="${cy + 0.5}" text-anchor="middle" dominant-baseline="middle" font-size="8" fill="#fff" font-weight="800">${i + 1}</text>`;
  }).join('');

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="display:block;margin:0 auto;">
    ${rects}
    <line x1="${pad}" y1="${pad}" x2="${pad}" y2="${size - pad}" stroke="#CCC" stroke-width="1"/>
    <line x1="${pad}" y1="${size - pad}" x2="${size - pad}" y2="${size - pad}" stroke="#CCC" stroke-width="1"/>
    <text x="${size / 2}" y="${size - 6}" text-anchor="middle" font-size="10" fill="#8E8E93" font-weight="600">Feasibility &rarr;</text>
    <text x="8" y="${size / 2}" text-anchor="middle" font-size="10" fill="#8E8E93" font-weight="600" transform="rotate(-90,8,${size / 2})">Impact &uarr;</text>
    ${dots}
  </svg>`;
}

export function generateWorkshopHtml(workshopName, assessment, priorities, roadmapShortlist, buildingBlockMap) {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const name = workshopName || 'AI Strategy Workshop';
  const ucCount = Object.keys(priorities).length;

  // Readiness section
  let readinessHtml = '';
  if (assessment?.isComplete) {
    const score = computeReadinessScore(assessment.readinessRatings);
    const ml = getMaturityLevel(score);
    const dimRows = READINESS_DIMENSIONS.map(dim =>
      `<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;">
        <span style="font-size:12px;color:#8E8E93;">${dim.label}</span>
        <span style="font-size:14px;font-weight:700;color:#2A2520;">${assessment.readinessRatings[dim.id]}/5</span>
      </div>`
    ).join('');

    readinessHtml = `
      <div class="section">
        <div class="section-title">Organization Readiness</div>
        <div class="grid-2">
          <div class="card" style="text-align:center;">
            ${radarSvg(assessment.readinessRatings)}
            <div style="margin-top:10px;">
              <span style="font-size:28px;font-weight:900;color:${ml.color};">${score.toFixed(1)}</span>
              <span style="font-size:14px;color:#8E8E93;"> / 5.0 Overall</span>
            </div>
          </div>
          <div class="card">
            <div style="font-size:13px;font-weight:700;color:#8E8E93;text-transform:uppercase;margin-bottom:10px;">Dimension Scores</div>
            ${dimRows}
          </div>
        </div>
      </div>`;
  }

  // Priority section
  const prioritized = Object.entries(priorities)
    .map(([pName, { impact, feasibility }]) => ({ name: pName, impact, feasibility, quadrant: computeQuadrant(impact, feasibility) }))
    .sort((a, b) => (b.impact + b.feasibility) - (a.impact + a.feasibility));

  const quadrantCounts = { doFirst: 0, plan: 0, delegate: 0, reconsider: 0 };
  prioritized.forEach(p => quadrantCounts[p.quadrant]++);

  const summaryBoxes = [
    { q: 'doFirst', label: 'Do First', color: '#50D8A8' },
    { q: 'plan', label: 'Plan Carefully', color: '#FBB740' },
    { q: 'delegate', label: 'Delegate', color: '#5BC8D4' },
    { q: 'reconsider', label: 'Reconsider', color: '#8E8E93' },
  ].map(({ q, label, color }) =>
    `<div class="stat-box" style="background:${color}10;">
      <div class="stat-value" style="color:${color};">${quadrantCounts[q]}</div>
      <div class="stat-label">${label}</div>
    </div>`
  ).join('');

  const tableRows = prioritized.map((p, i) => {
    const color = getQuadrantColor(p.quadrant);
    return `<tr>
      <td style="color:#8E8E93;">${i + 1}</td>
      <td style="font-weight:600;color:#2A2520;">${p.name}</td>
      <td style="text-align:center;"><span style="font-weight:700;color:#5B8AC4;">${p.impact}</span>/5</td>
      <td style="text-align:center;"><span style="font-weight:700;color:#5B8AC4;">${p.feasibility}</span>/5</td>
      <td><span class="badge" style="background:${color}20;color:${color};">${getQuadrantLabel(p.quadrant)}</span></td>
    </tr>`;
  }).join('');

  const legendItems = prioritized.map((p, i) => {
    const color = getQuadrantColor(p.quadrant);
    return `<div style="display:flex;align-items:center;gap:6px;padding:2px 0;">
      <span style="display:inline-flex;width:16px;height:16px;border-radius:50%;background:${color};color:#fff;font-size:8px;font-weight:800;align-items:center;justify-content:center;">${i + 1}</span>
      <span style="font-size:12px;color:#49453F;">${p.name}</span>
    </div>`;
  }).join('');

  const priorityHtml = `
    <div class="section">
      <div class="section-title">Prioritized Use Cases</div>
      <div class="grid-2" style="margin-bottom:20px;">
        <div class="card">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            ${summaryBoxes}
          </div>
        </div>
        <div class="card" style="text-align:center;">
          ${matrixSvg(priorities)}
          <div style="margin-top:8px;">${legendItems}</div>
        </div>
      </div>
      <div class="card">
        <table>
          <thead><tr>
            <th>#</th><th>Use Case</th><th style="text-align:center;">Impact</th><th style="text-align:center;">Feasibility</th><th>Quadrant</th>
          </tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
    </div>`;

  // Roadmap section
  let roadmapHtml = '';
  if (roadmapShortlist?.length > 0) {
    const phases = { quickWins: [], mediumTerm: [], strategic: [] };
    roadmapShortlist.forEach(item => {
      if (phases[item.phase]) phases[item.phase].push(item);
    });

    const phaseCols = ROADMAP_PHASES.map(phase => {
      const items = phases[phase.id] || [];
      const itemsHtml = items.length === 0
        ? '<div style="color:#C7C5C1;font-size:12px;font-style:italic;padding:8px 0;">No items</div>'
        : items.map(item => {
            const maturity = getUseCaseAvgMaturity(item.useCase, buildingBlockMap);
            return `<div class="phase-item">
              <span style="font-weight:600;color:#49453F;">${item.useCase.name}</span>
              <span class="dots">${maturityDots(Math.round(maturity))}</span>
            </div>`;
          }).join('');

      return `<div class="phase-col" style="border-top-color:${phase.color};">
        <div style="font-size:14px;font-weight:900;color:#2A2520;margin-bottom:2px;">${phase.label}</div>
        <div style="font-size:11px;color:#8E8E93;margin-bottom:10px;">${phase.timeframe}</div>
        ${itemsHtml}
      </div>`;
    }).join('');

    roadmapHtml = `
      <div class="section">
        <div class="section-title">Implementation Roadmap</div>
        <div style="display:flex;gap:16px;">${phaseCols}</div>
      </div>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} — Report</title>
  <style>${MMG_STYLES}</style>
</head>
<body>
  <div class="header">
    <h1>${name}</h1>
    <div class="subtitle">${date} &middot; ${ucCount} use cases evaluated &middot; MMG Management Consulting</div>
    <div class="accent"></div>
  </div>
  <div class="container">
    ${readinessHtml}
    ${priorityHtml}
    ${roadmapHtml}
  </div>
  <div class="footer">
    Generated by AI Building Blocks Framework &mdash; MMG Management Consulting &mdash; <a href="https://www.mmgmc.ch" style="color:#5B8AC4;">www.mmgmc.ch</a>
  </div>
</body>
</html>`;
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

export function openHtmlReport(html) {
  const w = window.open('', '_blank');
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}
