import { useState, useMemo } from 'react';
import { AdFitBanner, KakaoShare, CopyLinkBtn } from '../components/Shared';

function fmt(wan) {
  if (wan >= 10000) {
    const eok = Math.floor(wan / 10000);
    const rest = Math.round(wan % 10000);
    return rest > 0 ? `${eok}억 ${rest.toLocaleString()}만` : `${eok}억`;
  }
  return `${Math.round(wan).toLocaleString()}만`;
}

const METHODS = [
  { id: 'equal',    label: '원리금균등', desc: '매월 동일 금액 납부' },
  { id: 'principal', label: '원금균등',  desc: '원금 고정, 이자 감소' },
  { id: 'bullet',   label: '만기일시',   desc: '매월 이자만, 만기 원금' },
];

function calculate(principal, annualRate, months, method) {
  const r = annualRate / 100 / 12;
  const P = principal * 10000;
  const schedule = [];

  if (method === 'equal') {
    if (r === 0) {
      const monthly = P / months;
      let remaining = P;
      for (let i = 1; i <= months; i++) {
        remaining -= monthly;
        schedule.push({ month: i, payment: monthly, principal: monthly, interest: 0, remaining: Math.max(0, remaining) });
      }
    } else {
      const M = P * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
      let remaining = P;
      for (let i = 1; i <= months; i++) {
        const interest = remaining * r;
        const princ = M - interest;
        remaining -= princ;
        schedule.push({ month: i, payment: M, principal: princ, interest, remaining: Math.max(0, remaining) });
      }
    }
  } else if (method === 'principal') {
    const monthlyPrinc = P / months;
    let remaining = P;
    for (let i = 1; i <= months; i++) {
      const interest = remaining * r;
      const payment = monthlyPrinc + interest;
      remaining -= monthlyPrinc;
      schedule.push({ month: i, payment, principal: monthlyPrinc, interest, remaining: Math.max(0, remaining) });
    }
  } else {
    const monthlyInterest = P * r;
    for (let i = 1; i <= months; i++) {
      const isLast = i === months;
      const payment = isLast ? P + monthlyInterest : monthlyInterest;
      schedule.push({ month: i, payment, principal: isLast ? P : 0, interest: monthlyInterest, remaining: isLast ? 0 : P });
    }
  }

  const totalPayment = schedule.reduce((s, r) => s + r.payment, 0);
  const totalInterest = totalPayment - P;
  const firstPayment = schedule[0]?.payment ?? 0;

  return { schedule, totalPayment, totalInterest, firstPayment, principal: P };
}

function SliderCard({ label, value, unit, min, max, step, onChange, isRate, display: displayProp }) {
  const [raw, setRaw] = useState('');
  const [focused, setFocused] = useState(false);
  const isMoney = unit === '만원';
  const display = focused
    ? raw
    : isRate
      ? value.toFixed(2)
      : isMoney
        ? fmt(value)
        : value.toLocaleString();
  const displayUnit = (!focused && isMoney) ? '' : unit;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="k">{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, borderBottom: '1px solid var(--coral)', paddingBottom: 4 }}>
        <input
          type="text"
          value={display}
          onFocus={() => { setRaw(String(value)); setFocused(true); }}
          onChange={e => setRaw(e.target.value.replace(/[^0-9.]/g, ''))}
          onBlur={() => {
            const n = parseFloat(raw);
            if (!isNaN(n)) onChange(Math.min(Math.max(n, min), max));
            setFocused(false);
          }}
          style={{ flex: 1, minWidth: 0, background: 'none', border: 'none', outline: 'none',
            color: 'var(--text)', fontFamily: 'inherit', fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}
        />
        {displayUnit && <span style={{ fontSize: 13, color: 'var(--text-3)', flexShrink: 0, whiteSpace: 'nowrap' }}>{displayUnit}</span>}
      </div>
      <input type="range" min={min} max={max} step={step} value={Math.min(Math.max(value, min), max)}
        onChange={e => onChange(isRate ? parseFloat(e.target.value) : Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--coral)', cursor: 'pointer' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)' }}>
        <span>{typeof min === 'number' ? (isMoney ? fmt(min) : min.toLocaleString()) : min}{displayUnit || (isMoney ? '' : unit)}</span>
        <span>{typeof max === 'number' ? (isMoney ? fmt(max) : max.toLocaleString()) : max}{displayUnit || (isMoney ? '' : unit)}</span>
      </div>
    </div>
  );
}

function LoanChart({ schedule, months }) {
  if (!schedule.length) return null;
  const W = 820, H = 200;

  // 연도별 집계
  const yearly = [];
  for (let y = 0; y < Math.ceil(months / 12); y++) {
    const slice = schedule.slice(y * 12, (y + 1) * 12);
    yearly.push({
      year: y + 1,
      principal: slice.reduce((s, r) => s + r.principal, 0),
      interest: slice.reduce((s, r) => s + r.interest, 0),
    });
  }

  const maxVal = Math.max(...yearly.map(y => y.principal + y.interest));
  const barW = (W - 60) / yearly.length;
  const yScale = (v) => H - 30 - (v / maxVal) * (H - 50);

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      {yearly.map((y, i) => {
        const x = 30 + i * barW + barW * 0.1;
        const bw = barW * 0.8;
        const totalH = H - 30 - yScale(y.principal + y.interest);
        const intH = H - 30 - yScale(y.interest);
        return (
          <g key={i}>
            <rect x={x} y={yScale(y.principal + y.interest)} width={bw} height={totalH - intH}
              fill="var(--coral)" opacity="0.85" rx="2" />
            <rect x={x} y={yScale(y.interest)} width={bw} height={intH}
              fill="var(--purple)" opacity="0.5" rx="2" />
            {(i === 0 || (i + 1) % Math.ceil(yearly.length / 6) === 0 || i === yearly.length - 1) && (
              <text x={x + bw / 2} y={H - 10} fontSize="10" textAnchor="middle"
                fill="rgba(0,0,0,0.4)" fontFamily="Inter">{y.year}년</text>
            )}
          </g>
        );
      })}
      <line x1="30" x2={W - 30} y1={H - 30} y2={H - 30} stroke="var(--line)" strokeWidth="1" />
    </svg>
  );
}

function getInitial() {
  const p = new URLSearchParams(window.location.search);
  return {
    principal: Number(p.get('lp'))  || 30000,
    rate:      Number(p.get('lr'))  || 4.5,
    years:     Number(p.get('ly'))  || 20,
    method:    p.get('lm') || 'equal',
  };
}

export default function LoanCalculator() {
  const init = useMemo(getInitial, []);
  const [principal, setPrincipal] = useState(init.principal);
  const [rate,      setRate]      = useState(init.rate);
  const [years,     setYears]     = useState(init.years);
  const [method,    setMethod]    = useState(init.method);

  const sync = (key, val) => {
    const sp = new URLSearchParams(window.location.search);
    sp.set('screen', 'loan');
    sp.set(key, val);
    window.history.replaceState(null, '', `?${sp}`);
  };

  const update = (setter, key) => (val) => { setter(val); sync(key, val); };

  const months = years * 12;

  const result = useMemo(() =>
    calculate(principal, rate, months, method),
    [principal, rate, months, method]
  );

  const { schedule, totalPayment, totalInterest, firstPayment } = result;
  const totalPaymentWan = totalPayment / 10000;
  const totalInterestWan = totalInterest / 10000;
  const firstPaymentWan = firstPayment / 10000;
  const interestRatio = totalInterest / totalPayment * 100;

  // 연간 상환 요약
  const yearlyRows = [];
  for (let y = 0; y < Math.ceil(months / 12); y++) {
    const slice = schedule.slice(y * 12, (y + 1) * 12);
    yearlyRows.push({
      year: y + 1,
      totalPayment: slice.reduce((s, r) => s + r.payment, 0),
      principal: slice.reduce((s, r) => s + r.principal, 0),
      interest: slice.reduce((s, r) => s + r.interest, 0),
      remaining: slice[slice.length - 1]?.remaining ?? 0,
    });
  }

  return (
    <>
      <div className="topbar">
        <div className="left">
          <div>
            <div className="title">대출 이자 계산기</div>
            <div className="sub">원리금균등 · 원금균등 · 만기일시 상환 비교</div>
          </div>
        </div>
        <div className="right">
          <CopyLinkBtn />
          <KakaoShare
            title={`대출 ${fmt(principal)}원 · 월 납입 ${fmt(Math.round(firstPaymentWan))}원`}
            description={`연 ${rate}% · ${years}년 · 총이자 ${fmt(Math.round(totalInterestWan))}원 · 모았다 계산기`}
          />
        </div>
      </div>

      {/* 상환 방식 선택 */}
      <div className="card dim" style={{ padding: '14px 18px' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {METHODS.map(m => (
            <button key={m.id} onClick={() => setMethod(m.id)} style={{
              flex: 1, minWidth: 100, padding: '10px 12px', borderRadius: 12, cursor: 'pointer',
              border: method === m.id ? '2px solid var(--coral)' : '1px solid var(--line)',
              background: method === m.id ? 'var(--coral-bg)' : 'var(--surface)',
              textAlign: 'center', transition: 'all 0.15s',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: method === m.id ? 'var(--coral)' : 'var(--text)' }}>{m.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 입력 슬라이더 */}
      <div className="grid-3">
        <SliderCard label="대출 원금" value={principal} unit="만원" min={500} max={200000} step={500} onChange={setPrincipal} />
        <SliderCard label="연 이자율" value={rate} unit="%" min={0.1} max={20} step={0.1} onChange={setRate} isRate />
        <SliderCard label="대출 기간" value={years} unit="년" min={1} max={40} step={1} onChange={setYears} />
      </div>

      <AdFitBanner />

      {/* 결과 히어로 */}
      <div className="card hero">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="k-light">
              {method === 'bullet' ? '매월 이자' : method === 'principal' ? '첫 달 납입금' : '매월 납입금'}
            </div>
            <div className="num retire-hero-value" style={{ lineHeight: 1.1, marginTop: 8 }}>
              {fmt(Math.round(firstPaymentWan))}
              <span className="retire-hero-unit">원/월</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              <span className="chip light">총 상환 {fmt(Math.round(totalPaymentWan))}원</span>
              <span className="chip light" style={{ color: '#c0524a' }}>이자 {fmt(Math.round(totalInterestWan))}원</span>
              <span className="chip light">이자 비율 {interestRatio.toFixed(1)}%</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="k-light">원금 대비 총이자</div>
            <div className="num" style={{ fontSize: 32, lineHeight: 1.1, marginTop: 8, color: '#c0524a' }}>
              +{(totalInterest / result.principal * 100).toFixed(1)}%
            </div>
            <div style={{ marginTop: 6, fontSize: 13, color: 'var(--on-light-2)' }}>
              {years}년 · 연 {rate}%
            </div>
          </div>
        </div>
      </div>

      {/* 스탯 카드 */}
      <div className="grid-4">
        {[
          { label: '대출 원금', value: fmt(principal) + '원', sub: `${years}년 상환`, color: 'var(--text)' },
          { label: '총 이자', value: fmt(Math.round(totalInterestWan)) + '원', sub: `연 ${rate}% 기준`, color: '#c0524a' },
          { label: '총 상환금', value: fmt(Math.round(totalPaymentWan)) + '원', sub: `원금 + 이자`, color: 'var(--text)' },
          { label: '이자/원금 비율', value: `${(totalInterest / result.principal * 100).toFixed(1)}%`, sub: `이자가 원금의 ${(totalInterest / result.principal * 100).toFixed(0)}%`, color: 'var(--coral)' },
        ].map(({ label, value, sub, color }, i) => (
          <div key={i} className="card">
            <div className="k">{label}</div>
            <div className="num" style={{ fontSize: 18, marginTop: 8, color }}>{value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* 연도별 차트 */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div className="k">연도별 상환 내역</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>원금 vs 이자</div>
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--coral)', display: 'inline-block' }} />원금
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 12, height: 12, borderRadius: 2, background: 'var(--purple)', opacity: 0.5, display: 'inline-block' }} />이자
            </span>
          </div>
        </div>
        <LoanChart schedule={schedule} months={months} />
      </div>

      {/* 연도별 상환표 */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px 12px', borderBottom: '1px solid var(--line)' }}>
          <div className="k">연도별 상환 요약</div>
        </div>
        <div style={{ maxHeight: 360, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1 }}>
              <tr style={{ borderBottom: '1px solid var(--line)' }}>
                {['연도', '연간 납입', '원금', '이자', '잔액'].map((h, i) => (
                  <th key={h} style={{
                    padding: '10px 14px', textAlign: i === 0 ? 'left' : 'right',
                    fontSize: 11, fontWeight: 600, color: 'var(--text-3)',
                    letterSpacing: '0.03em', whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {yearlyRows.map((row, i) => (
                <tr key={i} className="salary-tr" style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '9px 14px', fontSize: 13, fontWeight: 500 }}>{row.year}년차</td>
                  <td className="num" style={{ padding: '9px 14px', textAlign: 'right', fontSize: 13 }}>{fmt(Math.round(row.totalPayment / 10000))}</td>
                  <td className="num" style={{ padding: '9px 14px', textAlign: 'right', fontSize: 13, color: 'var(--coral)' }}>{fmt(Math.round(row.principal / 10000))}</td>
                  <td className="num" style={{ padding: '9px 14px', textAlign: 'right', fontSize: 13, color: 'var(--purple)' }}>{fmt(Math.round(row.interest / 10000))}</td>
                  <td className="num" style={{ padding: '9px 14px', textAlign: 'right', fontSize: 13, color: 'var(--text-3)' }}>{fmt(Math.round(row.remaining / 10000))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card dim" style={{ padding: '10px 16px', fontSize: 11, color: 'var(--text-3)', lineHeight: 1.6 }}>
        ※ 본 계산기는 참고용입니다. 실제 대출 조건에 따라 결과가 다를 수 있습니다.
      </div>
    </>
  );
}
