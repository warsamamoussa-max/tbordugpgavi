import React from 'react';

export default function WelcomePage({ onChoice }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '48px 24px', gap: 0,
      background: 'linear-gradient(160deg, #ffffff 0%, #edf3f8 60%, #dce8f2 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute', top: -80, right: -80,
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,123,138,.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: -60, left: -60,
        width: 320, height: 320, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(26,45,74,.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Logos */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 36 }}>
        <img src="/logos/ugp.png"   alt="UGP"  style={{ height:56, objectFit:'contain' }} />
        <div style={{ width:1, height:40, background:'var(--br-hi)' }} />
        <img src="/logos/pev.jpeg"  alt="PEV"  style={{ height:44, objectFit:'contain' }} />
        <img src="/logos/sante.jpg" alt="MSP"  style={{ height:44, width:44, borderRadius:'50%', objectFit:'contain', border:'1px solid var(--br)', background:'#fff', padding:2 }} />
        <img src="/logos/gavi.png"  alt="GAVI" style={{ height:32, objectFit:'contain' }} />
      </div>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontFamily:'var(--f-mono)', fontSize:10, color:'var(--t-dim)', letterSpacing:'.18em', textTransform:'uppercase', marginBottom:12 }}>
          Ministère de la Santé Publique · Djibouti · SNV 2022–2026
        </div>
        <h1 style={{ fontFamily:'var(--f-display)', fontSize:32, fontWeight:700, color:'var(--navy)', letterSpacing:'-.02em', lineHeight:1.2, marginBottom:10 }}>
          Tableau de Bord UGP-GAVI
        </h1>
        <p style={{ fontSize:13, color:'var(--t-dim)', maxWidth:420, lineHeight:1.6 }}>
          Suivi du portefeuille de financement GAVI — Programme Élargi de Vaccination 2026
        </p>
      </div>

      {/* Role selector */}
      <div style={{ display:'flex', gap:16, flexWrap:'wrap', justifyContent:'center' }}>
        <button
          onClick={() => onChoice('visitor')}
          style={{
            padding: '14px 32px',
            background: 'var(--surface)',
            border: '1.5px solid var(--br-hi)',
            borderRadius: 'var(--r-l)',
            color: 'var(--t-hi)',
            fontSize: 13,
            fontWeight: 500,
            boxShadow: 'var(--sh-sm)',
            transition: 'all .18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor='var(--teal)'; e.currentTarget.style.boxShadow='var(--sh-md)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor='var(--br-hi)'; e.currentTarget.style.boxShadow='var(--sh-sm)'; }}
        >
          ● Visiteur
        </button>
        <button
          onClick={() => onChoice('admin')}
          style={{
            padding: '14px 32px',
            background: 'var(--navy)',
            border: '1.5px solid var(--navy)',
            borderRadius: 'var(--r-l)',
            color: '#fff',
            fontSize: 13,
            fontWeight: 500,
            boxShadow: 'var(--sh-sm)',
            transition: 'all .18s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background='var(--navy-2)'; e.currentTarget.style.boxShadow='var(--sh-md)'; }}
          onMouseLeave={e => { e.currentTarget.style.background='var(--navy)'; e.currentTarget.style.boxShadow='var(--sh-sm)'; }}
        >
          ⚙ Admin
        </button>
      </div>

      <p style={{ marginTop: 24, fontSize: 11, color: 'var(--t-dim)' }}>
        Accès réservé aux administrateurs du programme GAVI
      </p>
    </div>
  );
}
