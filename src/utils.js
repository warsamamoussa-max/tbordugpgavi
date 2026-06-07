// ── Password hashes ────────────────────────────────────────────────────────
// SHA-256 of "GAVI2026DJI" and "ADMIN2026DJI" (default, changeable via admin panel)
const DEFAULT_HASHES = {
  visitor: '77a1a0313859ca35f394d9c21f72946aa8f7ff6e197b156c857d6acf77f6199a',
  admin:   'f19bf4844c038d3ff1704b0a668c95ffe306acb1663e33bb1740ad6e70c9e514',
};

const LS_KEY_VISITOR = 'ugp_hash_visitor';
const LS_KEY_ADMIN   = 'ugp_hash_admin';
const SS_KEY_ROLE    = 'ugp_role';
const SS_KEY_HASH    = 'ugp_admin_hash';

// ── SHA-256 ────────────────────────────────────────────────────────────────
export async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2,'0')).join('');
}

// ── Stored hash accessors ─────────────────────────────────────────────────
function getStoredHash(role) {
  try {
    return localStorage.getItem(role === 'visitor' ? LS_KEY_VISITOR : LS_KEY_ADMIN) || DEFAULT_HASHES[role];
  } catch {
    return DEFAULT_HASHES[role];
  }
}

export function setStoredHash(role, hash) {
  try {
    localStorage.setItem(role === 'visitor' ? LS_KEY_VISITOR : LS_KEY_ADMIN, hash);
  } catch {}
}

// ── Verify password ────────────────────────────────────────────────────────
export async function verifyPassword(role, plainText) {
  const h = await sha256(plainText);
  return h === getStoredHash(role);
}

// ── Session ────────────────────────────────────────────────────────────────
export function getRole()        { return sessionStorage.getItem(SS_KEY_ROLE); }
export function setRole(r)       { sessionStorage.setItem(SS_KEY_ROLE, r); }
export function logout()         { sessionStorage.removeItem(SS_KEY_ROLE); sessionStorage.removeItem(SS_KEY_HASH); }
export function setAdminHash(h)  { sessionStorage.setItem(SS_KEY_HASH, h); }
export function getAdminHash()   { return sessionStorage.getItem(SS_KEY_HASH); }

// ── Netlify Blobs API ──────────────────────────────────────────────────────
export async function savePTA(rawData, kpis, fileName, date, adminHash) {
  const payload = {
    rawData: {
      activities: rawData.activities || [],
      sommaire:   rawData.sommaire   || [],
      meta:       rawData.meta       || {},
    },
    kpis,
    fileName,
    date,
  };
  const res = await fetch('/api/save-pta', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'X-Admin-Token': adminHash },
    body:    JSON.stringify(payload),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Erreur serveur (${res.status})${txt ? ' : ' + txt.slice(0,120) : ''}`);
  }
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'Erreur lors de la sauvegarde');
  return true;
}

export async function loadPTA() {
  try {
    const res = await fetch('/api/load-pta', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.ok ? { rawData: data.rawData, kpis: data.kpis, fileName: data.fileName, date: data.date } : null;
  } catch {
    return null;
  }
}

// ── Formatters ────────────────────────────────────────────────────────────
export const fmtUSD = v =>
  !v ? '$0' : v >= 1e6 ? `$${(v/1e6).toFixed(2)}M` : v >= 1e3 ? `$${Math.round(v/1e3)}K` : `$${v}`;

export const fmtFDJ = v =>
  v ? Math.round(v).toLocaleString('fr-FR') + ' FDJ' : '—';

export const fmtPct = v => `${v ?? 0}%`;
