import { useMemo, useState } from 'react';

const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY;

function initKakao() {
  if (!window.Kakao || !KAKAO_JS_KEY) return false;
  if (!window.Kakao.isInitialized()) window.Kakao.init(KAKAO_JS_KEY);
  return true;
}

export function KakaoShare({ title, description, imageUrl }) {
  const handleShare = () => {
    if (!initKakao()) {
      alert('카카오 앱 키가 설정되지 않았습니다.');
      return;
    }
    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title,
        description,
        imageUrl: imageUrl ?? `${window.location.origin}/og-image.png?v=2`,
        link: {
          mobileWebUrl: window.location.href,
          webUrl: window.location.href,
        },
      },
      buttons: [{ title: '결과 보기', link: { mobileWebUrl: window.location.href, webUrl: window.location.href } }],
    });
  };

  return (
    <button onClick={handleShare} className="kakao-share-btn" style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '6px 12px', borderRadius: 999,
      background: '#FEE500', color: '#1a1a1a',
      border: 'none', cursor: 'pointer',
      fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
    }}>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 1.5C4.86 1.5 1.5 4.16 1.5 7.44c0 2.1 1.36 3.95 3.42 5.03l-.87 3.18a.3.3 0 0 0 .46.32L8.1 13.4c.3.03.6.04.9.04 4.14 0 7.5-2.66 7.5-5.94C16.5 4.16 13.14 1.5 9 1.5z" fill="#1a1a1a"/>
      </svg>
      카카오톡 공유
    </button>
  );
}

export function CopyLinkBtn() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button onClick={handleCopy} className="kakao-share-btn" style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '6px 12px', borderRadius: 999,
      background: copied ? 'rgba(93,187,122,0.2)' : 'rgba(255,255,255,0.10)',
      color: copied ? 'var(--green)' : 'var(--text)',
      border: '1px solid ' + (copied ? 'var(--green)' : 'rgba(255,255,255,0.15)'),
      cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
      transition: 'all 0.2s',
    }}>
      {copied ? '✓ 복사됨' : '🔗 링크 복사'}
    </button>
  );
}

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
  { id: 'stock',       icon: '📉', label: '주식 물타기 계산기',   dot: 'green' },
  { id: 'salary',      icon: '💵', label: '연봉 실수령액 표', dot: 'yellow' },
  { id: 'median',      icon: '📊', label: '기준 중위소득 표',     dot: 'blue' },
];

export function Sidebar({ active, onNavigate, drawerOpen }) {
  return (
    <aside className={`sb scroll${drawerOpen ? ' drawer-open' : ''}`}>
      {/* 브랜드 헤더 */}
      <div className="sb-brand">
        <img src="/lockup-horizontal-kr.svg" alt="모았다" style={{ height: 32, width: 'auto' }} />
      </div>

      {/* 메뉴 */}
      <div className="sb-list">
        {MENU_ITEMS.map(({ id, icon, label, dot }) => (
          <div
            key={id}
            className={`sb-row ${active === id ? 'active' : ''}`}
            onClick={() => onNavigate?.(id)}
          >
            <span style={{
              width: 32, height: 32, borderRadius: 10, fontSize: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: active === id ? 'var(--purple)' : 'var(--surface-2)',
              flexShrink: 0,
              transition: 'background 0.15s',
            }}>{icon}</span>
            <span style={{ flex: 1 }}>{label}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: '12px 10px 16px', textAlign: 'center', flexShrink: 0 }}>
        <ins className="kakao_ad_area" style={{ display: 'none' }}
          data-ad-unit="DAN-wuDPkWpzN6Lq4cHe"
          data-ad-width="320"
          data-ad-height="100" />
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
