import { useState, useMemo } from 'react';

// ── 2026 기준 중위소득 (만원/월) ─────────────────────────────
const MEDIAN_INCOME = { 1: 249.4, 2: 412.7, 3: 529.0, 4: 642.4, 5: 749.7, 6: 852.2 };

// ── 소득세 계산 ───────────────────────────────────────────────
function calcIncomeTax(annual, dependents, children) {
  const a = annual * 10000;
  let deduction;
  if (a <= 5_000_000)        deduction = a * 0.70;
  else if (a <= 15_000_000)  deduction = 3_500_000 + (a - 5_000_000) * 0.40;
  else if (a <= 45_000_000)  deduction = 7_500_000 + (a - 15_000_000) * 0.15;
  else if (a <= 100_000_000) deduction = 12_000_000 + (a - 45_000_000) * 0.05;
  else                       deduction = 14_750_000 + (a - 100_000_000) * 0.02;
  deduction = Math.min(deduction, 20_000_000);

  const personalDeduction = dependents * 1_500_000;
  const taxable = Math.max(0, a - deduction - personalDeduction);

  let tax;
  if (taxable <= 14_000_000)       tax = taxable * 0.06;
  else if (taxable <= 50_000_000)  tax = 840_000 + (taxable - 14_000_000) * 0.15;
  else if (taxable <= 88_000_000)  tax = 6_240_000 + (taxable - 50_000_000) * 0.24;
  else if (taxable <= 150_000_000) tax = 15_360_000 + (taxable - 88_000_000) * 0.35;
  else if (taxable <= 300_000_000) tax = 37_060_000 + (taxable - 150_000_000) * 0.38;
  else                             tax = 94_060_000 + (taxable - 300_000_000) * 0.40;

  let creditLimit;
  if (a <= 33_000_000)      creditLimit = 740_000;
  else if (a <= 70_000_000) creditLimit = Math.max(660_000, 740_000 - (a - 33_000_000) * 0.008);
  else                      creditLimit = Math.max(500_000, 660_000 - (a - 70_000_000) * 0.5);

  const credit = Math.min(tax <= 1_300_000 ? tax * 0.55 : 715_000 + (tax - 1_300_000) * 0.3, creditLimit);
  const childCredit = children === 1 ? 150_000 : children === 2 ? 350_000 : children >= 3 ? 350_000 + (children - 2) * 300_000 : 0;

  return Math.max(0, tax - credit - childCredit);
}

function calculate(annualWan, dependents, children) {
  const monthly = annualWan / 12;
  const pension = Math.min(monthly, 617) * 0.045;
  const health = monthly * 0.03545;
  const lts = health * 0.1295;
  const employment = monthly * 0.009;
  const insurance = pension + health + lts + employment;
  const annualTax = calcIncomeTax(annualWan, dependents, children) / 10000;
  const monthlyTax = annualTax / 12;
  const localTax = monthlyTax * 0.1;
  const totalDeduction = insurance + monthlyTax + localTax;
  const netMonthly = monthly - totalDeduction;
  return { grossMonthly: monthly, netMonthly, totalDeduction, netRate: (netMonthly / monthly) * 100, pension, health, lts, employment, incomeTax: monthlyTax, localTax };
}

// ── 행 표시 범위 옵션 ─────────────────────────────────────────
const STEP_OPTIONS = [
  { label: '100만원', step: 100 },
  { label: '500만원', step: 500 },
  { label: '1,000만원', step: 1000 },
];

function fmtM(v) { return v.toFixed(1); }

function medianColor(ratio) {
  if (ratio < 80)  return 'var(--pink)';
  if (ratio < 100) return 'var(--orange)';
  if (ratio < 150) return 'var(--green)';
  if (ratio < 200) return 'var(--blue)';
  return 'var(--purple)';
}

export default function SalaryCalculator() {
  const [household,  setHousehold]  = useState(1);
  const [dependents, setDependents] = useState(1);
  const [children,   setChildren]   = useState(0);
  const [step,       setStep]       = useState(500);
  const [selected,   setSelected]   = useState(null); // 클릭한 연봉

  // 표 데이터 생성 (2500 ~ 15000, step 단위)
  const rows = useMemo(() => {
    const list = [];
    for (let w = 2500; w <= 15000; w += step) {
      const r = calculate(w, dependents, children);
      const medianRatio = (r.netMonthly / MEDIAN_INCOME[household]) * 100;
      list.push({ annual: w, ...r, medianRatio });
    }
    return list;
  }, [step, dependents, children, household]);

  const selectedRow = selected != null ? rows.find(r => r.annual === selected) : null;

  return (
    <>
      <div className="topbar">
        <div className="left">
          <div>
            <div className="title">연봉 실수령액 표</div>
            <div className="sub">2026년 기준 · 2,500만원 ~ 1억 5,000만원</div>
          </div>
        </div>
        <div className="right">
          <div className="seg">
            {STEP_OPTIONS.map(o => (
              <button key={o.step} className={step === o.step ? 'on' : ''} onClick={() => setStep(o.step)}>
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 설정 바 */}
      <div className="card dim" style={{ padding: '14px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="k">가구원 수</span>
            <div className="seg">
              {[1,2,3,4,5,6].map(n => (
                <button key={n} className={household === n ? 'on' : ''} onClick={() => setHousehold(n)}>{n}인</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="k">부양가족</span>
            <div className="seg">
              {[1,2,3,4,5].map(n => (
                <button key={n} className={dependents === n ? 'on' : ''} onClick={() => setDependents(n)}>{n}명</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="k">자녀</span>
            <div className="seg">
              {[0,1,2,3].map(n => (
                <button key={n} className={children === n ? 'on' : ''} onClick={() => setChildren(n)}>{n}명</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={selectedRow ? 'grid-2' : ''} style={selectedRow ? { gridTemplateColumns: '1.6fr 1fr', alignItems: 'start' } : {}}>
        {/* 표 */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* 헤더 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '90px 1fr 1fr 1fr 1fr 80px',
            gap: 0, padding: '12px 20px',
            background: 'rgba(255,255,255,0.05)',
            borderBottom: '1px solid var(--line)',
            fontSize: 11, color: 'var(--text-3)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
          }}>
            <span>연봉</span>
            <span style={{ textAlign: 'right' }}>월 실수령액</span>
            <span style={{ textAlign: 'right' }}>연 실수령액</span>
            <span style={{ textAlign: 'right' }}>공제액</span>
            <span style={{ textAlign: 'right' }}>실수령률</span>
            <span style={{ textAlign: 'right' }}>중위소득</span>
          </div>

          {/* 데이터 행 */}
          <div style={{ maxHeight: 600, overflow: 'auto' }}>
            {rows.map((row, i) => {
              const isSelected = selected === row.annual;
              const isMilestone = row.annual % 1000 === 0;
              const mColor = medianColor(row.medianRatio);

              return (
                <div
                  key={row.annual}
                  onClick={() => setSelected(isSelected ? null : row.annual)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '90px 1fr 1fr 1fr 1fr 80px',
                    gap: 0, padding: '11px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: isSelected
                      ? 'rgba(239,111,91,0.12)'
                      : isMilestone ? 'rgba(255,255,255,0.03)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isMilestone ? 'rgba(255,255,255,0.03)' : 'transparent'; }}
                >
                  <span className="num" style={{ fontSize: 13, color: isMilestone ? 'var(--coral)' : 'var(--text-2)', fontWeight: isMilestone ? 700 : 400 }}>
                    {row.annual >= 10000
                      ? `${(row.annual / 10000).toFixed(row.annual % 10000 === 0 ? 0 : 1)}억`
                      : `${row.annual.toLocaleString()}만`}
                  </span>
                  <span className="num" style={{ textAlign: 'right', fontSize: 14, fontWeight: 700 }}>
                    {fmtM(row.netMonthly)}<span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 2 }}>만</span>
                  </span>
                  <span className="num" style={{ textAlign: 'right', fontSize: 13, color: 'var(--text-2)' }}>
                    {fmtM(row.netMonthly * 12)}<span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 2 }}>만</span>
                  </span>
                  <span className="num" style={{ textAlign: 'right', fontSize: 13, color: 'var(--text-3)' }}>
                    -{fmtM(row.totalDeduction)}<span style={{ fontSize: 11, marginLeft: 2 }}>만</span>
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                    <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${row.netRate}%`, background: 'var(--green)', borderRadius: 999 }} />
                    </div>
                    <span className="num" style={{ fontSize: 12, color: 'var(--text-2)', width: 32, textAlign: 'right' }}>
                      {row.netRate.toFixed(1)}%
                    </span>
                  </div>
                  <span className="num" style={{ textAlign: 'right', fontSize: 13, fontWeight: 700, color: mColor }}>
                    {row.medianRatio.toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>

          {/* 범례 */}
          <div style={{ padding: '10px 20px', borderTop: '1px solid var(--line)', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {[['var(--pink)', '~80%'], ['var(--orange)', '80~100%'], ['var(--green)', '100~150%'], ['var(--blue)', '150~200%'], ['var(--purple)', '200%+']].map(([c, l]) => (
              <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-3)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: c, flexShrink: 0 }} />{l}
              </span>
            ))}
            <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 'auto' }}>클릭하면 상세 보기</span>
          </div>
        </div>

        {/* 선택 상세 */}
        {selectedRow && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* 히어로 */}
            <div className="card hero">
              <div className="k-light">연봉 {selectedRow.annual >= 10000 ? `${(selectedRow.annual/10000).toFixed(selectedRow.annual%10000===0?0:1)}억` : `${selectedRow.annual.toLocaleString()}만원`} 실수령</div>
              <div className="num" style={{ fontSize: 44, lineHeight: 1.1, marginTop: 8 }}>
                {fmtM(selectedRow.netMonthly)}<span style={{ fontSize: 20, fontWeight: 600, color: 'var(--on-light-2)', marginLeft: 4 }}>만원 / 월</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                <span className="chip light">연 {fmtM(selectedRow.netMonthly * 12)}만원</span>
                <span className="chip light">실수령률 {selectedRow.netRate.toFixed(1)}%</span>
              </div>
            </div>

            {/* 공제 상세 */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div className="k">월 공제 내역</div>
                <span className="num" style={{ fontSize: 14 }}>총 {fmtM(selectedRow.totalDeduction)}만원</span>
              </div>
              {[
                ['국민연금', selectedRow.pension, '4.50%', 'var(--purple)'],
                ['건강보험', selectedRow.health, '3.545%', 'var(--blue)'],
                ['장기요양', selectedRow.lts, '×12.95%', 'var(--blue)'],
                ['고용보험', selectedRow.employment, '0.90%', 'var(--green)'],
                ['소득세', selectedRow.incomeTax, '근로소득세', 'var(--orange)'],
                ['지방소득세', selectedRow.localTax, '소득세×10%', 'var(--orange)'],
              ].map(([label, val, sub, color]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                    <span style={{ fontSize: 13 }}>{label}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{sub}</span>
                  </div>
                  <span className="num" style={{ fontSize: 14 }}>{fmtM(val)}만원</span>
                </div>
              ))}
            </div>

            {/* 중위소득 */}
            <div className="card">
              <div className="k" style={{ marginBottom: 12 }}>{household}인 가구 중위소득 대비</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
                <span className="num" style={{ fontSize: 36, color: medianColor(selectedRow.medianRatio) }}>{selectedRow.medianRatio.toFixed(1)}</span>
                <span style={{ color: 'var(--text-3)' }}>% · 중위소득 {MEDIAN_INCOME[household].toFixed(1)}만원</span>
              </div>
              <div style={{ height: 10, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden', marginBottom: 6 }}>
                <div style={{ height: '100%', width: `${Math.min(selectedRow.medianRatio / 2.5, 100)}%`,
                  background: `linear-gradient(90deg, var(--pink), ${medianColor(selectedRow.medianRatio)})`,
                  borderRadius: 999, transition: 'width 0.4s' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card dim" style={{ padding: '10px 16px', fontSize: 11, color: 'var(--text-3)', lineHeight: 1.6 }}>
        ※ 2026년 기준 추정치 · 국민연금 4.5%(상한 617만원) · 건강보험 3.545% · 장기요양 12.95% · 고용보험 0.9% · 비과세 수당 미반영 · 실제와 차이 있을 수 있음
      </div>
    </>
  );
}
