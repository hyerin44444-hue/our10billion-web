import { useState } from 'react';
import './cal-styles.css';
import { Sidebar } from './components/Shared';
import NetWorthCalculator       from './screens/NetWorthCalculator';
import EtfCalculator            from './screens/EtfCalculator';
import RetirementCalculator     from './screens/RetirementCalculator';
import BillionCalculator        from './screens/BillionCalculator';
import StockAverageCalculator   from './screens/StockAverageCalculator';

const VALID_SCREENS = ['networth', 'etf', 'retirement', 'billion', 'stock'];

function getInitialScreen() {
  const sp = new URLSearchParams(window.location.search);
  const s = sp.get('screen');
  return VALID_SCREENS.includes(s) ? s : 'networth';
}

export default function App() {
  const [active, setActive] = useState(getInitialScreen);

  const handleNavigate = (id) => {
    setActive(id);
    const sp = new URLSearchParams(window.location.search);
    sp.set('screen', id);
    window.history.pushState(null, '', `?${sp}`);
  };

  const screen = {
    networth:   <NetWorthCalculator />,
    etf:        <EtfCalculator />,
    retirement: <RetirementCalculator />,
    billion:    <BillionCalculator />,
    stock:      <StockAverageCalculator />,
  }[active];

  return (
    <div className="app-frame">
      <Sidebar active={active} onNavigate={handleNavigate} />
      <main className="main scroll">
        {screen}
      </main>
    </div>
  );
}
