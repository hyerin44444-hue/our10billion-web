function Field({ label, value, unit, hint }) {
  return (
    <div>
      <div className="field-label">{label}</div>
      <div className="input">
        <span style={{ fontWeight: 600 }}>{value}</span>
        <span className="unit">{unit}</span>
      </div>
      {hint && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

function Group({ icon, title, sub, color, children, complete }) {
  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div className={`dot ${color}`} style={{ width: 30, height: 30, fontSize: 14 }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{title}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{sub}</div>
        </div>
        {complete && <span className="chip green">✓ 완료</span>}
      </div>
      <div style={{ display: 'grid', gap: 12 }}>{children}</div>
    </div>
  );
}

export default function Inputs() {
  return (
    <>
      <div className="topbar">
        <div className="left">
          <div>
            <div className="title">우리 부부 자산 정보</div>
            <div className="sub">언제든 수정 가능 · 자동 저장됨 · 6개 그룹 / 4개 완료</div>
          </div>
        </div>
        <div className="right">
          <span className="chip">취소</span>
          <button className="pill-btn"><span className="plus">↻</span>다시 시뮬레이션</button>
        </div>
      </div>

      {/* Progress strip */}
      <div className="card dim" style={{ padding: '14px 18px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <div className="k" style={{ marginBottom: 6 }}>완성도 67%</div>
            <div style={{ height: 8, background: 'rgba(0,0,0,0.18)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: '67%', height: '100%', background: 'linear-gradient(90deg, var(--pink), var(--purple))' }}></div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span className="chip green">✓ 기본</span>
            <span className="chip green">✓ 자산</span>
            <span className="chip green">✓ 투자</span>
            <span className="chip green">✓ 주택</span>
            <span className="chip orange">○ 가족계획</span>
            <span className="chip pink">○ 은퇴목표</span>
          </div>
        </div>
      </div>

      <div className="grid-3">
        <Group icon="👥" title="기본 정보" sub="부부 기본 사항" color="pink" complete>
          <Field label="남편 나이" value="34" unit="세" />
          <Field label="아내 나이" value="32" unit="세" />
          <Field label="월 합산 소득 (세후)" value="780" unit="만원" hint="고정 + 변동 평균" />
          <Field label="결혼 연차" value="4" unit="년차" />
        </Group>

        <Group icon="💰" title="현재 자산" sub="현금성 + 예적금" color="pink" complete>
          <Field label="현금 / CMA" value="3,400" unit="만원" />
          <Field label="예적금" value="9,000" unit="만원" />
          <Field label="긴급 자금" value="2,000" unit="만원" hint="6개월 생활비" />
        </Group>

        <Group icon="📈" title="투자 / 연금" sub="주식 · 펀드 · 연금" color="orange" complete>
          <Field label="주식 / 펀드" value="3,800" unit="만원" />
          <Field label="국민연금 예상" value="2,100" unit="만원" />
          <Field label="퇴직연금 IRP" value="3,800" unit="만원" />
          <Field label="기대 수익률" value="5.5" unit="%/년" />
        </Group>

        <Group icon="🏠" title="주택 / 대출" sub="자가 보유" color="purple" complete>
          <Field label="주택 시세 (현재)" value="78,000" unit="만원" />
          <Field label="주담대 잔액" value="42,000" unit="만원" />
          <Field label="월 상환" value="180" unit="만원" />
          <Field label="대출 만기" value="2049" unit="년 (23년 남음)" />
        </Group>

        <Group icon="👶" title="가족 계획" sub="자녀 + 부양" color="yellow">
          <Field label="현재 자녀" value="1명 (3세)" unit="" />
          <Field label="추가 출산 계획" value="2027년 둘째" unit="" />
          <Field label="자녀 교육 수준" value="공교육 + 학원" unit="월 80만~" />
          <Field label="부모님 부양" value="월 50만 (2030~)" unit="" />
        </Group>

        <Group icon="🌴" title="은퇴 목표" sub="가장 중요한 부분" color="purple-o">
          <Field label="은퇴 나이" value="58" unit="세" />
          <Field label="은퇴 후 월 생활비" value="380" unit="만원" />
          <Field label="기대 수명" value="88" unit="세" />
          <Field label="유산 목표" value="자녀 1인당 1억" unit="" />
        </Group>
      </div>

      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div className="dot purple" style={{ width: 36, height: 36, fontSize: 18 }}>💡</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>가족계획과 은퇴목표만 더 채우면 분석이 더 정확해져요</div>
          <div style={{ fontSize: 13, color: 'var(--text-3)' }}>약 2분 소요 · 자녀 시나리오 비교가 잠금 해제됩니다</div>
        </div>
        <button className="pill-btn">다음 단계 이어가기</button>
      </div>
    </>
  );
}
