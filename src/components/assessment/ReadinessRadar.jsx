import { theme } from '../../styles/theme';
import { READINESS_DIMENSIONS } from '../../data/constants';
import { computeDimensionScores } from '../../utils/assessment';

export function ReadinessRadar({ ratings }) {
  const cx = 120, cy = 120, radius = 90;
  const dims = READINESS_DIMENSIONS;
  const n = dims.length;

  const dimScores = computeDimensionScores(ratings);

  const getPoint = (index, value) => {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    const r = (value / 5) * radius;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const gridLevels = [1, 2, 3, 4, 5];
  const dataPoints = dims.map((d, i) => getPoint(i, dimScores[d.id] || 0));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  const subDots = [];
  dims.forEach((dim, i) => {
    dim.subQuestions.forEach(sq => {
      const val = ratings[sq.id] ?? 3;
      const pt = getPoint(i, val);
      subDots.push({ ...pt, label: sq.label, value: val });
    });
  });

  return (
    <svg width={240} height={240} viewBox="0 0 240 240" style={{ display: 'block', margin: '0 auto' }}>
      {gridLevels.map(level => {
        const points = dims.map((_, i) => getPoint(i, level));
        const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
        return <path key={level} d={path} fill="none" stroke={theme.colors.borderLight} strokeWidth={1} />;
      })}
      {dims.map((_, i) => {
        const p = getPoint(i, 5);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={theme.colors.borderLight} strokeWidth={1} />;
      })}
      <path d={dataPath} fill={theme.colors.primary + '25'} stroke={theme.colors.primary} strokeWidth={2.5} strokeLinejoin="round" />
      {subDots.map((dot, idx) => (
        <circle key={'sub-' + idx} cx={dot.x} cy={dot.y} r={2.5} fill={theme.colors.primary} opacity={0.35} />
      ))}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill={theme.colors.primary} stroke="#fff" strokeWidth={2} />
      ))}
      {dims.map((d, i) => {
        const labelPoint = getPoint(i, 6.2);
        const isTop = i === 0;
        const isBottom = i === 2;
        return (
          <text
            key={d.id}
            x={labelPoint.x}
            y={labelPoint.y + (isTop ? -4 : isBottom ? 8 : 0)}
            textAnchor="middle"
            style={{ fontSize: 10, fontWeight: 600, fill: theme.colors.textMuted, fontFamily: theme.typography.fontFamily }}
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}
