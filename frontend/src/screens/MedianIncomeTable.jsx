// 2026년 기준 중위소득 (원/월) - 출처: 보건복지부 고시
const BASE = {
  1: 2_564_238,
  2: 4_199_292,
  3: 5_359_036,
  4: 6_494_738,
  5: 7_556_719,
  6: 8_555_952,
};

// % 구간별 복지사업 레이블
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

      {/* 기준값 카드 */}
      <div className="grid-3">
        {[
          { n: 1, won: BASE[1] }, { n: 2, won: BASE[2] }, { n: 3, won: BASE[3] },
          { n: 4, won: BASE[4] }, { n: 5, won: BASE[5] }, { n: 6, won: BASE[6] },
        ].map(({ n, won }) => (
          <div key={n} className="card" style={{ padding: '14px 18px' }}>
            <div className="k">{n}인 가구 · 100%</div>
            <div className="num" style={{ fontSize: 22, marginTop: 6, color: 'var(--purple)' }}>
              {fmt(won)}<span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-3)', marginLeft: 3 }}>원/월</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>{fmtWon(won)}</div>
          </div>
        ))}
      </div>

      {/* 메인 표 */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>

        {/* 헤더 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '52px repeat(6, 1fr)',
          padding: '12px 16px',
          background: 'var(--surface-2)',
          borderBottom: '1px solid var(--line)',
          fontSize: 11, color: 'var(--text-3)', fontWeight: 700,
          letterSpacing: '0.04em', textTransform: 'uppercase',
          gap: 0,
        }}>
          <span>비율</span>
          {[1,2,3,4,5,6].map(n => (
            <span key={n} style={{ textAlign: 'right' }}>{n}인 가구</span>
          ))}
        </div>

        {/* 데이터 행 */}
        {ROWS.map((row) => (
          <div
            key={row.pct}
            style={{
              display: 'grid',
              gridTemplateColumns: '52px repeat(6, 1fr)',
              padding: '11px 16px',
              borderBottom: '1px solid var(--line)',
              background: row.highlight ? 'rgba(108,63,197,0.05)' : 'transparent',
              gap: 0,
              alignItems: 'center',
            }}
          >
            {/* 비율 */}
            <span className="num" style={{
              fontSize: 14,
              fontWeight: row.highlight ? 800 : 600,
              color: row.color,
            }}>
              {row.label}
            </span>

            {/* 1~6인 금액 */}
            {[1,2,3,4,5,6].map(n => {
              const won = Math.round(BASE[n] * row.pct / 100);
              return (
                <span key={n} className="num" style={{
                  textAlign: 'right', fontSize: 12,
                  fontWeight: row.highlight ? 700 : 400,
                  color: row.highlight ? 'var(--purple)' : 'var(--text)',
                }}>
                  {won.toLocaleString()}
                </span>
              );
            })}
          </div>
        ))}
      </div>

      {/* 정확한 수치 표 (100% 기준) */}
      <div className="card">
        <div className="k" style={{ marginBottom: 14 }}>100% 기준 정확한 수치 (원/월)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
          {[1,2,3,4,5,6].map(n => (
            <div key={n} style={{ padding: '12px 14px', background: 'var(--surface-2)',
              borderRadius: 12, border: '1px solid var(--line)' }}>
              <div className="k" style={{ marginBottom: 6 }}>{n}인 가구</div>
              <div className="num" style={{ fontSize: 15, color: 'var(--purple)' }}>
                {BASE[n].toLocaleString()}원
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card dim" style={{ padding: '10px 16px', fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>
        ※ 출처: 보건복지부 2026년 기준 중위소득 고시 · 복지사업 기준은 사업마다 다를 수 있으며 참고용입니다
      </div>
    </>
  );
}
