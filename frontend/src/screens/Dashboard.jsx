import { AreaChart, DonutBreakdown } from '../components/Shared';

export default function Dashboard() {
  return (
    <>
      <div className="topbar">
        <div className="left">
          <div>
            <div className="title">안녕하세요, 민수 · 지영님 👋</div>
            <div className="sub">오늘은 2026년 5월 20일 · 결혼 4년차 · 자녀 1명</div>
          </div>
        </div>
        <div className="right">
          <div className="searchbar">
            <span>🔍</span><span>이벤트, 자산, 시나리오 검색…</span>
          </div>
          <div className="seg">
            <button>월</button>
            <button className="on">연</button>
            <button>10년</button>
            <button>평생</button>
          </div>
          <div style={{ display: 'flex' }}>
            <div className="avatar">민</div>
            <div className="avatar stack" style={{ background: 'linear-gradient(135deg, var(--purple), var(--blue))' }}>지</div>
          </div>
        </div>
      </div>

      {/* Hero pastel card */}
      <div className="card hero">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <div className="k-light">50세 예상 순자산 · 2042년</div>
            <div className="num" style={{ fontSize: 56, lineHeight: 1.05, marginTop: 6 }}>
              14.8<span style={{ fontSize: 28, fontWeight: 600, color: 'var(--on-light-2)', marginLeft: 2 }}>억원</span>
            </div>
            <div style={{ marginTop: 6, display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="chip light"><span className="delta-up">↑</span> 오늘 대비 +11.6억</span>
              <span className="chip light">목표 18억 대비 82%</span>
            </div>
          </div>
          <button className="pill-btn dark"><span className="plus" style={{ color: '#fff' }}>+</span>새 시나리오</button>
        </div>
        <div style={{ marginTop: 8, background: 'rgba(255,255,255,0.55)', borderRadius: 14, padding: 10 }}>
          <AreaChart width={820} height={200} />
        </div>
      </div>

      {/* Stat row */}
      <div className="grid-4">
        <div className="card">
          <div className="k">은퇴 (58세) 자산</div>
          <div className="num" style={{ fontSize: 28, marginTop: 6 }}>21.4억</div>
          <div style={{ marginTop: 8 }}><span className="delta-up">목표 +18%</span></div>
        </div>
        <div className="card">
          <div className="k">대출 종료</div>
          <div className="num" style={{ fontSize: 28, marginTop: 6 }}>2049년</div>
          <div style={{ marginTop: 8, color: 'var(--text-3)', fontSize: 13 }}>월 180만 상환 중</div>
        </div>
        <div className="card">
          <div className="k">월 흑자</div>
          <div className="num" style={{ fontSize: 28, marginTop: 6, color: 'var(--green)' }}>+178만</div>
          <div style={{ marginTop: 8, color: 'var(--text-3)', fontSize: 13 }}>22.8% 저축률</div>
        </div>
        <div className="card">
          <div className="k">자녀 교육비 (평생)</div>
          <div className="num" style={{ fontSize: 28, marginTop: 6 }}>2.3억</div>
          <div style={{ marginTop: 8, color: 'var(--text-3)', fontSize: 13 }}>2031 – 2046</div>
        </div>
      </div>

      {/* 2-col: breakdown + insights */}
      <div className="grid-2" style={{ gridTemplateColumns: '1.2fr 1fr' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div className="k">현재 자산 구성</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>1.86억 보유</div>
            </div>
            <span className="chip">변동 추이 →</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            <DonutBreakdown
              size={150}
              parts={[
                { v: 12.4, color: 'var(--pink)' },
                { v: 3.8,  color: 'var(--orange)' },
                { v: 5.9,  color: 'var(--purple)' },
                { v: 78,   color: 'var(--green)' },
              ]}
            />
            <div style={{ flex: 1, display: 'grid', gap: 10 }}>
              {[
                ['pink', '현금·예적금', '1.24억', '12%'],
                ['orange', '투자', '3,800만', '4%'],
                ['purple', '연금', '5,900만', '6%'],
                ['green-o', '부동산', '7.8억', '78%'],
              ].map(([c, name, val, pct], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className={`dot ${c}`}></span>
                  <span style={{ flex: 1, fontSize: 14 }}>{name}</span>
                  <span className="num" style={{ fontSize: 14 }}>{val}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-3)', width: 36, textAlign: 'right' }}>{pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card" style={{ background: 'var(--surface-2)' }}>
          <div className="k">오늘의 인사이트</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
            {[
              { dot: 'purple', emoji: '💡', title: '월 30만원만 더 투자하면, 은퇴 자산이 3.2억 늘어요', sub: '현재 220만 → 250만, 같은 5.5% 가정' },
              { dot: 'pink',   emoji: '⚠',  title: '2042-2046 적자 구간 예상', sub: '자녀 두명 대학 시기. 평균 월 -32만원' },
              { dot: 'orange', emoji: '🎯', title: '퇴직연금 IRP, 한도 못 채우는 중', sub: '연 700만 한도 중 480만 납입 · 절세 32만 손해' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
                <div className={`dot ${item.dot}`} style={{ width: 32, height: 32, fontSize: 16, flexShrink: 0 }}>{item.emoji}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming events */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div className="k">다가오는 인생 이벤트</div>
          <span className="chip">전체 타임라인 →</span>
        </div>
        <div className="grid-4">
          {[
            { y: 2027, ev: '둘째 출산',    icon: '👶', tag: 'pink',   amount: '-2,800만' },
            { y: 2030, ev: '부모님 부양',  icon: '🤝', tag: 'purple', amount: '월 -50만' },
            { y: 2033, ev: '아내 이직',    icon: '📈', tag: 'green',  amount: '월 +120만' },
            { y: 2038, ev: '주담대 완납',  icon: '🏠', tag: 'orange', amount: '월 +180만' },
          ].map((e, i) => (
            <div key={i} style={{ padding: 12, borderRadius: 14, background: 'var(--surface-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={`chip ${e.tag}`}>{e.icon} {e.y}</span>
              </div>
              <div style={{ fontWeight: 600, marginTop: 10 }}>{e.ev}</div>
              <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 2 }}>
                예상 영향 <span className="num" style={{ color: 'var(--text-2)' }}>{e.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
