import { useMemo } from 'react';
import { MiniArea } from '../components/Shared';

function Knob({ label, cur, opts }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{label}</span>
      <div className="seg">
        {opts.map(o => (
          <button key={o} className={o === cur ? 'on' : ''}>{o}</button>
        ))}
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 12, height: 12, borderRadius: 4, background: color }}></span>
      {label}
    </span>
  );
}

function Delta({ label, v, muted }) {
  return (
    <div className="card">
      <div className="k">{label}</div>
      <div className="num" style={{ fontSize: 24, marginTop: 6, color: muted ? 'var(--text-2)' : 'var(--green)' }}>{v}</div>
    </div>
  );
}

function OverlayChart() {
  const pts = 30;
  const seriesA = useMemo(() => Array.from({ length: pts }, (_, i) => 0.22 + i * 0.028 + Math.sin(i * 0.4) * 0.01), []);
  const seriesB = useMemo(() => Array.from({ length: pts }, (_, i) => 0.18 + i * 0.024 + Math.sin(i * 0.55) * 0.012), []);
  const seriesC = useMemo(() => Array.from({ length: pts }, (_, i) => 0.20 + i * 0.030 + Math.sin(i * 0.5) * 0.008), []);
  const W = 820, H = 240;
  const max = Math.max(...seriesC) * 1.15;
  const x = (i) => (i / (pts - 1)) * (W - 40) + 20;
  const y = (v) => H - 30 - (v / max) * (H - 60);
  const mk = (s) => s.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      {[0.25, 0.5, 0.75].map((p, i) => (
        <line key={i} x1="20" x2={W - 20} y1={30 + (H - 60) * p} y2={30 + (H - 60) * p}
          stroke="rgba(0,0,0,0.07)" strokeWidth="1" />
      ))}
      <path d={mk(seriesA)} stroke="var(--blue)" strokeWidth="2.2" fill="none" />
      <path d={mk(seriesB)} stroke="var(--purple)" strokeWidth="2.8" fill="none" />
      <path d={mk(seriesC)} stroke="var(--green)" strokeWidth="2.2" fill="none" />
      <circle cx={x(pts - 1)} cy={y(seriesA[pts - 1])} r="5" fill="var(--blue)" stroke="#fff" strokeWidth="2" />
      <circle cx={x(pts - 1)} cy={y(seriesB[pts - 1])} r="5" fill="var(--purple)" stroke="#fff" strokeWidth="2" />
      <circle cx={x(pts - 1)} cy={y(seriesC[pts - 1])} r="5" fill="var(--green)" stroke="#fff" strokeWidth="2" />
      {[0, 8, 16, 24, 29].map(i => (
        <text key={i} x={x(i)} y={H - 10} fontSize="11" textAnchor="middle"
          fill="rgba(0,0,0,0.4)" fontFamily="Inter">{2026 + i}</text>
      ))}
    </svg>
  );
}

const SCENARIOS = [
  {
    tag: 'A', name: '안전 모드', color: 'var(--blue)', dot: 'blue',
    desc: '둘째 X · 현재 투자 유지',
    stats: [['50세 자산', '17.2억'], ['은퇴 자산', '24.8억'], ['교육비', '1.2억'], ['적자구간', '없음']],
    notes: '가장 안정. 자녀 1명, 외벌이 리스크 잔존.',
  },
  {
    tag: 'B', name: '현재 계획', color: 'var(--purple)', dot: 'purple',
    desc: '둘째 O · 투자 현재 유지 · 부양 O',
    stats: [['50세 자산', '14.8억'], ['은퇴 자산', '21.4억'], ['교육비', '2.3억'], ['적자구간', '4년']],
    notes: '현재 입력값. 42-46 적자 구간 주의.',
    current: true,
  },
  {
    tag: 'C', name: '공격 모드', color: 'var(--green)', dot: 'green-o',
    desc: '둘째 O · 월 +50만 투자 · 부양 O',
    stats: [['50세 자산', '17.9억'], ['은퇴 자산', '26.1억'], ['교육비', '2.3억'], ['적자구간', '없음']],
    notes: '여유 -50만 부담. 적자 구간 사라짐.',
  },
];

export default function Compare() {
  return (
    <>
      <div className="topbar">
        <div className="left">
          <div>
            <div className="title">시나리오 비교</div>
            <div className="sub">3개 비교 중 · 같은 가정 위에서 차이만 보기</div>
          </div>
        </div>
        <div className="right">
          <span className="chip">변수 조절</span>
          <button className="pill-btn"><span className="plus">+</span>시나리오 추가</button>
        </div>
      </div>

      {/* Variable knobs */}
      <div className="card dim" style={{ padding: '14px 18px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <div className="k">바꿔볼 변수</div>
          <Knob label="자녀"    cur="2명"  opts={['0명', '1명', '2명', '3명']} />
          <Knob label="월 투자" cur="+50"  opts={['-50', '현재', '+30', '+50', '+100']} />
          <Knob label="은퇴 나이" cur="58" opts={['50', '55', '58', '60', '65']} />
          <Knob label="주택"    cur="보유" opts={['보유', '매도', '다운사이즈']} />
          <Knob label="수익률"  cur="5.5%" opts={['3%', '5.5%', '7%']} />
        </div>
      </div>

      {/* 3-up cards */}
      <div className="grid-3">
        {SCENARIOS.map((s, i) => (
          <div key={i} className="card" style={{
            padding: 0, overflow: 'hidden',
            outline: s.current ? `2px solid ${s.color}` : 'none',
            position: 'relative',
          }}>
            {s.current && (
              <div style={{
                position: 'absolute', top: 12, right: 12,
                background: s.color, color: 'var(--on-light)',
                padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
              }}>현재</div>
            )}
            <div style={{ padding: '18px 20px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div className={`dot ${s.dot}`} style={{ width: 28, height: 28, fontSize: 12 }}>{s.tag}</div>
                <div style={{ fontWeight: 700, fontSize: 17 }}>{s.name}</div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-3)' }}>{s.desc}</div>
            </div>

            <div style={{ padding: '0 12px 8px' }}>
              <div style={{ background: 'var(--surface-2)', borderRadius: 12, padding: 10 }}>
                <MiniArea width={260} height={80} accent={s.color} />
              </div>
            </div>

            <div style={{ padding: '8px 20px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {s.stats.map(([k, v], j) => (
                <div key={j} style={{ borderTop: '1px solid var(--line)', paddingTop: 8 }}>
                  <div className="k" style={{ fontSize: 11 }}>{k}</div>
                  <div className="num" style={{ fontSize: 18, marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>

            <div style={{ padding: '12px 20px 18px', background: 'var(--surface-2)', fontSize: 13, color: 'var(--text-2)' }}>
              {s.notes}
            </div>
          </div>
        ))}
      </div>

      {/* Overlay comparison chart */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <div className="k">순자산 곡선 — 세 시나리오</div>
            <div style={{ fontSize: 17, fontWeight: 700, marginTop: 2 }}>2026 → 2055</div>
          </div>
          <div style={{ display: 'flex', gap: 14, fontSize: 13 }}>
            <Legend color="var(--blue)"   label="A 안전" />
            <Legend color="var(--purple)" label="B 현재" />
            <Legend color="var(--green)"  label="C 공격" />
          </div>
        </div>
        <OverlayChart />
      </div>

      {/* Delta row */}
      <div className="grid-4">
        <Delta label="50세 자산 (C vs B)" v="+3.1억" />
        <Delta label="은퇴 자산 (C vs B)" v="+4.7억" />
        <Delta label="대출 종료"          v="동일 2049" muted />
        <Delta label="적자 구간 (C vs B)" v="4년 → 0" />
      </div>
    </>
  );
}
