import React, { useState } from 'react';
import { verifyPassword, setRole, setAdminHash, sha256 } from '../utils.js';

export default function LoginPage({ role, onSuccess, onBack }) {
  const [pwd,   setPwd]   = useState('');
  const [err,   setErr]   = useState('');
  const [loading, setLoading] = useState(false);

  const isAdmin = role === 'admin';

  const handleSubmit = async () => {
    if (!pwd.trim()) return;
    setLoading(true);
    setErr('');
    try {
      const ok = await verifyPassword(role, pwd.trim());
      if (ok) {
        setRole(role);
        if (isAdmin) {
          const h = await sha256(pwd.trim());
          setAdminHash(h);
        }
        onSuccess(role);
      } else {
        setErr('⚠ Mot de passe incorrect. Veuillez réessayer.');
        setPwd('');
      }
    } catch {
      setErr('Erreur de vérification. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '48px 24px',
      background: 'linear-gradient(160deg, #ffffff 0%, #edf3f8 60%, #dce8f2 100%)',
    }}>
      {/* Logos */}
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:36 }}>
        <img src="/logos/ugp.png"  alt="UGP"  style={{ height:44, objectFit:'contain' }} />
        <img src="/logos/gavi.png" alt="GAVI" style={{ height:28, objectFit:'contain' }} />
      </div>

      <div style={{
        background: 'var(--surface)', border: '1px solid var(--br)',
        borderRadius: 'var(--r-xl)', padding: '32px 36px',
        width: '100%', maxWidth: 380,
        boxShadow: 'var(--sh-lg)',
      }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily:'var(--f-mono)', fontSize:9.5, color:'var(--t-dim)', textTransform:'uppercase', letterSpacing:'.12em', marginBottom:8 }}>
            {isAdmin ? 'Espace Administration' : 'Accès Visiteur'}
          </div>
          <h2 style={{ fontFamily:'var(--f-display)', fontSize:20, fontWeight:600, color:'var(--navy)' }}>
            {isAdmin ? 'Mot de passe Admin' : 'Mot de passe Visiteur'}
          </h2>
        </div>

        <input
          type="password"
          value={pwd}
          onChange={e => setPwd(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="••••••••••••"
          style={{ width:'100%', padding:'10px 14px', marginBottom:16, fontSize:14 }}
          autoFocus
        />

        {err && (
          <div style={{ background:'var(--danger-light)', color:'var(--danger)', border:'1px solid #de9aa0', borderRadius:'var(--r-m)', padding:'8px 12px', fontSize:12, marginBottom:14 }}>
            {err}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !pwd.trim()}
          style={{
            width: '100%', padding: '11px',
            background: isAdmin ? 'var(--navy)' : 'var(--teal)',
            color: '#fff', border: 'none',
            borderRadius: 'var(--r-m)', fontSize: 13, fontWeight: 600,
            opacity: loading || !pwd.trim() ? .6 : 1,
            transition: 'opacity .2s',
          }}
        >
          {loading ? 'Vérification…' : 'Connexion'}
        </button>

        <button
          onClick={onBack}
          style={{ marginTop:14, width:'100%', padding:'8px', background:'none', border:'none', color:'var(--t-dim)', fontSize:12 }}
        >
          ← Retour
        </button>
      </div>
    </div>
  );
}
