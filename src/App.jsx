import React, { useState, useEffect } from 'react';
import WelcomePage from './components/WelcomePage.jsx';
import LoginPage   from './components/LoginPage.jsx';
import NavBar      from './components/NavBar.jsx';
import OverviewTab from './components/OverviewTab.jsx';
import PlanTab     from './components/PlanTab.jsx';
import FinanceTab  from './components/FinanceTab.jsx';
import ProgTab     from './components/ProgTab.jsx';
import AdminTab    from './components/AdminTab.jsx';
import { getRole, setRole as saveRole, logout, loadPTA } from './utils.js';

export default function App() {
  const [screen,   setScreen]   = useState('welcome'); // welcome | login | dashboard
  const [loginRole,setLoginRole]= useState(null);
  const [role,     setRole]     = useState(() => getRole());
  const [tab,      setTab]      = useState('menu');
  const [rawData,  setRawData]  = useState(null);
  const [kpis,     setKpis]     = useState(null);
  const [fileName, setFileName] = useState(null);
  const [lastDate, setLastDate] = useState(null);
  const [serverLoading, setServerLoading] = useState(false);

  // On mount: restore session or show welcome
  useEffect(() => {
    const r = getRole();
    if (r) {
      setRole(r);
      setScreen('dashboard');
      fetchServerData();
    }
  }, []);

  const fetchServerData = async () => {
    setServerLoading(true);
    try {
      const data = await loadPTA();
      if (data) {
        setRawData(data.rawData);
        setKpis(data.kpis);
        setFileName(data.fileName);
        setLastDate(data.date);
      }
    } catch {}
    finally { setServerLoading(false); }
  };

  const handleChoice = (r) => {
    setLoginRole(r);
    setScreen('login');
  };

  const handleLoginSuccess = (r) => {
    setRole(r);
    setScreen('dashboard');
    fetchServerData();
  };

  const handleLogout = () => {
    logout();
    setRole(null);
    setRawData(null);
    setKpis(null);
    setFileName(null);
    setLastDate(null);
    setTab('menu');
    setScreen('welcome');
  };

  const handleDataLoaded = (raw, kpiData, name, date) => {
    setRawData(raw);
    setKpis(kpiData);
    setFileName(name);
    setLastDate(date);
  };

  const isAdmin = role === 'admin';

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>
      <div className="top-rule" />

      {screen === 'welcome' && <WelcomePage onChoice={handleChoice} />}

      {screen === 'login' && (
        <LoginPage
          role={loginRole}
          onSuccess={handleLoginSuccess}
          onBack={() => setScreen('welcome')}
        />
      )}

      {screen === 'dashboard' && (
        <>
          <NavBar
            activeTab={tab}
            onTab={setTab}
            isAdmin={isAdmin}
            fileName={fileName}
            onLogout={handleLogout}
          />

          <div style={{ flex:1, overflow:'auto', padding:'20px 28px', display:'flex', flexDirection:'column', gap:14 }}>
            {serverLoading && (
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'var(--blue-light)', border:'1px solid #a0bde0', borderRadius:'var(--r-m)', fontSize:11.5, color:'var(--blue)' }}>
                <span className="spinner" style={{ width:14, height:14 }} />
                Chargement des données…
              </div>
            )}

            {tab === 'menu'    && <OverviewTab kpis={kpis} />}
            {tab === 'plan'    && <PlanTab     rawData={rawData} />}
            {tab === 'finance' && <FinanceTab  kpis={kpis} />}
            {tab === 'prog'    && <ProgTab     rawData={rawData} />}
            {tab === 'admin'   && isAdmin && (
              <AdminTab
                kpis={kpis}
                fileName={fileName}
                lastDate={lastDate}
                onDataLoaded={handleDataLoaded}
              />
            )}
          </div>

          <footer style={{ textAlign:'center', padding:'12px', color:'var(--t-dim)', fontSize:10, fontFamily:'var(--f-mono)', borderTop:'1px solid var(--br)', flexShrink:0 }}>
            Tableau de Bord UGP-GAVI · Ministère de la Santé Publique de Djibouti · SNV 2022–2026
          </footer>
        </>
      )}
    </div>
  );
}
