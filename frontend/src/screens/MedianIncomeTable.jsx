import { useState } from 'react';
import { AdFitBanner } from '../components/Shared';

// 2026년 기준 중위소득 (원/월) - 출처: 보건복지부 고시
const BASE = {
  1: 2_564_238,
  2: 4_199_292,
  3: 5_359_036,
  4: 6_494_738,
  5: 7_556_719,
  6: 8_555_952,
};

const ROWS = [
  { pct: 50,  label: '50%',  program: '교육급여 / 차상위계층',  color: '#f57c00' },
  { pct: 60,  label: '60%',  program: '차상위 복지사업',         color: '#f57c00' },
  { pct: 65,  label: '65%',  program: '한부모가족 지원',         color: '#f57c00' },
  { pct: 72,  label: '72%',  program: '청년도약계좌 (일부)',     color: '#f39c12' },
  { pct: 75,  label: '75%',  program: '긴급복지 지원기준',       color: '#f39c12' },
  { pct: 80,  label: '80%',  program: '청년 지원사업',           color: '#f39c12' },
  { pct: 100, label: '100%', program: '기준 중위소득',           color: '#6c3fc5', highlight: true },
  { pct: 120, label: '120%', program: '문화누리카드 등',         color: '#2980b9' },
  { pct: 130, label: '130%', program: '청년 주거 지원',          color: '#2980b9' },
  { pct: 150, label: '150%', program: '건강보험료 경감 기준',    color: '#2980b9' },
  { pct: 180, label: '180%', program: '국가장학금 2구간',        color: '#27ae60' },
  { pct: 200, label: '200%', program: '국가장학금 3구간',        color: '#27ae60' },
];

function fmt(won) {
  const man = won / 10000;
  if (man >= 10000) return `${(man / 10000).toFixed(2)}억`;
  return man.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '만';
}

function fmtWon(won) {
  return won.toLocaleString() + '원';
}

export default function MedianIncomeTable() {
  const [household, setHousehold] = useState(1);

  return (
    <>
      <div className="topbar">
        <div className="left">
          <div>
            <div className="title">기준 중위소득 표</div>
            <div className="sub">2026년 기준 · 보건복지부 고시 · 복지사업별 소득 기준</div>
          </div>
        </div>
      </div>

      <AdFitBanner />

      {/* 모바일: 가구원 수 선택 + 기준액 표시 */}
      <div className="median-household-sel">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
          <span style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 600 }}>가구원 수</span>
          <div className="seg">
            {[1,2,3,4,5,6].map(n => (
              <button key={n} className={household === n ? 'on' : ''} onClick={() => setHousehold(n)}>
                {n}인
              </button>
            ))}
          </div>
        </div>
        <div className="card" style={{ padding: '14px 18px', width: '100%' }}>
          <div className="k">{household}인 가구 · 기준 중위소득 (100%)</div>
          <div className="num" style={{ fontSize: 28, marginTop: 6, color: 'var(--purple)' }}>
            {BASE[household].toLocaleString()}
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-3)', marginLeft: 4 }}>원/월</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
            {fmt(BASE[household])}원/월
          </div>
        </div>
      </div>


      {/* 데스크탑: 전체 표 */}
      <div className="card median-table-desktop" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '52px repeat(6, 1fr)',
          padding: '12px 16px', background: 'var(--surface-2)',
          borderBottom: '1px solid var(--line)',
          fontSize: 11, color: 'var(--text-3)', fontWeight: 700,
          letterSpacing: '0.04em', textTransform: 'uppercase', gap: 0,
        }}>
          <span>비율</span>
          {[1,2,3,4,5,6].map(n => (
            <span key={n} style={{ textAlign: 'right' }}>{n}인 가구</span>
          ))}
        </div>
        {ROWS.map((row) => (
          <div key={row.pct} style={{
            display: 'grid', gridTemplateColumns: '52px repeat(6, 1fr)',
            padding: '11px 16px', borderBottom: '1px solid var(--line)',
            background: row.highlight ? 'rgba(108,63,197,0.05)' : 'transparent',
            gap: 0, alignItems: 'center',
          }}>
            <span className="num" style={{ fontSize: 14, fontWeight: row.highlight ? 800 : 600, color: row.color }}>
              {row.label}
            </span>
            {[1,2,3,4,5,6].map(n => (
              <span key={n} className="num" style={{
                textAlign: 'right', fontSize: 12,
                fontWeight: row.highlight ? 700 : 400,
                color: row.highlight ? 'var(--purple)' : 'var(--text)',
              }}>
                {Math.round(BASE[n] * row.pct / 100).toLocaleString()}
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* 모바일: 선택된 가구원 수만 표시 */}
      <div className="card median-table-mobile" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '60px 1fr',
          padding: '12px 16px', background: 'var(--surface-2)',
          borderBottom: '1px solid var(--line)',
          fontSize: 11, color: 'var(--text-3)', fontWeight: 700,
          letterSpacing: '0.04em', textTransform: 'uppercase', gap: 0,
        }}>
          <span>비율</span>
          <span style={{ textAlign: 'right' }}>{household}인 가구</span>
        </div>
        {ROWS.map((row) => {
          const won = Math.round(BASE[household] * row.pct / 100);
          return (
            <div key={row.pct} style={{
              display: 'grid', gridTemplateColumns: '60px 1fr',
              padding: '11px 16px', borderBottom: '1px solid var(--line)',
              background: row.highlight ? 'rgba(108,63,197,0.05)' : 'transparent',
              gap: 0, alignItems: 'center',
            }}>
              <span className="num" style={{ fontSize: 14, fontWeight: row.highlight ? 800 : 600, color: row.color }}>
                {row.label}
              </span>
              <span className="num" style={{
                textAlign: 'right', fontSize: 13,
                fontWeight: row.highlight ? 700 : 500,
                color: row.highlight ? 'var(--purple)' : 'var(--text)',
              }}>
                {won.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>

      <div className="card dim" style={{ padding: '10px 16px', fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>
        ※ 출처: 보건복지부 2026년 기준 중위소득 고시 · 복지사업 기준은 사업마다 다를 수 있으며 참고용입니다
      </div>
    </>
  );
}
