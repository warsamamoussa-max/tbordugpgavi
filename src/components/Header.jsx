import React from 'react';

export default function Header({ role, fileName, parseDate, onLogout }) {
  return (
    <header className="app-header">
      <div className="header-logos">
        <img src="/logos/ugp.png"   alt="UGP"  height={30} />
        <img src="/logos/pev.jpeg"  alt="PEV"  height={24} style={{ borderRadius:'50%', border:'1px solid #e2e8f0', background:'#fff', padding:1 }} />
      </div>
      <div className="header-sep" />
      <div>
        <div className="header-title">Tableau de Bord UGP-GAVI</div>
        <div className="header-sub">Ministère de la Santé Publique · Djibouti · SNV 2022–2026</div>
      </div>

      <div className="header-right">
        {fileName && (
          <div className="live-badge">
            <span className="live-dot" />
            <span style={{ maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {fileName}
            </span>
            {parseDate && <span>· {parseDate}</span>}
          </div>
        )}
        <img src="/logos/gavi.png" alt="GAVI" height={22} style={{ objectFit:'contain' }} />
      </div>
    </header>
  );
}
