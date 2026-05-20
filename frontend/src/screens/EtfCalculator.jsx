import { useState, useMemo } from 'react';

// ── 계산 로직 ────────────────────────────────────────────────
function calculate({ initial, monthly, rate, years }) {
  const r = rate / 100 / 12;
  const n = years * 12;
  const yearly = [];

  let portfolio = initial;
  for (let m = 0; m <= n; m++) {
    if (m > 0) portfolio = portfolio * (1 + r) + monthly;
    if (m % 12 === 0) {
      yearly.push({ year: m / 12, portfolio, principal: initial + monthly * m });
    }
  }

  const totalPrincipal = initial + monthly * n;
  const finalValue = portfolio;
  const profit = finalValue - totalPrincipal;
  const profitRate = (profit / totalPrincipal) * 100;

  return { yearly, totalPrincipal, finalValue, profit, profitRate };
}

// ── 숫자 포맷 ─────────────────────────────────────────────────
function fmt(wan) {
  if (wan >= 10000) {
    const eok = Math.floor(wan / 10000);
    const rest = Math.round(wan % 10000);
    return rest > 0 ? `${eok}억 ${rest.toLocaleString()}만` : `${eok}억`;
  }
  return `${Math.round(wan).toLocaleString()}만`;
}

function fmtShort(wan) {
  if (wan >= 10000) return `${(wan / 10000).toFixed(1)}억`;
  return `${Math.round(wan).toLocaleString()}만`;
}

// ── 슬라이더 + 직접입력 카드 ─────────────────────────────────
function InputCard({ label, value, unit, min, max, step, onChange, display, editable }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="k">{label}</div>
      {editable ? (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <input
            type="number" min={min} max={max} step={step} value={value || ''}
            onChange={e => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
            style={{
              width: '100%', background: 'transparent', border: 'none',
              borderBottom: '2px solid var(--coral)', outline: 'none',
              color: 'var(--text)', fontFamily: 'inherit',
              fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em',
              padding: '0 0 4px',
            }}
          />
          <span style={{ fontSize: 15, color: 'var(--text-3)', flexShrink: 0 }}>{unit}</span>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span className="num" style={{ fontSize: 32, color: 'var(--text)' }}>{display ?? value.toLocaleString()}</span>
          <span style={{ fontSize: 15, color: 'var(--text-3)' }}>{unit}</span>
        </div>
      )}
      <input
        type="range"
        min={min} max={max} step={step} value={Math.min(value, max)}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--coral)', height: 4, cursor: 'pointer' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)' }}>
        <span>{min.toLocaleString()}{unit}</span>
        <span>{max.toLocaleString()}{unit}</span>
      </div>
    </div>
  );
}

// ── 성장 차트 (SVG) ───────────────────────────────────────────
function GrowthChart({ data }) {
  const W = 820, H = 240;
  const maxV = Math.max(...data.map(d => d.portfolio)) * 1.08;
  const x = (i) => (i / (data.length - 1)) * (W - 60) + 30;
  const y = (v) => H - 36 - (v / maxV) * (H - 60);

  const portfolioPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(d.portfolio).toFixed(1)}`).join(' ');
  const principalPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(d.principal).toFixed(1)}`).join(' ');
  const portfolioArea = `${portfolioPath} L ${x(data.length - 1)} ${H - 36} L ${x(0)} ${H - 36} Z`;

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="coral-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef6f5b" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ef6f5b" stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* 그리드 */}
      {[0.25, 0.5, 0.75].map((p, i) => (
        <line key={i} x1="30" x2={W - 30}
          y1={36 + (H - 72) * p} y2={36 + (H - 72) * p}
          stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      ))}

      {/* 원금 영역 */}
      <path d={`${principalPath} L ${x(data.length - 1)} ${H - 36} L ${x(0)} ${H - 36} Z`}
        fill="rgba(255,255,255,0.05)" />
      <path d={principalPath} stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeDasharray="4 3" fill="none" />

      {/* 평가금액 영역 */}
      <path d={portfolioArea} fill="url(#coral-grad)" />
      <path d={portfolioPath} stroke="#ef6f5b" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* 종료 마커 */}
      <circle cx={x(data.length - 1)} cy={y(data[data.length - 1].portfolio)} r="6"
        fill="#ef6f5b" stroke="#fff" strokeWidth="2" />

      {/* X 레이블 */}
      {data.filter((_, i) => i % Math.ceil(data.length / 6) === 0 || i === data.length - 1).map((d, i) => (
        <text key={i} x={x(data.indexOf(d))} y={H - 10} fontSize="11" textAnchor="middle"
          fill="rgba(255,255,255,0.45)" fontFamily="Inter">{d.year}년</text>
      ))}

      {/* Y 레이블 */}
      {[0.25, 0.5, 0.75, 1].map((p, i) => (
        <text key={i} x="26" y={36 + (H - 72) * (1 - p) + 4} fontSize="10" textAnchor="end"
          fill="rgba(255,255,255,0.35)" fontFamily="Inter">{fmtShort(maxV * p)}</text>
      ))}
    </svg>
  );
}

// ── 연도별 테이블 (상위 몇 개) ────────────────────────────────
function YearlyTable({ data }) {
  const rows = data.filter((_, i) => i > 0 && (i % 5 === 0 || i === data.length - 1));
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr', gap: 8,
        fontSize: 11, color: 'var(--text-3)', padding: '4px 0', borderBottom: '1px solid var(--line)' }}>
        <span>기간</span><span>납입 원금</span><span>평가금액</span><span style={{ color: 'var(--coral)' }}>수익금</span>
      </div>
      {rows.map((d, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr 1fr', gap: 8,
          fontSize: 13, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <span style={{ color: 'var(--text-3)' }}>{d.year}년</span>
          <span className="num">{fmtShort(d.principal)}원</span>
          <span className="num" style={{ fontWeight: 700 }}>{fmtShort(d.portfolio)}원</span>
          <span className="num" style={{ color: 'var(--coral)' }}>+{fmtShort(d.portfolio - d.principal)}원</span>
        </div>
      ))}
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────
export default function EtfCalculator() {
  const [initial, setInitial] = useState(1000);   // 만원
  const [monthly, setMonthly] = useState(100);    // 만원
  const [rate, setRate]       = useState(7);      // %
  const [years, setYears]     = useState(20);     // 년

  const result = useMemo(
    () => calculate({ initial, monthly, rate, years }),
    [initial, monthly, rate, years]
  );

  const { yearly, totalPrincipal, finalValue, profit, profitRate } = result;

  return (
    <>
      {/* 상단 타이틀 */}
      <div className="topbar">
        <div className="left">
          <div>
            <div className="title">ETF 적립식 계산기</div>
            <div className="sub">매달 꾸준히 투자하면 얼마가 될까요?</div>
          </div>
        </div>
        <div className="right"></div>
      </div>

      {/* 입력 카드 4개 */}
      <div className="grid-4">
        <InputCard
          label="월 적립금" unit="만원"
          min={10} max={1000} step={10} value={monthly}
          onChange={setMonthly} editable
        />
        <InputCard
          label="초기 투자금" unit="만원"
          min={0} max={10000} step={100} value={initial}
          onChange={setInitial} editable
        />
        <InputCard
          label="기대 수익률" unit="%" display={`${rate.toFixed(1)}`}
          min={1} max={20} step={0.5} value={rate}
          onChange={setRate}
        />
        <InputCard
          label="투자 기간" unit="년"
          min={1} max={40} step={1} value={years}
          onChange={setYears}
        />
      </div>

      {/* 결과 히어로 카드 */}
      <div className="card hero">
        <div className="hero-inner">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="k-light">{years}년 후 예상 평가금액</div>
            <div className="num" style={{ fontSize: 52, lineHeight: 1.1, marginTop: 8 }}>
              {fmt(finalValue)}
              <span style={{ fontSize: 22, fontWeight: 600, color: 'var(--on-light-2)', marginLeft: 4 }}>원</span>
            </div>
            <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className="chip light">총 납입 {fmt(totalPrincipal)}원</span>
              <span className="chip light" style={{ color: '#ef6f5b', fontWeight: 700 }}>
                수익 +{fmt(profit)}원
              </span>
              <span className="chip light" style={{ color: '#ef6f5b', fontWeight: 700 }}>
                수익률 +{profitRate.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* 원금 vs 수익 비율 바 */}
          <div className="hero-ratio">
            <div className="k-light" style={{ marginBottom: 10 }}>원금 vs 수익</div>
            <div style={{ height: 10, borderRadius: 999, overflow: 'hidden', background: 'rgba(0,0,0,0.10)' }}>
              <div style={{
                height: '100%', borderRadius: 999,
                width: `${(totalPrincipal / finalValue) * 100}%`,
                background: 'rgba(0,0,0,0.20)',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12, color: 'var(--on-light-3)' }}>
              <span>원금 {((totalPrincipal / finalValue) * 100).toFixed(0)}%</span>
              <span style={{ color: '#ef6f5b' }}>수익 {((profit / finalValue) * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 스탯 4개 */}
      <div className="grid-4">
        {[
          { label: '총 납입 원금', value: fmt(totalPrincipal) + '원', sub: `월 ${monthly.toLocaleString()}만 × ${years * 12}개월` },
          { label: '10년 후 예상', value: fmt(yearly[Math.min(10, years)]?.portfolio ?? 0) + '원', sub: '복리 마법이 시작되는 시점' },
          { label: '총 수익금', value: '+' + fmt(profit) + '원', sub: '원금 대비 ' + profitRate.toFixed(1) + '% 수익', coral: true },
          { label: '월 복리 환산', value: (rate / 12).toFixed(3) + '%', sub: `연 ${rate}% → 월 복리` },
        ].map(({ label, value, sub, coral }, i) => (
          <div key={i} className="card">
            <div className="k">{label}</div>
            <div className="num" style={{ fontSize: 22, marginTop: 8, color: coral ? 'var(--coral)' : 'var(--text)' }}>{value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* 차트 */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div className="k">자산 성장 곡선</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>납입 원금 vs 평가금액</div>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 24, height: 2, background: 'rgba(255,255,255,0.3)', display: 'inline-block', borderTop: '2px dashed rgba(255,255,255,0.3)' }}></span>
              납입 원금
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 24, height: 3, background: '#ef6f5b', display: 'inline-block', borderRadius: 2 }}></span>
              평가금액
            </span>
          </div>
        </div>
        <GrowthChart data={yearly} />
      </div>

      {/* 연도별 테이블 */}
      <div className="card">
        <div className="k" style={{ marginBottom: 14 }}>연도별 상세</div>
        <YearlyTable data={yearly} />
      </div>
    </>
  );
}
