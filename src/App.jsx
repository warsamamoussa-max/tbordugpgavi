import React, { useState, useCallback, useEffect } from 'react';
import { getSessionRole, setSessionRole, clearSession, loadPTARemote } from './utils/storage';
import WelcomePage       from './components/WelcomePage';
import LoginPage         from './components/LoginPage';
import Header            from './components/Header';
import NavBar            from './components/NavBar';
import TabMenu           from './components/TabMenu';
import TabPlanTravail    from './components/TabPlanTravail';
import TabSuiviFinancier from './components/TabSuiviFinancier';
import TabSommaire       from './components/TabSommaire';
import TabAdmin          from './components/TabAdmin';

export default function App() {
  const [page,      setPage]      = useState('welcome'); // welcome | login | dashboard
  const [loginMode, setLoginMode] = useState('visitor');
  const [role,      setRole]      = useState(null);
  const [activeTab, setActiveTab] = useState('menu');
  const [rawData,   setRawData]   = useState(null);
  const [kpis,      setKpis]      = useState(null);
  const [fileName,  setFileName]  = useState(null);
  const [parseDate, setParseDate] = useState(null);
  const [loading,   setLoading]   = useState(false);

  const fetchPTA = async () => {
    setLoading(true);
    try {
      const stored = await loadPTARemote();
      if (stored) {
        setRawData(stored.rawData);
        setKpis(stored.kpis);
        setFileName(stored.fileName);
        setParseDate(stored.date);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const saved = getSessionRole();
    if (saved) { setRole(saved); fetchPTA(); setPage('dashboard'); }
  }, []);

  const goLogin = (mode) => { setLoginMode(mode); setPage('login'); };

  const onLoginSuccess = async (r) => {
    setSessionRole(r);
    setRole(r);
    setPage('dashboard');
    setActiveTab('menu');
    await fetchPTA();
  };

  const logout = () => {
    clearSession();
    setRole(null); setRawData(null); setKpis(null);
    setFileName(null); setParseDate(null);
    setActiveTab('menu');
    setPage('welcome');
  };

  const handleNewData = useCallback((data, newKpis, name, date) => {
    setRawData(data); setKpis(newKpis); setFileName(name); setParseDate(date);
  }, []);

  const isAdmin = role === 'admin';

  return (
    <div className="app-shell">
      <div className="top-bar" />

      {page === 'welcome' && (
        <WelcomePage onChoice={goLogin} />
      )}

      {page === 'login' && (
        <LoginPage
          mode={loginMode}
          onSuccess={onLoginSuccess}
          onBack={() => setPage('welcome')}
        />
      )}

      {page === 'dashboard' && (
        <>
          <Header role={role} fileName={fileName} parseDate={parseDate} onLogout={logout} />
          <NavBar activeTab={activeTab} onTab={setActiveTab} isAdmin={isAdmin} />

          <div className="content">
            {loading && (
              <div className="alert alert-info" style={{ marginBottom:14, display:'flex', alignItems:'center', gap:10 }}>
                <span className="spinner" style={{width:14,height:14}} />
                Chargement des données en cours…
              </div>
            )}

            {activeTab === 'menu'    && <TabMenu    kpis={kpis} />}
            {activeTab === 'plan'    && <TabPlanTravail rawData={rawData} />}
            {activeTab === 'finance' && <TabSuiviFinancier kpis={kpis} />}
            {activeTab === 'sommaire'&& <TabSommaire kpis={kpis} rawData={rawData} />}
            {activeTab === 'admin'   && isAdmin && (
              <TabAdmin kpis={kpis} fileName={fileName} parseDate={parseDate} onDataLoaded={handleNewData} />
            )}
          </div>

          <footer className="app-footer">
            UGP-GAVI · Ministère de la Santé Publique de Djibouti · SNV 2022–2026
          </footer>
        </>
      )}
    </div>
  );
}
