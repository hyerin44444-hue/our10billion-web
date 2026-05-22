import { useState, useMemo } from 'react';
import { KakaoShare, CopyLinkBtn } from '../components/Shared';

// ── 계산 ──────────────────────────────────────────────────────
function calculate({ currentAssets, monthly, rate, target, currentAge }) {
  const r = rate / 100 / 12;

  if (currentAssets >= target) {
    return { already: true, months: 0, years: 0, remainMonths: 0, yearly: [], achieveAge: currentAge };
  }

  let portfolio = currentAssets;
  let months = 0;
  const maxMonths = 720; // 60년
  const yearly = [{ year: 0, portfolio, age: currentAge }];

  while (portfolio < target && months < maxMonths) {
    portfolio = r > 0
      ? portfolio * (1 + r) + monthly
      : portfolio + monthly;
    months++;
    if (months % 12 === 0) {
      yearly.push({ year: months / 12, portfolio, age: currentAge + months / 12 });
    }
  }

  if (portfolio < target) {
    return { impossible: true, yearly, months: -1 };
  }

  const years = Math.floor(months / 12);
  const remainMonths = months % 12;
  const achieveAge = currentAge + months / 12;

  // 중간 마일스톤 (25%, 50%, 75%)
  const milestones = [0.25, 0.5, 0.75].map(pct => {
    const t = target * pct;
    let p2 = currentAssets, m2 = 0;
    while (p2 < t && m2 < months) {
      p2 = r > 0 ? p2 * (1 + r) + monthly : p2 + monthly;
      m2++;
    }
    return { pct, months: m2, years: Math.floor(m2 / 12), age: currentAge + m2 / 12, value: t };
  });

  return { months, years, remainMonths, yearly, achieveAge, milestones };
}

// ── 포맷 ──────────────────────────────────────────────────────
function fmt(wan) {
  if (wan >= 10000) {
    const eok = Math.floor(wan / 10000);
    const rest = Math.round(wan % 10000);
    return rest > 0 ? `${eok}억 ${rest.toLocaleString()}만` : `${eok}억`;
  }
  return `${Math.round(wan).toLocaleString()}만`;
}

// ── 슬라이더 카드 ─────────────────────────────────────────────
function SliderCard({ label, value, unit, min, max, step, onChange, display, accent }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="k">{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
        <span className="num" style={{ fontSize: 28, color: accent ? 'var(--coral)' : 'var(--text)' }}>
          {display ?? value.toLocaleString()}
        </span>
        <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--coral)', cursor: 'pointer' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)' }}>
        <span>{typeof min === 'number' ? min.toLocaleString() : min}{unit}</span>
        <span>{typeof max === 'number' ? max.toLocaleString() : max}{unit}</span>
      </div>
    </div>
  );
}

// ── 성장 차트 ─────────────────────────────────────────────────
function GrowthChart({ yearly, target }) {
  if (yearly.length < 2) return null;
  const W = 820, H = 220;
  const maxV = Math.max(target * 1.05, ...yearly.map(d => d.portfolio));
  const x = (i) => (i / (yearly.length - 1)) * (W - 60) + 30;
  const y = (v) => H - 30 - (v / maxV) * (H - 50);

  const path = yearly.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(d.portfolio).toFixed(1)}`).join(' ');
  const area = `${path} L ${x(yearly.length - 1)} ${H - 30} L ${x(0)} ${H - 30} Z`;
  const targetY = y(target);

  const labelIdxs = [0, Math.floor(yearly.length / 4), Math.floor(yearly.length / 2),
    Math.floor((yearly.length * 3) / 4), yearly.length - 1];

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="billion-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef6f5b" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ef6f5b" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((p, i) => (
        <line key={i} x1="30" x2={W - 30}
          y1={30 + (H - 60) * p} y2={30 + (H - 60) * p}
          stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      ))}
      {/* 목표 라인 */}
      {targetY > 10 && targetY < H - 30 && (
        <>
          <line x1="30" x2={W - 30} y1={targetY} y2={targetY}
            stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeDasharray="6 4" />
          <text x={W - 28} y={targetY - 4} fontSize="10" textAnchor="end"
            fill="rgba(255,255,255,0.6)" fontFamily="Inter">목표 {fmt(target)}원</text>
        </>
      )}
      <path d={area} fill="url(#billion-g)" />
      <path d={path} stroke="#ef6f5b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx={x(yearly.length - 1)} cy={y(yearly[yearly.length - 1].portfolio)} r="7"
        fill="#ef6f5b" stroke="#fff" strokeWidth="2.5" />
      {labelIdxs.map(i => (
        <text key={i} x={x(i)} y={H - 10} fontSize="11" textAnchor="middle"
          fill="rgba(255,255,255,0.4)" fontFamily="Inter">{yearly[i]?.year ?? 0}년</text>
      ))}
    </svg>
  );
}

// ── 목표 프리셋 ──────────────────────────────────────────────
const TARGETS = [
  { label: '1억',   value: 10000 },
  { label: '3억',   value: 30000 },
  { label: '5억',   value: 50000 },
  { label: '10억',  value: 100000 },
  { label: '20억',  value: 200000 },
  { label: '50억',  value: 500000 },
];

// ── URL 파라미터 파싱 ─────────────────────────────────────────
function getInitial() {
  const p = new URLSearchParams(window.location.search);
  return {
    currentAssets: Number(p.get('ba')) || 3000,
    monthly:       Number(p.get('bm')) || 200,
    rate:          Number(p.get('br')) || 7,
    target:        Number(p.get('bt')) || 100000,
    currentAge:    Number(p.get('bag')) || 35,
  };
}

// ── 메인 ─────────────────────────────────────────────────────
export default function BillionCalculator() {
  const init = useMemo(getInitial, []);
  const [currentAssets, setCurrentAssets] = useState(init.currentAssets);
  const [monthly,       setMonthly]       = useState(init.monthly);
  const [rate,          setRate]          = useState(init.rate);
  const [target,        setTarget]        = useState(init.target);
  const [currentAge,    setCurrentAge]    = useState(init.currentAge);

  // 값 바뀔 때마다 URL 동기화
  const sync = (key, val) => {
    const sp = new URLSearchParams(window.location.search);
    sp.set('screen', 'billion');
    sp.set(key, val);
    window.history.replaceState(null, '', `?${sp}`);
  };

  const update = (setter, key) => (val) => { setter(val); sync(key, val); };

  const result = useMemo(() =>
    calculate({ currentAssets, monthly, rate, target, currentAge }),
    [currentAssets, monthly, rate, target, currentAge]
  );

  const progress = Math.min((currentAssets / target) * 100, 100);
  const achieveYear = new Date().getFullYear() + (result.years ?? 0);

  return (
    <>
      <div className="topbar">
        <div className="left">
          <div>
            <div className="title">10억까지 얼마나</div>
            <div className="sub">목표 자산까지 몇 년이 걸릴까요?</div>
          </div>
        </div>
        <div className="right">
          <CopyLinkBtn />
          <KakaoShare
            title={!result.already && !result.impossible ? `${fmt(target)}원, ${result.years}년 후 달성 가능!` : `목표 자산 시뮬레이터`}
            description={!result.already && !result.impossible ? `월 ${fmt(monthly)}원 저축으로 ${Math.floor(result.achieveAge ?? 0)}세에 목표 달성 · 모았다 시뮬레이터` : `모았다 시뮬레이터`}
          />
          {/* 목표 프리셋 */}
          <div className="seg">
            {TARGETS.map(t => (
              <button key={t.value}
                className={target === t.value ? 'on' : ''}
                onClick={() => update(setTarget, 'bt')(t.value)}
              >{t.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* 입력 슬라이더 */}
      <div className="grid-4">
        <SliderCard label="현재 나이"    value={currentAge}    unit="세"   min={20}  max={60}    step={1}   onChange={update(setCurrentAge, 'bag')} />
        <SliderCard label="현재 자산"    value={currentAssets} unit="만원" min={0}   max={50000} step={500} onChange={update(setCurrentAssets, 'ba')} display={fmt(currentAssets)} />
        <SliderCard label="월 저축액"    value={monthly}       unit="만원" min={10}  max={1000}  step={10}  onChange={update(setMonthly, 'bm')} />
        <SliderCard label="기대 수익률"  value={rate}          unit="%"    min={0}   max={20}    step={0.5} onChange={update(setRate, 'br')} display={rate.toFixed(1)} />
      </div>

      {/* 진행률 바 */}
      <div className="card dim" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <span className="k">현재 진행률</span>
            <span style={{ marginLeft: 10, fontWeight: 700, fontSize: 16, color: 'var(--coral)' }}>{progress.toFixed(1)}%</span>
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-2)' }}>
            {fmt(currentAssets)}원 <span style={{ color: 'var(--text-3)' }}>/ {fmt(target)}원</span>
          </div>
        </div>
        <div style={{ height: 12, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 999,
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #ef6f5b, #f4b876)',
            transition: 'width 0.4s ease',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12, color: 'var(--text-3)' }}>
          <span>0원</span>
          <span>{fmt(target / 2)}원</span>
          <span>{fmt(target)}원</span>
        </div>
      </div>

      {/* 결과 히어로 */}
      <div className="card hero">
        {result.already ? (
          <div>
            <div className="k-light">목표 달성!</div>
            <div className="num" style={{ fontSize: 52, marginTop: 8 }}>이미 달성 🎉</div>
            <div style={{ marginTop: 10 }}>
              <span className="chip light">현재 자산이 목표를 초과했어요</span>
            </div>
          </div>
        ) : result.impossible ? (
          <div>
            <div className="k-light">계산 불가</div>
            <div className="num" style={{ fontSize: 40, marginTop: 8 }}>수익률 또는 저축액을 높여주세요</div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="k-light">목표 {fmt(target)}원 달성까지</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 8 }}>
                <span className="num" style={{ fontSize: 56, lineHeight: 1.05 }}>{result.years}</span>
                <span style={{ fontSize: 24, color: 'var(--on-light-2)', fontWeight: 600 }}>년</span>
                {result.remainMonths > 0 && (
                  <>
                    <span className="num" style={{ fontSize: 40, lineHeight: 1.05 }}>{result.remainMonths}</span>
                    <span style={{ fontSize: 20, color: 'var(--on-light-2)', fontWeight: 600 }}>개월</span>
                  </>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                <span className="chip light">🗓 {achieveYear}년 달성</span>
                <span className="chip light">🎂 만 {Math.floor(result.achieveAge ?? 0)}세</span>
                <span className="chip light">총 {result.months}개월</span>
              </div>
            </div>

            {/* 카운트다운 원형 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 110, height: 110, borderRadius: '50%',
                background: 'rgba(0,0,0,0.12)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                border: '3px solid rgba(239,111,91,0.5)',
              }}>
                <span style={{ fontSize: 11, color: 'var(--on-light-3)', fontWeight: 600, letterSpacing: '0.05em' }}>D-DAY</span>
                <span className="num" style={{ fontSize: 28, color: '#ef6f5b', lineHeight: 1.1 }}>
                  -{(result.months ?? 0)}
                </span>
                <span style={{ fontSize: 11, color: 'var(--on-light-3)' }}>개월</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 스탯 */}
      {!result.already && !result.impossible && (
        <div className="grid-4">
          {[
            { label: '달성 연도', value: `${achieveYear}년`, sub: `지금으로부터 ${result.years}년 후` },
            { label: '달성 시 나이', value: `${Math.floor(result.achieveAge ?? 0)}세`, sub: `현재 ${currentAge}세 기준` },
            { label: '총 납입 원금', value: fmt(currentAssets + monthly * (result.months ?? 0)) + '원', sub: `월 ${monthly.toLocaleString()}만 × ${result.months}개월` },
            { label: '복리 수익', value: fmt(target - (currentAssets + monthly * (result.months ?? 0))) + '원', sub: `연 ${rate}% 복리 효과`, color: 'var(--coral)' },
          ].map(({ label, value, sub, color }, i) => (
            <div key={i} className="card">
              <div className="k">{label}</div>
              <div className="num" style={{ fontSize: 20, marginTop: 8, color: color ?? 'var(--text)' }}>{value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>{sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* 마일스톤 */}
      {result.milestones && (
        <div className="card">
          <div className="k" style={{ marginBottom: 14 }}>중간 마일스톤</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {result.milestones.map((m, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '12px 0', borderBottom: i < 2 ? '1px solid var(--line)' : 'none',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  background: i === 0 ? 'var(--pink)' : i === 1 ? 'var(--orange)' : 'var(--coral)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, color: '#fff',
                }}>{m.pct * 100}%</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{fmt(m.value)}원 달성</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
                    {m.years}년 후 · {Math.floor(m.age)}세 · {achieveYear - (result.years - m.years)}년
                  </div>
                </div>
                <div style={{
                  height: 6, width: 100, borderRadius: 999,
                  background: 'rgba(255,255,255,0.08)', overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', borderRadius: 999,
                    width: `${m.pct * 100}%`,
                    background: i === 0 ? 'var(--pink)' : i === 1 ? 'var(--orange)' : 'var(--coral)',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 차트 */}
      {result.yearly && result.yearly.length > 1 && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div className="k">자산 성장 곡선</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>
                {fmt(currentAssets)}원 → {fmt(target)}원
              </div>
            </div>
          </div>
          <GrowthChart yearly={result.yearly} target={target} />
        </div>
      )}

      {/* 공유 */}
      {!result.impossible && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, paddingBottom: 8 }}>
          <CopyLinkBtn />
          <KakaoShare
            title={`${fmt(target)}원, ${result.years}년 후 달성 가능!`}
            description={`월 ${fmt(monthly)}원 저축으로 ${Math.floor(result.achieveAge)}세에 목표 달성 · 모았다 시뮬레이터`}
          />
        </div>
      )}
    </>
  );
}
