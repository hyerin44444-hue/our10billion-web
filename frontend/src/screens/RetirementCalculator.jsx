import { useState, useMemo, useEffect } from 'react';
import { KakaoShare, CopyLinkBtn } from '../components/Shared';

function sp() { return new URLSearchParams(window.location.search); }
function getNum(key, fallback) { const v = sp().get(key); return v !== null ? Number(v) : fallback; }

// ── 계산 ──────────────────────────────────────────────────────
function calculate({ currentAge, retireAge, currentAssets, monthly, rate, monthlyExpense, lifeExpectancy, pensionMonthly = 0, pensionStartAge = 63 }) {
  const r = rate / 100 / 12;
  const accumMonths = (retireAge - currentAge) * 12;
  const drawdownMonths = (lifeExpectancy - retireAge) * 12;

  // 적립 구간
  let portfolio = currentAssets;
  const accumYearly = [{ age: currentAge, portfolio }];
  for (let m = 1; m <= accumMonths; m++) {
    portfolio = portfolio * (1 + r) + monthly;
    if (m % 12 === 0) accumYearly.push({ age: currentAge + m / 12, portfolio });
  }
  const retirementPortfolio = portfolio;

  // 인출 구간 (국민연금 수령 시 생활비에서 차감)
  let drawdown = retirementPortfolio;
  const drawdownYearly = [{ age: retireAge, portfolio: drawdown }];
  let depletedAge = null;
  for (let m = 1; m <= drawdownMonths; m++) {
    const ageNow = retireAge + m / 12;
    const pension = ageNow >= pensionStartAge ? pensionMonthly : 0;
    const netExpense = Math.max(0, monthlyExpense - pension);
    drawdown = drawdown * (1 + r) - netExpense;
    if (drawdown <= 0 && !depletedAge) depletedAge = ageNow;
    if (m % 12 === 0) drawdownYearly.push({ age: ageNow, portfolio: Math.max(0, drawdown) });
  }

  const effectiveExpense = monthlyExpense - pensionMonthly;
  const canRetire = !depletedAge || depletedAge >= lifeExpectancy;
  const lastsUntilAge = depletedAge ?? lifeExpectancy;
  const shortfall = canRetire ? 0 : (Math.max(0, effectiveExpense) * 12 / 0.04) - retirementPortfolio;

  return { accumYearly, drawdownYearly, retirementPortfolio, canRetire, lastsUntilAge, shortfall };
}

// ── 포맷 ─────────────────────────────────────────────────────
function fmt(wan) {
  if (wan >= 10000) {
    const eok = Math.floor(wan / 10000);
    const rest = Math.round(wan % 10000);
    return rest > 0 ? `${eok}억 ${rest.toLocaleString()}만` : `${eok}억`;
  }
  return `${Math.round(wan).toLocaleString()}만`;
}

// ── 슬라이더 카드 ────────────────────────────────────────────
function SliderCard({ label, value, unit, min, max, step, onChange, display }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div className="k">{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
        <span className="num" style={{ fontSize: 28 }}>{display ?? value.toLocaleString()}</span>
        <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--coral)', cursor: 'pointer' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)' }}>
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );
}

// ── 라이프사이클 차트 ────────────────────────────────────────
function LifecycleChart({ accumYearly, drawdownYearly, retireAge, lifeExpectancy }) {
  const allData = [
    ...accumYearly.map(d => ({ ...d, phase: 'accum' })),
    ...drawdownYearly.slice(1).map(d => ({ ...d, phase: 'draw' })),
  ];
  if (allData.length < 2) return null;

  const W = 820, H = 220;
  const maxV = Math.max(...allData.map(d => d.portfolio)) * 1.1 || 1;
  const minAge = allData[0].age;
  const maxAge = allData[allData.length - 1].age;
  const spanAge = maxAge - minAge || 1;

  const x = (age) => ((age - minAge) / spanAge) * (W - 60) + 30;
  const y = (v) => H - 30 - (v / maxV) * (H - 50);

  const accumPath = accumYearly.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(d.age).toFixed(1)} ${y(d.portfolio).toFixed(1)}`).join(' ');
  const drawPath = [accumYearly[accumYearly.length - 1], ...drawdownYearly.slice(1)]
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(d.age).toFixed(1)} ${y(d.portfolio).toFixed(1)}`).join(' ');

  const accumArea = `${accumPath} L ${x(retireAge)} ${H - 30} L ${x(minAge)} ${H - 30} Z`;

  const labelAges = Array.from({ length: 5 }, (_, i) => Math.round(minAge + (spanAge / 4) * i));

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="accum-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef6f5b" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ef6f5b" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((p, i) => (
        <line key={i} x1="30" x2={W - 30}
          y1={30 + (H - 60) * p} y2={30 + (H - 60) * p}
          stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      ))}
      {/* 은퇴 시점 구분선 */}
      <line x1={x(retireAge)} x2={x(retireAge)} y1="10" y2={H - 30}
        stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="4 3" />
      <text x={x(retireAge)} y="8" fontSize="10" textAnchor="middle"
        fill="rgba(255,255,255,0.5)" fontFamily="Inter">은퇴 {retireAge}세</text>

      <path d={accumArea} fill="url(#accum-g)" />
      <path d={accumPath} stroke="#ef6f5b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d={drawPath} stroke="rgba(255,255,255,0.4)" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="6 3" />

      <circle cx={x(retireAge)} cy={y(accumYearly[accumYearly.length - 1].portfolio)} r="6"
        fill="#ef6f5b" stroke="#fff" strokeWidth="2" />

      {labelAges.map(age => (
        <text key={age} x={x(age)} y={H - 10} fontSize="11" textAnchor="middle"
          fill="rgba(255,255,255,0.4)" fontFamily="Inter">{age}세</text>
      ))}
    </svg>
  );
}

// ── 메인 ────────────────────────────────────────────────────
export default function RetirementCalculator() {
  const [currentAge,    setCurrentAge]    = useState(() => getNum('ra', 35));
  const [retireAge,     setRetireAge]     = useState(() => getNum('rr', 58));
  const [currentAssets, setCurrentAssets] = useState(() => getNum('rc', 5000));
  const [monthly,       setMonthly]       = useState(() => getNum('rm', 200));
  const [rate,          setRate]          = useState(() => getNum('rrate', 6));
  const [monthlyExp,    setMonthlyExp]    = useState(() => getNum('re', 300));
  const [lifeExp,       setLifeExp]       = useState(() => getNum('rl', 88));
  const [pensionOn,     setPensionOn]     = useState(() => sp().get('rpo') === '1');
  const [pensionAmt,    setPensionAmt]    = useState(() => getNum('rpa', 100));
  const [pensionStart,  setPensionStart]  = useState(() => getNum('rps', 63));

  useEffect(() => {
    const p = sp();
    p.set('screen', 'retirement');
    p.set('ra', currentAge); p.set('rr', retireAge); p.set('rc', currentAssets);
    p.set('rm', monthly); p.set('rrate', rate); p.set('re', monthlyExp);
    p.set('rl', lifeExp); p.set('rpo', pensionOn ? '1' : '0');
    p.set('rpa', pensionAmt); p.set('rps', pensionStart);
    window.history.replaceState(null, '', `?${p}`);
  }, [currentAge, retireAge, currentAssets, monthly, rate, monthlyExp, lifeExp, pensionOn, pensionAmt, pensionStart]);

  const params = {
    currentAge, retireAge, currentAssets, monthly, rate,
    monthlyExpense: monthlyExp, lifeExpectancy: lifeExp,
    pensionMonthly: pensionOn ? pensionAmt : 0,
    pensionStartAge: pensionStart,
  };

  const result        = useMemo(() => calculate(params), [currentAge, retireAge, currentAssets, monthly, rate, monthlyExp, lifeExp, pensionOn, pensionAmt, pensionStart]);
  const resultPlus10  = useMemo(() => calculate({ ...params, monthly: monthly + 10 }),  [currentAge, retireAge, currentAssets, monthly, rate, monthlyExp, lifeExp, pensionOn, pensionAmt, pensionStart]);
  const resultPlus50  = useMemo(() => calculate({ ...params, monthly: monthly + 50 }),  [currentAge, retireAge, currentAssets, monthly, rate, monthlyExp, lifeExp, pensionOn, pensionAmt, pensionStart]);
  const resultRate1up = useMemo(() => calculate({ ...params, rate: rate + 1 }),          [currentAge, retireAge, currentAssets, monthly, rate, monthlyExp, lifeExp, pensionOn, pensionAmt, pensionStart]);

  const { accumYearly, drawdownYearly, retirementPortfolio, canRetire, lastsUntilAge, shortfall } = result;
  const yearsToRetire   = retireAge - currentAge;
  const annualExpense   = monthlyExp * 12;
  const gainPlus10      = resultPlus10.retirementPortfolio  - retirementPortfolio;
  const gainPlus50      = resultPlus50.retirementPortfolio  - retirementPortfolio;
  const gainRate1up     = resultRate1up.retirementPortfolio - retirementPortfolio;

  return (
    <>
      <div className="topbar">
        <div className="left">
          <div>
            <div className="title">은퇴 가능 계산기</div>
            <div className="sub">지금 속도로 모으면 몇 살에 은퇴할 수 있을까요?</div>
          </div>
        </div>
        <div className="right" style={{ gap: 10 }}>
          <CopyLinkBtn />
          <KakaoShare
            title={canRetire ? `${retireAge}세 은퇴 가능! 🎯` : `은퇴 시뮬레이션 결과`}
            description={canRetire
              ? `은퇴 자산 ${fmt(retirementPortfolio)}원 · ${Math.floor(lastsUntilAge)}세까지 유지 · 모았다 시뮬레이터`
              : `${fmt(Math.abs(shortfall))}원 부족 · 모았다 시뮬레이터`}
          />
          <div className="seg">
            <button className={!pensionOn ? 'on' : ''} onClick={() => setPensionOn(false)}>미포함</button>
            <button className={pensionOn ? 'on' : ''} onClick={() => setPensionOn(true)}>국민연금 포함</button>
          </div>
        </div>
      </div>

      {/* 입력 — 행 1 */}
      <div className="grid-4">
        <SliderCard label="현재 나이"    value={currentAge}    unit="세"  min={20} max={60} step={1}   onChange={setCurrentAge} />
        <SliderCard label="목표 은퇴 나이" value={retireAge}   unit="세"  min={currentAge + 1} max={70} step={1} onChange={setRetireAge} />
        <SliderCard label="현재 자산"    value={currentAssets} unit="만원" min={0} max={50000} step={500} onChange={setCurrentAssets} display={fmt(currentAssets)} />
        <SliderCard label="월 저축액"    value={monthly}       unit="만원" min={10} max={1000} step={10} onChange={setMonthly} />
      </div>

      {/* 입력 — 행 2 */}
      <div className="grid-3">
        <SliderCard label="기대 수익률"      value={rate}     unit="%"  min={1}  max={15}  step={0.5} onChange={setRate} display={rate.toFixed(1)} />
        <SliderCard label="은퇴 후 월 생활비" value={monthlyExp} unit="만원" min={100} max={1000} step={50} onChange={setMonthlyExp} />
        <SliderCard label="기대 수명"        value={lifeExp}  unit="세"  min={retireAge + 1} max={100} step={1} onChange={setLifeExp} />
      </div>

      {/* 국민연금 입력 (포함 탭 선택 시) */}
      {pensionOn && (
        <div className="card" style={{ background: 'rgba(165,148,249,0.10)', border: '1px solid rgba(165,148,249,0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 16 }}>🏛️</span>
            <span style={{ fontWeight: 600, fontSize: 15 }}>국민연금 설정</span>
            <span style={{ fontSize: 12, color: 'var(--text-3)', marginLeft: 4 }}>수령 시작 후 생활비에서 자동 차감</span>
          </div>
          <div className="grid-2">
            <SliderCard label="월 예상 수령액" value={pensionAmt} unit="만원" min={30} max={300} step={10} onChange={setPensionAmt} />
            <SliderCard label="수령 시작 나이" value={pensionStart} unit="세" min={60} max={70} step={1} onChange={setPensionStart} />
          </div>
        </div>
      )}

      {/* 결과 히어로 */}
      <div className="card hero">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="k-light">
              {retireAge}세 은퇴 시 예상 자산 ({yearsToRetire}년 후)
            </div>
            <div className="num" style={{ fontSize: 52, lineHeight: 1.1, marginTop: 8 }}>
              {fmt(retirementPortfolio)}
              <span style={{ fontSize: 22, fontWeight: 600, color: 'var(--on-light-2)', marginLeft: 4 }}>원</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              <span className="chip light">
                {canRetire ? '✅ 은퇴 가능' : '⚠️ 자산 부족'}
              </span>
              <span className="chip light">
                {Math.floor(lastsUntilAge)}세까지 유지
              </span>
              <span className="chip light">
                연 생활비 {fmt(annualExpense)}원
              </span>
              {pensionOn && (
                <span className="chip purple">
                  🏛️ 국민연금 월 {pensionAmt}만 ({pensionStart}세~)
                </span>
              )}
            </div>
          </div>

          {/* 가능 여부 인디케이터 */}
          <div style={{ textAlign: 'center', minWidth: 140 }}>
            <div style={{
              width: 100, height: 100, borderRadius: '50%', margin: '0 auto',
              background: canRetire
                ? 'linear-gradient(135deg, #5dbb7a, #7ab8f5)'
                : 'linear-gradient(135deg, #f4a8cb, #f4b876)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              boxShadow: canRetire ? '0 0 30px rgba(93,187,122,0.4)' : '0 0 30px rgba(244,168,203,0.4)',
            }}>
              <span style={{ fontSize: 32 }}>{canRetire ? '🌴' : '⚠️'}</span>
            </div>
            <div style={{ marginTop: 8, fontWeight: 700, fontSize: 15, color: 'var(--on-light)' }}>
              {canRetire ? '은퇴 가능' : '자산 부족'}
            </div>
          </div>
        </div>
      </div>

      {/* 스탯 */}
      <div className="grid-4">
        {[
          {
            label: '은퇴 시 예상 자산',
            value: fmt(retirementPortfolio) + '원',
            sub: `${yearsToRetire}년간 복리 적립`,
            color: 'var(--text)',
          },
          {
            label: '자산 지속 기간',
            value: `${Math.floor(lastsUntilAge - retireAge)}년`,
            sub: `${Math.floor(lastsUntilAge)}세까지`,
            color: canRetire ? 'var(--green)' : 'var(--orange)',
          },
          {
            label: canRetire ? '여유 자산' : '부족 금액',
            value: (canRetire ? '+' : '-') + fmt(Math.abs(shortfall || (retirementPortfolio - monthlyExp * 12 / 0.04))) + '원',
            sub: '4% 안전인출률 기준',
            color: canRetire ? 'var(--coral)' : 'var(--pink)',
          },
          {
            label: '필요 노후 자금',
            value: fmt(monthlyExp * 12 / 0.04) + '원',
            sub: `월 ${monthlyExp.toLocaleString()}만 × 4% rule`,
            color: 'var(--text)',
          },
        ].map(({ label, value, sub, color }, i) => (
          <div key={i} className="card">
            <div className="k">{label}</div>
            <div className="num" style={{ fontSize: 20, marginTop: 8, color }}>{value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* 라이프사이클 차트 */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div className="k">자산 라이프사이클</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>적립 → 은퇴 → 인출</div>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 18, height: 3, background: '#ef6f5b', display: 'inline-block', borderRadius: 2 }}></span>
              적립 구간
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 18, height: 3, borderTop: '2px dashed rgba(255,255,255,0.4)', display: 'inline-block' }}></span>
              인출 구간
            </span>
          </div>
        </div>
        <LifecycleChart
          accumYearly={accumYearly}
          drawdownYearly={drawdownYearly}
          retireAge={retireAge}
          lifeExpectancy={lifeExp}
        />
      </div>

      {/* 인사이트 */}
      <div className="card" style={{ background: 'var(--surface-2)' }}>
        <div className="k" style={{ marginBottom: 12 }}>분석 인사이트</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            canRetire
              ? { emoji: '🎯', text: `현재 계획대로라면 ${retireAge}세에 은퇴 가능해요. 자산이 ${Math.floor(lastsUntilAge)}세까지 유지됩니다.` }
              : { emoji: '⚠️', text: `은퇴 자산이 ${fmt(Math.abs(shortfall))}원 부족해요. 월 저축을 늘리거나 은퇴 시기를 늦춰보세요.` },
            { emoji: '💡', text: `월 10만원만 더 저축하면 은퇴 자산이 ${fmt(gainPlus10)}원 늘어요. 월 50만원 추가 시 ${fmt(gainPlus50)}원 증가합니다.` },
            { emoji: '📈', text: `수익률이 1% 오르면 (${rate}% → ${rate + 1}%) 은퇴 자산이 ${fmt(gainRate1up)}원 증가해요.` },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: 12, background: 'rgba(255,255,255,0.04)', borderRadius: 12 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.emoji}</span>
              <span style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.5 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

    </>
  );
}
