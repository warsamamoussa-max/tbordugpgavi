import React from 'react';

const TABS = [
  { id: 'menu',     label: "Vue d'ensemble" },
  { id: 'plan',     label: 'Plan de travail' },
  { id: 'finance',  label: 'Suivi financier' },
  { id: 'sommaire', label: 'Suivi programmatique' },
];

export default function NavBar({ activeTab, onTab, isAdmin, onLogout }) {
  const tabs = isAdmin ? [...TABS, { id:'admin', label:'Administration' }] : TABS;

  return (
    <nav className="navbar">
      {tabs.map(t => (
        <button
          key={t.id}
          className={`nav-btn${activeTab === t.id ? ' active' : ''}`}
          onClick={() => onTab(t.id)}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
