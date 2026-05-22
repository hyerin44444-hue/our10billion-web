import { useState, useMemo } from 'react';

// ── 2026 기준 중위소득 (만원/월) ─────────────────────────────
const MEDIAN_INCOME = {
  1: 249.4,
  2: 412.7,
  3: 529.0,
  4: 642.4,
  5: 749.7,
  6: 852.2,
};

// ── 소득세 계산 ───────────────────────────────────────────────
function calcIncomeTax(annual, dependents, children) {
  // 근로소득공제
  let deduction;
  const a = annual * 10000;
  if (a <= 5_000_000)        deduction = a * 0.70;
  else if (a <= 15_000_000)  deduction = 3_500_000 + (a - 5_000_000) * 0.40;
  else if (a <= 45_000_000)  deduction = 7_500_000 + (a - 15_000_000) * 0.15;
  else if (a <= 100_000_000) deduction = 12_000_000 + (a - 45_000_000) * 0.05;
  else                       deduction = 14_750_000 + (a - 100_000_000) * 0.02;
  deduction = Math.min(deduction, 20_000_000);

  // 인적공제 (본인 포함 부양가족 × 150만, 자녀세액공제는 별도)
  const personalDeduction = dependents * 1_500_000;

  const taxable = Math.max(0, a - deduction - personalDeduction);

  // 세율
  let tax;
  if (taxable <= 14_000_000)       tax = taxable * 0.06;
  else if (taxable <= 50_000_000)  tax = 840_000 + (taxable - 14_000_000) * 0.15;
  else if (taxable <= 88_000_000)  tax = 6_240_000 + (taxable - 50_000_000) * 0.24;
  else if (taxable <= 150_000_000) tax = 15_360_000 + (taxable - 88_000_000) * 0.35;
  else if (taxable <= 300_000_000) tax = 37_060_000 + (taxable - 150_000_000) * 0.38;
  else if (taxable <= 500_000_000) tax = 94_060_000 + (taxable - 300_000_000) * 0.40;
  else                             tax = 174_060_000 + (taxable - 500_000_000) * 0.42;

  // 근로소득세액공제 한도
  let creditLimit;
  if (a <= 33_000_000)       creditLimit = 740_000;
  else if (a <= 70_000_000)  creditLimit = Math.max(660_000, 740_000 - (a - 33_000_000) * 0.008);
  else                       creditLimit = Math.max(500_000, 660_000 - (a - 70_000_000) * 0.5);

  const credit = Math.min(tax <= 1_300_000 ? tax * 0.55 : 715_000 + (tax - 1_300_000) * 0.3, creditLimit);

  // 자녀세액공제
  const childCredit = children >= 1 ? (children === 1 ? 150_000 : children === 2 ? 350_000 : 350_000 + (children - 2) * 300_000) : 0;

  return Math.max(0, tax - credit - childCredit);
}

// ── 실수령액 계산 ─────────────────────────────────────────────
function calculate(annualWan, dependents, children) {
  const monthly = annualWan / 12; // 만원

  // 국민연금 4.5% (상한 617만원)
  const pensionBase = Math.min(monthly, 617);
  const pension = pensionBase * 0.045;

  // 건강보험 3.545%
  const health = monthly * 0.03545;

  // 장기요양 (건강보험료 × 12.95%)
  const lts = health * 0.1295;

  // 고용보험 0.9%
  const employment = monthly * 0.009;

  const insurance = pension + health + lts + employment;

  // 소득세·지방소득세
  const annualTax = calcIncomeTax(annualWan, dependents, children) / 10000; // 만원
  const monthlyTax = annualTax / 12;
  const localTax = monthlyTax * 0.1;

  const totalDeduction = insurance + monthlyTax + localTax;
  const netMonthly = monthly - totalDeduction;

  return {
    grossMonthly: monthly,
    pension, health, lts, employment,
    incomeTax: monthlyTax,
    localTax,
    totalDeduction,
    netMonthly,
    netAnnual: netMonthly * 12,
    netRate: (netMonthly / monthly) * 100,
  };
}

// ── 포맷 ──────────────────────────────────────────────────────
function fmt(wan) {
  if (Math.abs(wan) >= 10000) {
    const eok = Math.floor(Math.abs(wan) / 10000);
    const rest = Math.round(Math.abs(wan) % 10000);
    const sign = wan < 0 ? '-' : '';
    return rest > 0 ? `${sign}${eok}억 ${rest.toLocaleString()}만원` : `${sign}${eok}억원`;
  }
  return `${wan < 0 ? '-' : ''}${Math.abs(wan).toFixed(1)}만원`;
}
function fmtM(wan) { return wan.toFixed(1) + '만원'; }

// ── 공제 항목 행 ──────────────────────────────────────────────
function DeductRow({ label, value, total, color, sub }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '120px 80px 1fr 60px', gap: 10, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
      <span style={{ fontSize: 14 }}>{label}</span>
      <span className="num" style={{ fontSize: 14, textAlign: 'right' }}>{fmtM(value)}</span>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min(pct * 3, 100)}%`, background: color, borderRadius: 999 }} />
      </div>
      <span style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'right' }}>{sub}</span>
    </div>
  );
}

// ── 중위소득 게이지 ───────────────────────────────────────────
function MedianGauge({ netMonthly, household }) {
  const median = MEDIAN_INCOME[household];
  const ratio = (netMonthly / median) * 100;
  const clamped = Math.min(ratio, 250);
  const markers = [50, 100, 150, 200];

  let level, color, msg;
  if (ratio < 50)       { level = '중위소득 50% 미만'; color = 'var(--pink)';   msg = '기초생활수급 경계'; }
  else if (ratio < 100) { level = '중위소득 50~100%';  color = 'var(--orange)'; msg = '차상위계층 구간'; }
  else if (ratio < 150) { level = '중위소득 100~150%'; color = 'var(--green)';  msg = '중산층 구간'; }
  else if (ratio < 200) { level = '중위소득 150~200%'; color = 'var(--blue)';   msg = '상위 중산층'; }
  else                  { level = '중위소득 200% 이상'; color = 'var(--purple)'; msg = '고소득 구간'; }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <div className="k">중위소득 대비</div>
          <div style={{ marginTop: 4, fontSize: 12, color: 'var(--text-3)' }}>{household}인 가구 기준 · 중위소득 {fmtM(median)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className="num" style={{ fontSize: 36, color }}>{ratio.toFixed(1)}</span>
          <span style={{ fontSize: 16, color: 'var(--text-3)' }}>%</span>
        </div>
      </div>

      {/* 게이지 */}
      <div style={{ position: 'relative', height: 12, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'visible' }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, bottom: 0,
          width: `${(clamped / 250) * 100}%`,
          background: `linear-gradient(90deg, var(--pink), ${color})`,
          borderRadius: 999, transition: 'width 0.4s ease',
          minWidth: 8,
        }} />
        {markers.map(m => (
          <div key={m} style={{
            position: 'absolute', top: -4, bottom: -4,
            left: `${(m / 250) * 100}%`,
            width: 2, background: 'rgba(255,255,255,0.2)',
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)' }}>
        {markers.map(m => <span key={m}>{m}%</span>)}
      </div>

      <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color }}>{level}</span>
        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{msg}</span>
      </div>
    </div>
  );
}

// ── 메인 ─────────────────────────────────────────────────────
export default function SalaryCalculator() {
  const [annual, setAnnual] = useState(4000);       // 만원
  const [household, setHousehold] = useState(1);    // 가구원 수
  const [dependents, setDependents] = useState(1);  // 부양가족 (본인 포함)
  const [children, setChildren] = useState(0);      // 자녀 수
  const [rawAnnual, setRawAnnual] = useState('');
  const [annualFocused, setAnnualFocused] = useState(false);

  const r = useMemo(() => calculate(annual, dependents, children), [annual, dependents, children]);

  return (
    <>
      <div className="topbar">
        <div className="left">
          <div>
            <div className="title">연봉 실수령액 계산기</div>
            <div className="sub">2026년 기준 · 4대보험 + 소득세 공제 후 실수령액</div>
          </div>
        </div>
      </div>

      {/* 입력 */}
      <div className="grid-2" style={{ gridTemplateColumns: '1.6fr 1fr' }}>
        {/* 연봉 입력 */}
        <div className="card">
          <div className="k" style={{ marginBottom: 10 }}>연봉 (세전)</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, borderBottom: '2px solid var(--coral)', paddingBottom: 6, marginBottom: 14 }}>
            <input
              type="text"
              value={annualFocused ? rawAnnual : annual.toLocaleString()}
              onFocus={() => { setRawAnnual(String(annual)); setAnnualFocused(true); }}
              onChange={e => setRawAnnual(e.target.value.replace(/[^0-9]/g, ''))}
              onBlur={() => {
                const n = parseInt(rawAnnual, 10);
                if (!isNaN(n) && n > 0) setAnnual(Math.min(n, 100000));
                setAnnualFocused(false);
              }}
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none',
                color: 'var(--text)', fontFamily: 'inherit', fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em' }}
            />
            <span style={{ fontSize: 16, color: 'var(--text-3)' }}>만원</span>
          </div>
          <input type="range" min={1000} max={30000} step={100} value={Math.min(annual, 30000)}
            onChange={e => setAnnual(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--coral)', cursor: 'pointer', marginBottom: 6 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)' }}>
            <span>1,000만원</span><span>3억원</span>
          </div>
        </div>

        {/* 가구 설정 */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div className="k" style={{ marginBottom: 8 }}>가구원 수 (중위소득 비교 기준)</div>
            <div className="seg" style={{ width: '100%', justifyContent: 'stretch' }}>
              {[1,2,3,4,5,6].map(n => (
                <button key={n} className={household === n ? 'on' : ''} style={{ flex: 1 }}
                  onClick={() => setHousehold(n)}>{n}인</button>
              ))}
            </div>
          </div>
          <div>
            <div className="k" style={{ marginBottom: 8 }}>부양가족 수 (본인 포함, 소득세 공제)</div>
            <div className="seg">
              {[1,2,3,4,5].map(n => (
                <button key={n} className={dependents === n ? 'on' : ''}
                  onClick={() => setDependents(n)}>{n}명</button>
              ))}
            </div>
          </div>
          <div>
            <div className="k" style={{ marginBottom: 8 }}>자녀 수 (세액공제)</div>
            <div className="seg">
              {[0,1,2,3].map(n => (
                <button key={n} className={children === n ? 'on' : ''}
                  onClick={() => setChildren(n)}>{n}명</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 실수령액 히어로 */}
      <div className="card hero">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="k-light">월 실수령액</div>
            <div className="num" style={{ fontSize: 52, lineHeight: 1.1, marginTop: 8 }}>
              {r.netMonthly.toFixed(1)}
              <span style={{ fontSize: 22, fontWeight: 600, color: 'var(--on-light-2)', marginLeft: 4 }}>만원</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              <span className="chip light">연 {fmt(r.netAnnual)} 실수령</span>
              <span className="chip light">실수령률 {r.netRate.toFixed(1)}%</span>
              <span className="chip light">월 공제 {fmtM(r.totalDeduction)}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="k-light">세전 월급</div>
            <div className="num" style={{ fontSize: 28, marginTop: 6, color: 'var(--on-light-2)' }}>{fmtM(r.grossMonthly)}</div>
            <div style={{ marginTop: 8, height: 8, width: 160, background: 'rgba(0,0,0,0.12)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${r.netRate}%`, background: 'rgba(30,120,60,0.5)', borderRadius: 999 }} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--on-light-3)', marginTop: 4 }}>실수령 / 세전</div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* 공제 상세 */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div className="k">월 공제 내역</div>
            <span className="num" style={{ fontSize: 16 }}>총 {fmtM(r.totalDeduction)}</span>
          </div>

          <DeductRow label="국민연금" value={r.pension}    total={r.grossMonthly} color="var(--purple)" sub="4.50%" />
          <DeductRow label="건강보험" value={r.health}     total={r.grossMonthly} color="var(--blue)"   sub="3.545%" />
          <DeductRow label="장기요양" value={r.lts}        total={r.grossMonthly} color="var(--blue)"   sub="건강보험×12.95%" />
          <DeductRow label="고용보험" value={r.employment} total={r.grossMonthly} color="var(--green)"  sub="0.90%" />
          <DeductRow label="소득세"   value={r.incomeTax}  total={r.grossMonthly} color="var(--orange)" sub="근로소득세" />
          <DeductRow label="지방소득세" value={r.localTax} total={r.grossMonthly} color="var(--orange)" sub="소득세×10%" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line-2)' }}>
            <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.04)', borderRadius: 12 }}>
              <div className="k">4대보험 합계</div>
              <div className="num" style={{ fontSize: 18, marginTop: 4 }}>{fmtM(r.pension + r.health + r.lts + r.employment)}</div>
            </div>
            <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.04)', borderRadius: 12 }}>
              <div className="k">세금 합계</div>
              <div className="num" style={{ fontSize: 18, marginTop: 4 }}>{fmtM(r.incomeTax + r.localTax)}</div>
            </div>
          </div>
        </div>

        {/* 중위소득 비교 */}
        <div className="card">
          <MedianGauge netMonthly={r.netMonthly} household={household} />

          <div style={{ marginTop: 16, display: 'grid', gap: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 80px 80px', gap: 8,
              fontSize: 11, color: 'var(--text-3)', padding: '4px 0', borderBottom: '1px solid var(--line)' }}>
              <span>가구</span><span></span><span style={{ textAlign: 'right' }}>중위소득</span><span style={{ textAlign: 'right' }}>비율</span>
            </div>
            {Object.entries(MEDIAN_INCOME).map(([n, m]) => {
              const r2 = (r.netMonthly / m) * 100;
              const isMe = Number(n) === household;
              return (
                <div key={n} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 80px 80px', gap: 8,
                  alignItems: 'center', padding: '6px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  background: isMe ? 'rgba(255,255,255,0.05)' : 'transparent',
                  borderRadius: isMe ? 8 : 0, padding: isMe ? '6px 8px' : '6px 0' }}>
                  <span style={{ fontSize: 13, fontWeight: isMe ? 700 : 400 }}>{n}인 {isMe ? '←' : ''}</span>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(r2 / 2, 100)}%`,
                      background: r2 >= 100 ? 'var(--green)' : 'var(--orange)', borderRadius: 999 }} />
                  </div>
                  <span className="num" style={{ fontSize: 12, textAlign: 'right', color: 'var(--text-3)' }}>{fmtM(m)}</span>
                  <span className="num" style={{ fontSize: 13, textAlign: 'right',
                    color: r2 >= 100 ? 'var(--green)' : 'var(--orange)', fontWeight: isMe ? 700 : 400 }}>{r2.toFixed(0)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 연간 요약 */}
      <div className="grid-4">
        {[
          { label: '연 실수령액',  value: fmt(r.netAnnual),               sub: `월 ${fmtM(r.netMonthly)}`,      color: 'var(--green)' },
          { label: '연 4대보험',   value: fmtM((r.pension+r.health+r.lts+r.employment)*12), sub: '국민연금+건강+장기요양+고용', color: 'var(--text)' },
          { label: '연 세금',      value: fmtM((r.incomeTax+r.localTax)*12), sub: '소득세+지방소득세',             color: 'var(--text)' },
          { label: '실수령률',     value: r.netRate.toFixed(1) + '%',      sub: `공제율 ${(100-r.netRate).toFixed(1)}%`, color: 'var(--coral)' },
        ].map(({ label, value, sub, color }, i) => (
          <div key={i} className="card">
            <div className="k">{label}</div>
            <div className="num" style={{ fontSize: 20, marginTop: 8, color }}>{value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>{sub}</div>
          </div>
        ))}
      </div>

      <div className="card dim" style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>
        ※ 2026년 기준 추정치 · 국민연금 4.5% (상한 617만원) · 건강보험 3.545% · 장기요양 12.95% · 고용보험 0.9% · 근로소득공제 및 인적공제 반영 · 비과세 수당 미반영 · 실제 급여명세서와 차이가 있을 수 있습니다.
      </div>
    </>
  );
}
