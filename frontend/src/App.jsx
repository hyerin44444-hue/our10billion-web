import { useState } from 'react';
import './cal-styles.css';
import { Sidebar } from './components/Shared';
import NetWorthCalculator    from './screens/NetWorthCalculator';
import EtfCalculator         from './screens/EtfCalculator';
import RetirementCalculator  from './screens/RetirementCalculator';
import BillionCalculator     from './screens/BillionCalculator';

const SCREENS = {
  networth:   <NetWorthCalculator />,
  etf:        <EtfCalculator />,
  retirement: <RetirementCalculator />,
  billion:    <BillionCalculator />,
};

export default function App() {
  const [active, setActive] = useState('networth');

  return (
    <div className="app-frame">
      <Sidebar active={active} onNavigate={setActive} />
      <main className="main scroll">
        {SCREENS[active]}
      </main>
    </div>
  );
}
