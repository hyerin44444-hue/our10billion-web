import { useState, useMemo } from 'react';
import { DonutBreakdown, KakaoShare } from '../components/Shared';

// ── 포맷 ─────────────────────────────────────────────────────
function fmt(wan) {
  if (wan === 0) return '0';
  if (Math.abs(wan) >= 10000) {
    const eok = Math.floor(Math.abs(wan) / 10000);
    const rest = Math.round(Math.abs(wan) % 10000);
    const sign = wan < 0 ? '-' : '';
    return rest > 0 ? `${sign}${eok}억 ${rest.toLocaleString()}만` : `${sign}${eok}억`;
  }
  return `${wan < 0 ? '-' : ''}${Math.round(Math.abs(wan)).toLocaleString()}만`;
}

// ── 입력 행 ───────────────────────────────────────────────────
function AmountRow({ label, value, onChange, dotColor, placeholder = '0' }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 0', borderBottom: '1px solid var(--line)',
    }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: 14 }}>{label}</span>
      <input
        type="number" min="0" placeholder={placeholder} value={value || ''}
        onChange={e => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
        style={{
          width: 130, background: 'var(--surface-2)', border: '1px solid var(--line)',
          borderRadius: 8, padding: '8px 12px', color: 'var(--text)', fontFamily: 'inherit',
          fontSize: 14, textAlign: 'right', outline: 'none',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--coral)'}
        onBlur={e => e.target.style.borderColor = 'var(--line)'}
      />
      <span style={{ fontSize: 12, color: 'var(--text-3)', width: 24, flexShrink: 0 }}>만원</span>
    </div>
  );
}

// ── 부채비율 게이지 ───────────────────────────────────────────
function DebtGauge({ ratio }) {
  const clamped = Math.min(ratio, 100);
  const { label, color, msg } =
    ratio < 20  ? { label: '안정',   color: 'var(--green)',  msg: '부채가 적고 재무 상태가 튼튼해요.' } :
    ratio < 40  ? { label: '양호',   color: 'var(--blue)',   msg: '적정 수준이에요. 조금씩 줄여가요.' } :
    ratio < 60  ? { label: '주의',   color: 'var(--orange)', msg: '자산 대비 부채가 높아지고 있어요.' } :
                  { label: '위험',   color: 'var(--pink)',   msg: '부채 상환을 최우선으로 고려해보세요.' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span className="k">부채비율</span>
        <span style={{ fontSize: 11, color, fontWeight: 700 }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span className="num" style={{ fontSize: 40, color }}>{ratio.toFixed(1)}</span>
        <span style={{ fontSize: 16, color: 'var(--text-3)' }}>%</span>
      </div>
      <div style={{ height: 10, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 999,
          width: `${clamped}%`,
          background: `linear-gradient(90deg, var(--green), ${color})`,
          transition: 'width 0.4s ease',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)' }}>
        <span>안전 &lt;20%</span><span>주의 40%</span><span>위험 &gt;60%</span>
      </div>
      <div style={{ padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.05)', fontSize: 13, color: 'var(--text-2)' }}>
        💡 {msg}
      </div>
    </div>
  );
}

// ── 자산 구성 범례 ────────────────────────────────────────────
const ASSET_CATS = [
  { id: 'cash',    label: '현금·예적금',     color: 'var(--pink)',   dot: '#f4a8cb' },
  { id: 'invest',  label: '주식·펀드·ETF',   color: 'var(--orange)', dot: '#f4b876' },
  { id: 'pension', label: '연금 (국민·IRP)', color: 'var(--purple)', dot: '#a594f9' },
  { id: 'realty',  label: '부동산',          color: 'var(--green)',  dot: '#5dbb7a' },
  { id: 'other',   label: '기타 자산',       color: 'var(--blue)',   dot: '#7ab8f5' },
];

const DEBT_CATS = [
  { id: 'mortgage', label: '주택담보대출',          dot: '#f4a8cb' },
  { id: 'credit',   label: '신용대출·마이너스통장', dot: '#f4b876' },
  { id: 'car',      label: '자동차 할부',           dot: '#a594f9' },
  { id: 'other',    label: '기타 부채',             dot: '#7ab8f5' },
];

// ── 메인 컴포넌트 ─────────────────────────────────────────────
export default function NetWorthCalculator() {
  const [assets, setAssets] = useState({ cash: 0, invest: 0, pension: 0, realty: 0, other: 0 });
  const [debts, setDebts]   = useState({ mortgage: 0, credit: 0, car: 0, other: 0 });

  const setAsset = (id, val) => setAssets(prev => ({ ...prev, [id]: val }));
  const setDebt  = (id, val) => setDebts(prev => ({ ...prev, [id]: val }));

  const totalAssets = useMemo(() => Object.values(assets).reduce((a, b) => a + b, 0), [assets]);
  const totalDebts  = useMemo(() => Object.values(debts).reduce((a, b) => a + b, 0), [debts]);
  const netWorth    = totalAssets - totalDebts;
  const debtRatio   = totalAssets > 0 ? (totalDebts / totalAssets) * 100 : 0;

  const donutParts = ASSET_CATS.map(c => ({
    v: assets[c.id] || 0.001,
    color: c.color,
  }));

  const isPositive = netWorth >= 0;

  return (
    <>
      {/* 타이틀 */}
      <div className="topbar">
        <div className="left">
          <div>
            <div className="title">순자산 계산기</div>
            <div className="sub">총 자산에서 총 부채를 뺀 나의 진짜 재산</div>
          </div>
        </div>
        <div className="right">
          <KakaoShare
            title={`내 순자산 ${fmt(netWorth)}원`}
            description={`총 자산 ${fmt(totalAssets)}원 · 총 부채 ${fmt(totalDebts)}원 · 부채비율 ${debtRatio.toFixed(1)}% · 모았다 계산기`}
          />
          <button className="pill-btn" style={{ fontSize: 14, padding: '10px 18px' }}
            onClick={() => { setAssets({ cash: 0, invest: 0, pension: 0, realty: 0, other: 0 }); setDebts({ mortgage: 0, credit: 0, car: 0, other: 0 }); }}>
            초기화
          </button>
        </div>
      </div>

      {/* 입력 2열 */}
      <div className="grid-2">
        {/* 자산 */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <div className="k">내 자산</div>
            <span className="num" style={{ fontSize: 18, color: 'var(--green)' }}>{fmt(totalAssets)}원</span>
          </div>
          <AmountRow label="현금·예적금"     value={assets.cash}    onChange={v => setAsset('cash', v)}    dotColor="#f4a8cb" />
          <AmountRow label="주식·펀드·ETF"   value={assets.invest}  onChange={v => setAsset('invest', v)}  dotColor="#f4b876" />
          <AmountRow label="연금 (국민·IRP)" value={assets.pension} onChange={v => setAsset('pension', v)} dotColor="#a594f9" />
          <AmountRow label="부동산"           value={assets.realty}  onChange={v => setAsset('realty', v)}  dotColor="#5dbb7a" />
          <AmountRow label="기타 자산"        value={assets.other}   onChange={v => setAsset('other', v)}   dotColor="#7ab8f5" />
        </div>

        {/* 부채 */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <div className="k">내 부채</div>
            <span className="num" style={{ fontSize: 18, color: 'var(--pink)' }}>{fmt(totalDebts)}원</span>
          </div>
          <AmountRow label="주택담보대출"          value={debts.mortgage} onChange={v => setDebt('mortgage', v)} dotColor="#f4a8cb" />
          <AmountRow label="신용대출·마이너스통장" value={debts.credit}   onChange={v => setDebt('credit', v)}   dotColor="#f4b876" />
          <AmountRow label="자동차 할부"           value={debts.car}      onChange={v => setDebt('car', v)}      dotColor="#a594f9" />
          <AmountRow label="기타 부채"             value={debts.other}    onChange={v => setDebt('other', v)}    dotColor="#7ab8f5" />

          {/* 부채비율 게이지 */}
          <div style={{ marginTop: 20 }}>
            <DebtGauge ratio={debtRatio} />
          </div>
        </div>
      </div>

      {/* 순자산 히어로 */}
      <div className="card hero">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="k-light">나의 순자산</div>
            <div className="num" style={{ fontSize: 56, lineHeight: 1.1, marginTop: 8, color: isPositive ? 'var(--on-light)' : '#ef6f5b' }}>
              {isPositive ? '' : '-'}{fmt(Math.abs(netWorth))}
              <span style={{ fontSize: 22, fontWeight: 600, color: 'var(--on-light-2)', marginLeft: 4 }}>원</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <span className="chip light">총 자산 {fmt(totalAssets)}원</span>
              <span className="chip light">총 부채 {fmt(totalDebts)}원</span>
            </div>
          </div>

          {/* 자산-부채 시각화 바 */}
          {totalAssets > 0 && (
            <div style={{ minWidth: 200, textAlign: 'right' }}>
              <div className="k-light" style={{ marginBottom: 10 }}>자산 구성</div>
              <div style={{ height: 14, borderRadius: 999, overflow: 'hidden', background: '#f4a8cb', display: 'flex' }}>
                <div style={{
                  height: '100%', background: 'var(--green)',
                  width: `${Math.min((netWorth / totalAssets) * 100, 100)}%`,
                  transition: 'width 0.4s ease',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12, color: 'var(--on-light-3)' }}>
                <span style={{ color: 'var(--green)' }}>순자산 {totalAssets > 0 ? ((netWorth / totalAssets) * 100).toFixed(0) : 0}%</span>
                <span style={{ color: '#c0524a' }}>부채 {debtRatio.toFixed(0)}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 하단 2열: 자산 구성 + 요약 */}
      <div className="grid-2">
        {/* 자산 구성 도넛 */}
        <div className="card">
          <div className="k" style={{ marginBottom: 16 }}>자산 구성</div>
          {totalAssets > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <DonutBreakdown size={160} parts={donutParts} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {ASSET_CATS.map(c => {
                  const val = assets[c.id];
                  const pct = totalAssets > 0 ? ((val / totalAssets) * 100).toFixed(0) : 0;
                  return (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 13 }}>{c.label}</span>
                      <span className="num" style={{ fontSize: 13 }}>{fmt(val)}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-3)', width: 32, textAlign: 'right' }}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-3)', fontSize: 14 }}>
              자산을 입력하면 구성 비율이 보여요
            </div>
          )}
        </div>

        {/* 요약 수치 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: '총 자산',  value: fmt(totalAssets) + '원', color: 'var(--green)',  sub: `${Object.values(assets).filter(v => v > 0).length}개 항목` },
            { label: '총 부채',  value: fmt(totalDebts) + '원',  color: 'var(--pink)',   sub: `${Object.values(debts).filter(v => v > 0).length}개 항목` },
            { label: '순자산',   value: fmt(netWorth) + '원',    color: isPositive ? 'var(--coral)' : 'var(--pink)', sub: '총자산 − 총부채' },
            { label: '부채비율', value: debtRatio.toFixed(1) + '%', color: debtRatio < 40 ? 'var(--green)' : 'var(--orange)', sub: '부채 ÷ 자산' },
          ].map(({ label, value, color, sub }) => (
            <div key={label} className="card" style={{ padding: '14px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div className="k">{label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{sub}</div>
                </div>
                <div className="num" style={{ fontSize: 22, color }}>{value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
