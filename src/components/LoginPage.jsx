import React, { useState } from 'react';
import { verifyPassword, setSessionHash, sha256 } from '../utils/storage';

export default function LoginPage({ mode, onSuccess, onBack }) {
  const [pwd,     setPwd]     = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [err,     setErr]     = useState(false);
  const [loading, setLoading] = useState(false);

  const isAdmin  = mode === 'admin';
  const icon     = isAdmin ? '⚙️' : '📊';
  const title    = isAdmin ? 'Espace Administration' : 'Espace Visualisation';
  const subtitle = isAdmin
    ? 'Saisissez le mot de passe administrateur'
    : 'Saisissez le mot de passe pour accéder aux tableaux de bord du programme GAVI';

  const doLogin = async () => {
    if (!pwd.trim() || loading) return;
    setLoading(true); setErr(false);
    try {
      const ok = await verifyPassword(mode, pwd.trim());
      if (ok) {
        if (isAdmin) { const h = await sha256(pwd.trim()); setSessionHash(h); }
        onSuccess(mode);
      } else {
        setErr(true); setPwd('');
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="login-wrap">
      {/* Mini logos */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:32 }} className="fade-up">
        <img src="/logos/ugp.png"  alt="UGP"  height={36} style={{ objectFit:'contain' }} />
        <img src="/logos/gavi.png" alt="GAVI" height={24} style={{ objectFit:'contain' }} />
      </div>

      <div className="login-box fade-up-1">
        <button className="login-back" onClick={onBack}>← Retour</button>

        <div className="login-icon">{icon}</div>
        <div className="login-title">{title}</div>
        <div className="login-sub">{subtitle}</div>

        <div className="input-wrap">
          <input
            className={`pw-input${err ? ' error' : ''}`}
            type={showPwd ? 'text' : 'password'}
            placeholder="Mot de passe"
            value={pwd}
            onChange={e => { setPwd(e.target.value); setErr(false); }}
            onKeyDown={e => e.key === 'Enter' && doLogin()}
            autoFocus
          />
          <button className="eye-btn" onClick={() => setShowPwd(v => !v)} type="button">
            {showPwd ? '🙈' : '👁'}
          </button>
        </div>

        {err && (
          <div className="err-msg show">
            Mot de passe incorrect. Veuillez réessayer.
          </div>
        )}

        <button
          className="login-btn"
          onClick={doLogin}
          disabled={!pwd.trim() || loading}
        >
          {loading ? 'Vérification…' : 'ACCÉDER →'}
        </button>

        <div className="login-footer">
          SESSION SÉCURISÉE · EXPIRE À LA FERMETURE DE L'ONGLET
        </div>
      </div>
    </div>
  );
}
