import { useMemo } from 'react';

export function MiniLifeCard() {
  const startYear = 2026;
  const today = 2026;
  const events = { 2027: 'event', 2030: 'event-2', 2038: 'event-2', 2042: 'event', 2050: 'event' };
  return (
    <div className="mini-card">
      <div className="mini-card-h">
        <span>2026 – 2060 인생</span>
        <span className="chev">∧ ∨</span>
      </div>
      <div className="years-row">
        {['+0', '+5', '+10', '+15', '+20', '+25', '+30'].map(h => (
          <div key={h} className="yr head">{h}</div>
        ))}
        {Array.from({ length: 35 }, (_, i) => {
          const y = startYear + i;
          const cls = y === today ? 'today' : events[y] || (y > 2060 ? 'dim' : '');
          return <div key={y} className={`yr ${cls}`}>{String(y).slice(2)}</div>;
        })}
      </div>
    </div>
  );
}

const MENU_ITEMS = [
  { id: 'networth',    icon: '💰', label: '순자산 계산기',       dot: 'pink' },
  { id: 'etf',         icon: '📈', label: 'ETF 적립식 계산기',   dot: 'orange' },
  { id: 'retirement',  icon: '🌴', label: '은퇴 가능 계산기',    dot: 'purple' },
  { id: 'billion',     icon: '🎯', label: '10억까지 얼마나',      dot: 'blue' },
];

export function Sidebar({ active, onNavigate }) {
  return (
    <aside className="sb scroll">
      <div className="sb-brand" style={{ padding: '0 4px 4px' }}>
        <img src="/lockup-horizontal-kr-white.svg" alt="모았다" style={{ height: 36, width: 'auto' }} />
      </div>

      <div className="sb-list" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {MENU_ITEMS.map(({ id, icon, label, dot }) => (
          <div
            key={id}
            className={`sb-row ${active === id ? 'active' : ''}`}
            onClick={() => onNavigate?.(id)}
          >
            <span className={`dot ${dot}`} style={{ width: 28, height: 28, fontSize: 14 }}>{icon}</span>
            <span style={{ flex: 1 }}>{label}</span>
          </div>
        ))}
      </div>

      <div className="spacer"></div>

      <div className="sb-row" style={{ color: 'var(--text-3)' }}>
        <span style={{ fontSize: 14 }}>⚙</span>
        <span>설정</span>
      </div>
    </aside>
  );
}

export function AreaChart({ width = 720, height = 220, accent = 'var(--purple)' }) {
  const pts = 30;
  const data = useMemo(() => {
    const arr = []; let v = 0.18;
    for (let i = 0; i < pts; i++) {
      v += 0.022 + Math.sin(i * 0.45) * 0.008;
      arr.push(v);
    }
    return arr;
  }, []);
  const max = Math.max(...data) * 1.15;
  const x = (i) => (i / (pts - 1)) * (width - 40) + 20;
  const y = (v) => height - 30 - (v / max) * (height - 60);
  const line = data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const area = `${line} L ${x(pts - 1)} ${height - 30} L ${x(0)} ${height - 30} Z`;
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a594f9" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#a594f9" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((p, i) => (
        <line key={i} x1="20" x2={width - 20}
          y1={30 + (height - 60) * p} y2={30 + (height - 60) * p}
          stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      ))}
      <path d={area} fill="url(#ag)" />
      <path d={line} stroke={accent} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x(0)} cy={y(data[0])} r="6" fill="#fff" stroke={accent} strokeWidth="2.5" />
      <line x1={x(16)} x2={x(16)} y1="20" y2={height - 30}
        stroke="rgba(255,255,255,0.18)" strokeDasharray="3 4" />
      <circle cx={x(16)} cy={y(data[16])} r="6" fill={accent} stroke="#fff" strokeWidth="2" />
      <text x={x(16)} y="16" fontSize="11" textAnchor="middle"
        fill="rgba(255,255,255,0.75)" fontFamily="Inter">50세 · 14.8억</text>
      <circle cx={x(pts - 1)} cy={y(data[pts - 1])} r="6" fill="var(--orange)" stroke="#fff" strokeWidth="2" />
      {[0, 8, 16, 24, 29].map(i => (
        <text key={i} x={x(i)} y={height - 10} fontSize="11" textAnchor="middle"
          fill="rgba(255,255,255,0.55)" fontFamily="Inter">{2026 + i}</text>
      ))}
    </svg>
  );
}

export function MiniArea({ width = 200, height = 60, accent = 'var(--purple)' }) {
  const pts = 16;
  const data = useMemo(() => Array.from({ length: pts }, (_, i) => 0.2 + i * 0.04 + Math.sin(i * 0.7) * 0.03), []);
  const max = Math.max(...data) * 1.1;
  const x = (i) => (i / (pts - 1)) * width;
  const y = (v) => height - (v / max) * height;
  const line = data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const area = `${line} L ${width} ${height} L 0 ${height} Z`;
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <path d={area} fill={accent} opacity="0.18" />
      <path d={line} stroke={accent} strokeWidth="2" fill="none" />
    </svg>
  );
}

export function DonutBreakdown({ size = 140, parts }) {
  let acc = 0;
  const total = parts.reduce((s, p) => s + p.v, 0);
  const r = size / 2 - 14;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="rgba(255,255,255,0.08)" strokeWidth="14" />
      {parts.map((p, i) => {
        const frac = p.v / total;
        const dash = `${frac * c} ${c}`;
        const off = -acc * c;
        acc += frac;
        return (
          <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={p.color} strokeWidth="14"
            strokeDasharray={dash} strokeDashoffset={off}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            strokeLinecap="butt" />
        );
      })}
    </svg>
  );
}
