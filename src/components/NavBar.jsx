import React from 'react';

const TABS = [
  { id: 'menu',    label: "Vue d'ensemble" },
  { id: 'plan',    label: 'Plan de travail' },
  { id: 'finance', label: 'Suivi financier' },
  { id: 'prog',    label: 'Suivi programmatique' },
];
const ADMIN_TAB = { id: 'admin', label: 'Administration' };

export default function NavBar({ activeTab, onTab, isAdmin, fileName, onLogout }) {
  const tabs = isAdmin ? [...TABS, ADMIN_TAB] : TABS;

  return (
    <nav style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--br)',
      padding: '0 28px',
      display: 'flex', alignItems: 'center',
      gap: 0, flexShrink: 0,
      boxShadow: '0 1px 3px rgba(26,45,74,.04)',
    }}>
      {/* Logos */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginRight:28, paddingRight:20, borderRight:'1px solid var(--br)' }}>
        <img src="/logos/ugp.png"  alt="UGP"  style={{ height:28, objectFit:'contain' }} />
        <img src="/logos/pev.jpeg" alt="PEV"  style={{ height:22, objectFit:'contain' }} />
        <img src="/logos/sante.jpg" alt="MSP" style={{ height:22, width:22, borderRadius:'50%', objectFit:'contain', border:'1px solid var(--br)', background:'#fff', padding:1 }} />
        <img src="/logos/gavi.png" alt="GAVI" style={{ height:18, objectFit:'contain' }} />
      </div>

      {/* Tabs */}
      {tabs.map(t => {
        const active = activeTab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onTab(t.id)}
            style={{
              padding: '14px 16px',
              background: 'none', border: 'none',
              borderBottom: active ? '2px solid var(--teal)' : '2px solid transparent',
              color: active ? 'var(--teal)' : 'var(--t-dim)',
              fontFamily: 'var(--f-body)', fontSize: 12.5, fontWeight: active ? 600 : 400,
              transition: 'all .18s', whiteSpace: 'nowrap',
            }}
          >
            {t.label}
          </button>
        );
      })}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Status */}
      {fileName && (
        <div style={{ display:'flex', alignItems:'center', gap:6, marginRight:16, fontSize:11, color:'var(--t-dim)', fontFamily:'var(--f-mono)' }}>
          <span className="live-dot" />
          <span style={{ maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{fileName}</span>
        </div>
      )}

      {/* Logout */}
      <button
        onClick={onLogout}
        style={{
          padding:'6px 12px', fontSize:11, fontFamily:'var(--f-mono)',
          background:'var(--surface-2)', border:'1px solid var(--br)',
          borderRadius:'var(--r-m)', color:'var(--t-dim)',
          transition:'all .18s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color='var(--danger)'; e.currentTarget.style.borderColor='var(--danger)'; }}
        onMouseLeave={e => { e.currentTarget.style.color='var(--t-dim)'; e.currentTarget.style.borderColor='var(--br)'; }}
      >
        Déconnexion
      </button>
    </nav>
  );
}
