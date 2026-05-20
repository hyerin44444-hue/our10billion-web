import { MiniArea } from '../components/Shared';

const TAG_COLORS = {
  today:  'var(--blue)',
  pink:   'var(--pink)',
  purple: 'var(--purple)',
  green:  'var(--green)',
  orange: 'var(--orange)',
  yellow: 'var(--yellow)',
};

function Pill({ k, v }) {
  return (
    <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '6px 10px', textAlign: 'left' }}>
      <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{k}</div>
      <div className="num" style={{ fontSize: 13 }}>{v}</div>
    </div>
  );
}

function EventCard({ e, color, align }) {
  return (
    <div className="card" style={{
      padding: '16px 18px',
      marginLeft: align === 'left' ? 14 : 0,
      marginRight: align === 'right' ? 14 : 0,
      borderLeft: align === 'left' ? `4px solid ${color}` : '0',
      borderRight: align === 'right' ? `4px solid ${color}` : '0',
      textAlign: align === 'right' ? 'right' : 'left',
    }}>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{e.title}</div>
      <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: e.impact ? 12 : 0 }}>{e.sub}</div>
      {e.impact && (
        <div style={{ display: 'flex', gap: 10, justifyContent: align === 'right' ? 'flex-end' : 'flex-start', flexWrap: 'wrap' }}>
          <Pill k="순자산" v={e.impact.net} />
          <Pill k="현금흐름" v={e.impact.cash} />
          <Pill k="기간" v={e.impact.dur} />
        </div>
      )}
    </div>
  );
}

const EVENTS = [
  { year: 2026, age: '34/32', title: '오늘 — 시작점', sub: '순자산 1.86억 · 월 흑자 +178만', tag: 'today', icon: '🚩', side: 'right' },
  { year: 2027, age: '35/33', title: '둘째 출산', sub: '아내 1년 휴직, 출산·산후 -2,800만 · 이후 점진 회복', tag: 'pink', icon: '👶', side: 'left',
    impact: { net: '-2,800만', cash: '월 -120만', dur: '12개월' } },
  { year: 2030, age: '38/36', title: '부모님 부양 시작', sub: '매월 50만원 송금 · 2045년까지 가정', tag: 'purple', icon: '🤝', side: 'right',
    impact: { net: '-9,000만 누적', cash: '월 -50만', dur: '15년' } },
  { year: 2033, age: '41/39', title: '아내 이직 · 소득 +120만', sub: '월 합산 900만으로 상승 · 투자액 +50만 가능', tag: 'green', icon: '📈', side: 'left',
    impact: { net: '+5.4억 (장기)', cash: '월 +120만', dur: '~은퇴' } },
  { year: 2038, age: '46/44', title: '🎉 주담대 완납', sub: '월 180만이 그대로 저축으로 전환', tag: 'orange', icon: '🏠', side: 'right',
    impact: { net: '4.2억 부채 0', cash: '월 +180만', dur: '영구' } },
  { year: 2042, age: '50/48', title: '50세 — 자녀 교육 피크', sub: '큰애 대학 입학 · 둘째 고등학생 · 월 -180만 교육비', tag: 'yellow', icon: '🎓', side: 'left',
    impact: { net: '14.8억', cash: '월 -180만', dur: '4년' } },
  { year: 2050, age: '58/56', title: '🌴 은퇴', sub: '예상 순자산 21.4억 · 월 380만 생활 가능', tag: 'purple', icon: '🌴', side: 'right',
    impact: { net: '21.4억', cash: '연금 월 290만', dur: '~88세' } },
];

export default function Timeline() {
  return (
    <>
      <div className="topbar">
        <div className="left">
          <div>
            <div className="title">인생 타임라인</div>
            <div className="sub">오늘부터 은퇴 후까지 · 클릭하면 영향 분석</div>
          </div>
        </div>
        <div className="right">
          <div className="seg">
            <button>가로</button>
            <button className="on">세로</button>
            <button>달력</button>
          </div>
          <button className="pill-btn"><span className="plus">+</span>이벤트 추가</button>
        </div>
      </div>

      {/* Mini overview strip */}
      <div className="card hero" style={{ padding: '18px 24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div>
            <div className="k-light">시작 → 50세 → 은퇴</div>
            <div style={{ display: 'flex', gap: 20, marginTop: 6, alignItems: 'baseline' }}>
              <div><span className="num" style={{ fontSize: 28 }}>1.86억</span> <span style={{ color: 'var(--on-light-3)', fontSize: 13 }}>오늘</span></div>
              <span style={{ color: 'var(--on-light-3)' }}>→</span>
              <div><span className="num" style={{ fontSize: 28 }}>14.8억</span> <span style={{ color: 'var(--on-light-3)', fontSize: 13 }}>50세</span></div>
              <span style={{ color: 'var(--on-light-3)' }}>→</span>
              <div><span className="num" style={{ fontSize: 28, color: 'var(--on-light)' }}>21.4억</span> <span style={{ color: 'var(--on-light-3)', fontSize: 13 }}>은퇴</span></div>
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.55)', borderRadius: 14, padding: 8, width: 360 }}>
            <MiniArea width={340} height={70} />
          </div>
        </div>
      </div>

      {/* Vertical timeline */}
      <div style={{ position: 'relative', padding: '20px 0' }}>
        {/* Center rail */}
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, background: 'rgba(255,255,255,0.10)' }}></div>

        {EVENTS.map((e, i) => {
          const color = TAG_COLORS[e.tag];
          const isLeft = e.side === 'left';
          return (
            <div key={i} style={{
              position: 'relative', minHeight: 110,
              display: 'grid', gridTemplateColumns: '1fr 60px 1fr',
              alignItems: 'center', marginBottom: 10,
            }}>
              {isLeft ? <EventCard e={e} color={color} align="right" /> : <div></div>}

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div className="dot" style={{
                  width: 44, height: 44, background: color,
                  fontSize: 18, border: '3px solid var(--bg)', boxShadow: `0 0 0 2px ${color}`,
                }}>{e.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{e.year}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{e.age}세</div>
              </div>

              {!isLeft ? <EventCard e={e} color={color} align="left" /> : <div></div>}
            </div>
          );
        })}
      </div>
    </>
  );
}
