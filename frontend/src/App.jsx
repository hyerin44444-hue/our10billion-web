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

const SCREEN_TITLES = {
  networth:   '순자산 계산기',
  etf:        'ETF 적립식 계산기',
  retirement: '은퇴 가능 계산기',
  billion:    '10억까지 얼마나',
  stock:      '주식 물타기 계산기',
  salary:     '연봉 실수령액 표',
  median:     '기준 중위소득 표',
};

function trackPageView(screenId) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', 'page_view', {
    page_title:    SCREEN_TITLES[screenId] ?? screenId,
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
