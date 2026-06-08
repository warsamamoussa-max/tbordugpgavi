// ── SHA-256 ────────────────────────────────────────────────────────────────
export async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2,'0')).join('');
}

// ── Default hashes (SHA-256 of "GAVI2026DJI" and "ADMIN2026DJI") ──────────
const DEFAULT = {
  visitor: '77a1a0313859ca35f394d9c21f72946aa8f7ff6e197b156c857d6acf77f6199a',
  admin:   'f19bf4844c038d3ff1704b0a668c95ffe306acb1663e33bb1740ad6e70c9e514',
};
const LS = { visitor: 'ugp_hash_v', admin: 'ugp_hash_a' };
const SS = { role: 'ugp_role', hash: 'ugp_admin_hash' };

function getHash(role) {
  try { return localStorage.getItem(LS[role]) || DEFAULT[role]; } catch { return DEFAULT[role]; }
}
export function setHash(role, hash) {
  try { localStorage.setItem(LS[role], hash); } catch {}
}

// ── Auth ──────────────────────────────────────────────────────────────────
export async function verifyPassword(role, plain) {
  return (await sha256(plain)) === getHash(role);
}

// ── Session ───────────────────────────────────────────────────────────────
export function getSessionRole()      { return sessionStorage.getItem(SS.role); }
export function setSessionRole(r)     { sessionStorage.setItem(SS.role, r); }
export function setSessionHash(h)     { sessionStorage.setItem(SS.hash, h); }
export function getSessionHash()      { return sessionStorage.getItem(SS.hash); }
export function clearSession()        { sessionStorage.removeItem(SS.role); sessionStorage.removeItem(SS.hash); }

// ── Netlify Blobs ─────────────────────────────────────────────────────────
export async function savePTARemote(rawData, kpis, fileName, date, adminHash) {
  const res = await fetch('/api/save-pta', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Token': adminHash },
    body:    JSON.stringify({ rawData: { activities: rawData.activities, sommaire: rawData.sommaire, meta: rawData.meta }, kpis, fileName, date }),
  });
  if (!res.ok) throw new Error(`Serveur : ${res.status}`);
  const d = await res.json();
  if (!d.ok) throw new Error(d.error || 'Erreur sauvegarde');
  return true;
}

export async function loadPTARemote() {
  try {
    const res = await fetch('/api/load-pta', { cache: 'no-store' });
    if (!res.ok) return null;
    const d = await res.json();
    return d.ok ? d : null;
  } catch { return null; }
}

// ── Formatters ────────────────────────────────────────────────────────────
export const fmtUSD = v => !v ? '$0' : v >= 1e6 ? `$${(v/1e6).toFixed(2)}M` : v >= 1e3 ? `$${Math.round(v/1e3)}K` : `$${Math.round(v)}`;
export const fmtPct = v => `${v ?? 0}%`;
export const fmtFDJ = v => v ? `${Math.round(v).toLocaleString('fr-FR')} FDJ` : '—';
