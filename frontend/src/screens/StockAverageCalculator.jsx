import { useState, useMemo } from 'react';

// ── 포맷 ─────────────────────────────────────────────────────
function fmtWon(n) {
  if (Math.abs(n) >= 100000000) return `${(n / 100000000).toFixed(2)}억원`;
  if (Math.abs(n) >= 10000) return `${(n / 10000).toFixed(1)}만원`;
  return `${Math.round(n).toLocaleString()}원`;
}
function fmtPrice(n) {
  return Math.round(n).toLocaleString() + '원';
}

// ── 계산 ─────────────────────────────────────────────────────
function calculate(buys, currentPrice) {
  const valid = buys.filter(b => b.price > 0 && b.qty > 0);
  if (valid.length === 0) return null;

  const totalAmount = valid.reduce((s, b) => s + b.price * b.qty, 0);
  const totalQty    = valid.reduce((s, b) => s + b.qty, 0);
  const avgPrice    = totalAmount / totalQty;
  const currentValue = currentPrice * totalQty;
  const pnl         = currentValue - totalAmount;
  const pnlRate     = (pnl / totalAmount) * 100;
  const riseNeeded  = currentPrice < avgPrice
    ? ((avgPrice - currentPrice) / currentPrice) * 100
    : 0;

  return { totalAmount, totalQty, avgPrice, currentValue, pnl, pnlRate, riseNeeded };
}

// ── 매수 행 입력 ─────────────────────────────────────────────
function BuyRow({ index, buy, onChange, onRemove, canRemove }) {
  const amount = buy.price * buy.qty;
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '32px 1fr 1fr 1fr 36px',
      gap: 10, alignItems: 'center', padding: '10px 0',
      borderBottom: '1px solid var(--line)',
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        background: ['var(--coral)', 'var(--orange)', 'var(--purple)', 'var(--blue)', 'var(--green)'][index % 5],
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
      }}>{index + 1}</div>

      {/* 매수가 */}
      <div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>매수가</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--surface-2)', borderRadius: 8, padding: '6px 10px' }}>
          <input
            type="number" min="0" value={buy.price || ''}
            placeholder="0"
            onChange={e => onChange({ ...buy, price: Number(e.target.value) })}
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none',
              color: 'var(--text)', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, minWidth: 0 }}
          />
          <span style={{ fontSize: 12, color: 'var(--text-3)', flexShrink: 0 }}>원</span>
        </div>
      </div>

      {/* 수량 */}
      <div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>수량</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--surface-2)', borderRadius: 8, padding: '6px 10px' }}>
          <input
            type="number" min="0" value={buy.qty || ''}
            placeholder="0"
            onChange={e => onChange({ ...buy, qty: Number(e.target.value) })}
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none',
              color: 'var(--text)', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, minWidth: 0 }}
          />
          <span style={{ fontSize: 12, color: 'var(--text-3)', flexShrink: 0 }}>주</span>
        </div>
      </div>

      {/* 금액 */}
      <div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>매수 금액</div>
        <div style={{ background: 'var(--surface-2)', borderRadius: 8, padding: '6px 10px',
          fontSize: 14, fontWeight: 600, color: amount > 0 ? 'var(--text)' : 'var(--text-3)',
          height: 34, display: 'flex', alignItems: 'center' }}>
          {amount > 0 ? fmtWon(amount) : '—'}
        </div>
      </div>

      {/* 삭제 */}
      <button onClick={onRemove} disabled={!canRemove}
        style={{ width: 32, height: 32, borderRadius: '50%', border: 'none',
          background: canRemove ? 'rgba(244,168,203,0.2)' : 'transparent',
          color: canRemove ? 'var(--pink)' : 'var(--text-3)',
          cursor: canRemove ? 'pointer' : 'default', fontSize: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        ×
      </button>
    </div>
  );
}

// ── 손익 바 ──────────────────────────────────────────────────
function PnlBar({ pnlRate }) {
  const clamped = Math.max(-100, Math.min(100, pnlRate));
  const isPos = pnlRate >= 0;
  return (
    <div style={{ position: 'relative', height: 10, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden', margin: '8px 0' }}>
      {/* 가운데 기준선 */}
      <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, background: 'rgba(255,255,255,0.2)' }} />
      {/* 손익 바 */}
      <div style={{
        position: 'absolute',
        top: 0, bottom: 0,
        left: isPos ? '50%' : `${50 + clamped / 2}%`,
        width: `${Math.abs(clamped) / 2}%`,
        background: isPos ? 'var(--green)' : 'var(--pink)',
        borderRadius: 999,
        transition: 'all 0.3s ease',
      }} />
    </div>
  );
}

// ── 메인 ─────────────────────────────────────────────────────
let nextId = 3;
export default function StockAverageCalculator() {
  const [buys, setBuys] = useState([
    { id: 1, price: 50000, qty: 10 },
    { id: 2, price: 40000, qty: 15 },
  ]);
  const [currentPrice, setCurrentPrice] = useState(38000);
  const [targetPrice,  setTargetPrice]  = useState(50000);

  const result = useMemo(() => calculate(buys, currentPrice), [buys, currentPrice]);
  const targetResult = useMemo(() => {
    if (!result) return null;
    const targetValue = targetPrice * result.totalQty;
    const targetPnl   = targetValue - result.totalAmount;
    const targetRate  = (targetPnl / result.totalAmount) * 100;
    return { targetValue, targetPnl, targetRate };
  }, [result, targetPrice]);

  const addRow = () => {
    setBuys(prev => [...prev, { id: nextId++, price: 0, qty: 0 }]);
  };
  const updateRow = (id, val) => setBuys(prev => prev.map(b => b.id === id ? val : b));
  const removeRow = (id) => setBuys(prev => prev.filter(b => b.id !== id));

  const isLoss = result && result.pnl < 0;

  return (
    <>
      <div className="topbar">
        <div className="left">
          <div>
            <div className="title">주식 물타기 계산기</div>
            <div className="sub">여러 번 매수한 평균 단가와 손익을 계산해요</div>
          </div>
        </div>
        <div className="right">
          <button className="pill-btn" style={{ fontSize: 13, padding: '8px 16px' }} onClick={addRow}>
            <span className="plus">+</span> 매수 추가
          </button>
        </div>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '1.4fr 1fr', alignItems: 'start' }}>
        {/* 매수 내역 */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <div className="k">매수 내역</div>
            {result && (
              <span style={{ fontSize: 13, color: 'var(--text-3)' }}>
                총 <span className="num" style={{ color: 'var(--text)' }}>{result.totalQty.toLocaleString()}</span>주 ·{' '}
                <span className="num" style={{ color: 'var(--text)' }}>{fmtWon(result.totalAmount)}</span>
              </span>
            )}
          </div>

          {buys.map((buy, i) => (
            <BuyRow
              key={buy.id} index={i} buy={buy}
              onChange={val => updateRow(buy.id, val)}
              onRemove={() => removeRow(buy.id)}
              canRemove={buys.length > 1}
            />
          ))}

          <button onClick={addRow} style={{
            marginTop: 12, width: '100%', padding: '10px',
            background: 'rgba(255,255,255,0.04)', border: '1px dashed var(--line-2)',
            borderRadius: 12, color: 'var(--text-3)', fontSize: 13, cursor: 'pointer',
          }}>+ 매수 회차 추가</button>
        </div>

        {/* 현재가 + 목표가 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card">
            <div className="k" style={{ marginBottom: 10 }}>현재가</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-2)', borderRadius: 10, padding: '10px 14px' }}>
              <input
                type="number" min="0" value={currentPrice || ''}
                onChange={e => setCurrentPrice(Number(e.target.value))}
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none',
                  color: 'var(--text)', fontFamily: 'inherit', fontSize: 22, fontWeight: 700,
                  borderBottom: '2px solid var(--coral)', paddingBottom: 2 }}
              />
              <span style={{ fontSize: 14, color: 'var(--text-3)' }}>원</span>
            </div>
            {result && (
              <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text-3)' }}>
                평균단가 대비{' '}
                <span style={{ color: currentPrice >= result.avgPrice ? 'var(--green)' : 'var(--pink)', fontWeight: 600 }}>
                  {currentPrice >= result.avgPrice ? '+' : ''}{((currentPrice - result.avgPrice) / result.avgPrice * 100).toFixed(2)}%
                </span>
              </div>
            )}
          </div>

          <div className="card">
            <div className="k" style={{ marginBottom: 10 }}>목표가</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-2)', borderRadius: 10, padding: '10px 14px' }}>
              <input
                type="number" min="0" value={targetPrice || ''}
                onChange={e => setTargetPrice(Number(e.target.value))}
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none',
                  color: 'var(--text)', fontFamily: 'inherit', fontSize: 22, fontWeight: 700,
                  borderBottom: '2px solid var(--purple)', paddingBottom: 2 }}
              />
              <span style={{ fontSize: 14, color: 'var(--text-3)' }}>원</span>
            </div>
            {result && targetResult && (
              <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text-3)' }}>
                예상 수익{' '}
                <span style={{ color: targetResult.targetPnl >= 0 ? 'var(--green)' : 'var(--pink)', fontWeight: 600 }}>
                  {targetResult.targetPnl >= 0 ? '+' : ''}{fmtWon(targetResult.targetPnl)}
                  {' '}({targetResult.targetRate.toFixed(2)}%)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 결과 히어로 */}
      {result && (
        <div className="card hero">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="k-light">평균 매수 단가</div>
              <div className="num" style={{ fontSize: 52, lineHeight: 1.1, marginTop: 8 }}>
                {fmtPrice(result.avgPrice)}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                <span className="chip light">총 {result.totalQty.toLocaleString()}주</span>
                <span className="chip light">총 {fmtWon(result.totalAmount)} 투자</span>
                {result.riseNeeded > 0 && (
                  <span className="chip light">
                    본전까지 +{result.riseNeeded.toFixed(2)}% 필요
                  </span>
                )}
              </div>
            </div>

            {/* 현재 손익 */}
            <div style={{ textAlign: 'right' }}>
              <div className="k-light">현재 평가손익</div>
              <div className="num" style={{
                fontSize: 36, lineHeight: 1.1, marginTop: 8,
                color: isLoss ? 'var(--on-light-2)' : 'var(--on-light)',
              }}>
                {result.pnl >= 0 ? '+' : ''}{fmtWon(result.pnl)}
              </div>
              <div style={{
                fontSize: 18, fontWeight: 700, marginTop: 4,
                color: isLoss ? '#c0524a' : '#2e7d4f',
              }}>
                {result.pnlRate >= 0 ? '+' : ''}{result.pnlRate.toFixed(2)}%
              </div>
              <PnlBar pnlRate={result.pnlRate} />
            </div>
          </div>
        </div>
      )}

      {/* 스탯 카드 */}
      {result && (
        <div className="grid-4">
          {[
            { label: '평균 단가',   value: fmtPrice(result.avgPrice), sub: `${buys.filter(b=>b.price>0&&b.qty>0).length}회 매수 평균`, color: 'var(--text)' },
            { label: '평가 금액',   value: fmtWon(result.currentValue), sub: `현재가 ${fmtPrice(currentPrice)} × ${result.totalQty}주`, color: 'var(--text)' },
            { label: '손익',        value: (result.pnl >= 0 ? '+' : '') + fmtWon(result.pnl), sub: `수익률 ${result.pnlRate.toFixed(2)}%`, color: result.pnl >= 0 ? 'var(--green)' : 'var(--pink)' },
            { label: '목표가 수익', value: targetResult ? (targetResult.targetPnl >= 0 ? '+' : '') + fmtWon(targetResult.targetPnl) : '—', sub: targetResult ? `${targetResult.targetRate.toFixed(2)}%` : '목표가 입력', color: 'var(--coral)' },
          ].map(({ label, value, sub, color }, i) => (
            <div key={i} className="card">
              <div className="k">{label}</div>
              <div className="num" style={{ fontSize: 20, marginTop: 8, color }}>{value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>{sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* 회차별 상세 */}
      {result && (
        <div className="card">
          <div className="k" style={{ marginBottom: 14 }}>회차별 상세</div>
          <div style={{ display: 'grid', gap: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 1fr 1fr 1fr', gap: 8,
              fontSize: 11, color: 'var(--text-3)', padding: '4px 0 8px', borderBottom: '1px solid var(--line)' }}>
              <span></span>
              <span>매수가</span><span>수량</span><span>매수금액</span>
              <span>비중</span><span>현재 손익</span>
            </div>
            {buys.filter(b => b.price > 0 && b.qty > 0).map((b, i) => {
              const amount  = b.price * b.qty;
              const pnl     = (currentPrice - b.price) * b.qty;
              const pnlRate = ((currentPrice - b.price) / b.price) * 100;
              const weight  = (amount / result.totalAmount) * 100;
              return (
                <div key={b.id} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 1fr 1fr 1fr', gap: 8,
                  fontSize: 13, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'center' }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', fontSize: 11, fontWeight: 700,
                    background: ['var(--coral)', 'var(--orange)', 'var(--purple)', 'var(--blue)', 'var(--green)'][i % 5],
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                  }}>{i + 1}</div>
                  <span className="num">{fmtPrice(b.price)}</span>
                  <span className="num">{b.qty.toLocaleString()}주</span>
                  <span className="num">{fmtWon(amount)}</span>
                  <div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 999, marginBottom: 4 }}>
                      <div style={{ height: '100%', width: `${weight}%`, borderRadius: 999,
                        background: ['var(--coral)', 'var(--orange)', 'var(--purple)', 'var(--blue)', 'var(--green)'][i % 5] }} />
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{weight.toFixed(1)}%</span>
                  </div>
                  <span className="num" style={{ color: pnl >= 0 ? 'var(--green)' : 'var(--pink)' }}>
                    {pnl >= 0 ? '+' : ''}{fmtWon(pnl)}<br />
                    <span style={{ fontSize: 11, fontWeight: 400 }}>({pnlRate.toFixed(1)}%)</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
