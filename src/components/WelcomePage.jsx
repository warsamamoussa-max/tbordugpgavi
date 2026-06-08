import React from 'react';

export default function WelcomePage({ onChoice }) {
  return (
    <div className="welcome-wrap">
      {/* Logos */}
      <div className="welcome-logos fade-up">
        <img src="/logos/ugp.png"   alt="UGP"  height={60} />
        <div className="sep" />
        <img src="/logos/pev.jpeg"  alt="PEV"  height={48} />
        <img src="/logos/sante.jpg" alt="MSP"  height={44} style={{ borderRadius:'50%', border:'1px solid #e2e8f0', background:'#fff', padding:2 }} />
        <img src="/logos/gavi.png"  alt="GAVI" height={34} />
      </div>

      {/* Heading */}
      <div className="welcome-heading fade-up-1">
        <h1>
          Tableau de Bord<br />
          <span className="ital">UGP-GAVI Djibouti</span>
        </h1>
        <p>
          Unité de Gestion de Projet · Ministère de la Santé Publique<br />
          République de Djibouti · Stratégie Nationale de Vaccination 2022–2026
        </p>
      </div>

      {/* Separator */}
      <div style={{ width:48, height:2, background:'var(--teal)', borderRadius:1, marginBottom:36, opacity:.4 }} />

      {/* Choice cards */}
      <div className="choice-grid fade-up-2">
        <div className="choice-card" onClick={() => onChoice('visitor')}>
          <div className="choice-icon" style={{ background:'rgba(0,123,138,.10)', border:'1px solid rgba(0,123,138,.2)' }}>
            📊
          </div>
          <div className="choice-label">Visualisation</div>
          <div className="choice-desc">
            Tableaux de bord · KPIs · Indicateurs du programme GAVI
          </div>
        </div>

        <div className="choice-card" onClick={() => onChoice('admin')}>
          <div className="choice-icon" style={{ background:'rgba(26,45,74,.08)', border:'1px solid rgba(26,45,74,.15)' }}>
            ⚙️
          </div>
          <div className="choice-label">Administration</div>
          <div className="choice-desc">
            Charger les données PTA · Configurer les accès
          </div>
        </div>
      </div>

      <div className="welcome-footer fade-up-3">
        Accès restreint · Partenaires autorisés uniquement
      </div>

      <div className="partners-row fade-up-4">
        OMS · UNICEF · Ministère de la Santé · GAVI The Vaccine Alliance
      </div>
    </div>
  );
}
