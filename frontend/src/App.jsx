import { useState } from 'react';
import './cal-styles.css';
import { Sidebar } from './components/Shared';
import NetWorthCalculator       from './screens/NetWorthCalculator';
import EtfCalculator            from './screens/EtfCalculator';
import RetirementCalculator     from './screens/RetirementCalculator';
import BillionCalculator        from './screens/BillionCalculator';
import StockAverageCalculator   from './screens/StockAverageCalculator';
import SalaryCalculator         from './screens/SalaryCalculator';
import MedianIncomeTable        from './screens/MedianIncomeTable';

const VALID_SCREENS = ['networth', 'etf', 'retirement', 'billion', 'stock', 'salary', 'median'];

const BASE_URL = 'https://moatda.onrender.com';

const SCREEN_META = {
  networth: {
    title: '순자산 계산기 | 모았다',
    description: '자산과 부채를 입력해 순자산과 부채비율, 재무 건강도를 확인하세요. 2026년 기준 재무 상태를 한눈에 파악할 수 있습니다.',
  },
  etf: {
    title: 'ETF 적립식 계산기 | 모았다',
    description: '월 투자금, 수익률, 투자 기간을 입력해 ETF 적립식 투자 결과를 계산하세요. 10억까지 걸리는 기간과 예상 자산을 확인할 수 있습니다.',
  },
  retirement: {
    title: '은퇴 가능 계산기 | 모았다',
    description: '현재 자산과 월 저축액으로 은퇴에 필요한 자산과 은퇴 가능 시기를 계산하세요. 4% 룰 기반 은퇴 시뮬레이션.',
  },
  billion: {
    title: '10억까지 얼마나 | 모았다',
    description: '현재 자산과 월 저축액, 수익률을 입력하면 10억을 모으는 데 걸리는 기간을 계산해드립니다.',
  },
  stock: {
    title: '주식 물타기 계산기 | 모았다',
    description: '주식 물타기 시 평균 매입 단가와 손익분기점을 계산하세요. 추가 매수 후 수익률을 한눈에 확인할 수 있습니다.',
  },
  salary: {
    title: '2026 연봉 실수령액 표 | 모았다',
    description: '2026년 기준 연봉별 월 실수령액, 국민연금, 건강보험, 고용보험, 소득세를 한눈에 확인하세요. 1,000만원~15,000만원 전체 수록.',
  },
  median: {
    title: '2026 기준 중위소득 표 | 모았다',
    description: '2026년 보건복지부 고시 기준 중위소득과 복지사업별 소득 기준(50%~200%)을 가구원수별로 확인하세요.',
  },
};

function updateMeta(screenId) {
  const meta = SCREEN_META[screenId];
  if (!meta) return;
  const url = `${BASE_URL}/?screen=${screenId}`;

  document.title = meta.title;

  const setMeta = (sel, attr, val) => {
    const el = document.querySelector(sel);
    if (el) el.setAttribute(attr, val);
  };

  setMeta('meta[name="description"]',       'content', meta.description);
  setMeta('meta[property="og:title"]',      'content', meta.title);
  setMeta('meta[property="og:description"]','content', meta.description);
  setMeta('meta[property="og:url"]',        'content', url);
  setMeta('link[rel="canonical"]',          'href',    url);
  setMeta('meta[name="twitter:title"]',     'content', meta.title);
  setMeta('meta[name="twitter:description"]','content', meta.description);
}

function trackPageView(screenId) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', 'page_view', {
    page_title:    SCREEN_META[screenId]?.title ?? screenId,
    page_location: window.location.href,
    page_path:     `/?screen=${screenId}`,
  });
}

function getInitialScreen() {
  const sp = new URLSearchParams(window.location.search);
  const s = sp.get('screen');
  return VALID_SCREENS.includes(s) ? s : 'networth';
}

export default function App() {
  const [active, setActive] = useState(() => {
    const s = getInitialScreen();
    trackPageView(s);
    return s;
  });

  const handleNavigate = (id) => {
    setActive(id);
    const sp = new URLSearchParams(window.location.search);
    sp.set('screen', id);
    window.history.pushState(null, '', `?${sp}`);
    trackPageView(id);
  };

  const screen = {
    networth:   <NetWorthCalculator />,
    etf:        <EtfCalculator />,
    retirement: <RetirementCalculator />,
    billion:    <BillionCalculator />,
    stock:      <StockAverageCalculator />,
    salary:     <SalaryCalculator />,
    median:     <MedianIncomeTable />,
  }[active];

  return (
    <div className="app-frame">
      <Sidebar active={active} onNavigate={handleNavigate} />
      <main className="main scroll">
        {screen}
        <div style={{ flexShrink: 0, textAlign: 'center', paddingTop: 4 }}>
          <ins className="kakao_ad_area" style={{ display: 'none' }}
            data-ad-unit="DAN-h3Ve3xuRRLMmQhQr"
            data-ad-width="320"
            data-ad-height="50" />
        </div>
      </main>
    </div>
  );
}
