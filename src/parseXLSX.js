import * as XLSX from 'xlsx';

// ── Helpers ────────────────────────────────────────────────────────────────

function normalizeOS(val) {
  if (!val) return 'OS?';
  const m = String(val).match(/strat[ée]gique\s+(\d+)/i);
  return m ? `OS${m[1]}` : 'OS?';
}

function normalizeStatut(val) {
  if (!val) return 'Non Démarré';
  const t = String(val).trim();
  if (/réalis|realise/i.test(t))   return 'Réalisé';
  if (/en cours/i.test(t))         return 'En Cours';
  if (/reprogramm/i.test(t))       return 'Reprogrammé';
  return 'Non Démarré';
}

function formatDate(val) {
  if (!val) return null;
  if (val instanceof Date) return val.toLocaleDateString('fr-FR');
  if (typeof val === 'number') {
    try {
      const d = XLSX.SSF.parse_date_code(val);
      if (d) return `${String(d.d).padStart(2,'0')}/${String(d.m).padStart(2,'0')}/${d.y}`;
    } catch {}
  }
  return String(val).split('T')[0];
}

function normText(s) {
  return String(s || '').toLowerCase().replace(/\s+/g, ' ').trim().replace(/[.,;:!?]+$/, '');
}

function safeInt(v) {
  try { return v != null ? Math.round(parseFloat(String(v).replace(/[\s\xa0]/g, ''))) : null; }
  catch { return null; }
}

function safeFloat(v) {
  try { return v != null ? Math.round(parseFloat(String(v).replace(/[\s\xa0]/g, '')) * 100) / 100 : null; }
  catch { return null; }
}

// ── Main parser ────────────────────────────────────────────────────────────

export function parseXLSX(arrayBuffer) {
  const wb = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

  const result = {
    meta: {
      sheets: wb.SheetNames,
      parseDate: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
    },
    activities: [],
    sommaire: [],
    errors: [],
  };

  // ── 1. Suivi budgétaire sheet ─────────────────────────────────────────
  const suiviName = wb.SheetNames.find(n => /suivi.*budget/i.test(n));
  if (suiviName) {
    const ws   = wb.Sheets[suiviName];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
    const hdr  = rows[0] || [];

    const col = (...keys) => hdr.findIndex(h => h && keys.some(k =>
      String(h).toLowerCase().includes(k.toLowerCase())
    ));

    const cOS     = col('objectifs strat', 'objectif strat');
    const cDom    = col('domaine');
    const cRef    = col('ref');
    const cAct    = col('activit');
    const cType   = col('type');
    const cDJF    = col('budget djf', 'budget dj');
    const cUSD    = col('budget usd', 'budget us');
    const cSrc    = col('source');
    const cStr    = col('structure de mise');
    const cStat   = col('statut');
    const cDeb    = col('date debut', 'date d');
    const cFin    = col('date fin');
    const cCom    = col('commentaire');
    const cGrp    = col('groupe');
    const cEng    = col('engag');
    const cDep    = col('pens', 'dépens');

    for (let i = 1; i < rows.length; i++) {
      const r   = rows[i];
      const ref = r[cRef] ? String(r[cRef]).trim() : null;
      if (!ref || !ref.startsWith('Act.')) continue;

      result.activities.push({
        os:                normalizeOS(r[cOS]),
        os_full:           String(r[cOS] || '').substring(0, 120),
        domaine:           String(r[cDom  >= 0 ? cDom  : 1] || ''),
        ref,
        activite:          String(r[cAct  >= 0 ? cAct  : 4] || '').trim(),
        type:              String(r[cType >= 0 ? cType : 5] || ''),
        budget_djf:        parseFloat(r[cDJF  >= 0 ? cDJF  : 6]) || 0,
        budget_usd:        parseFloat(r[cUSD  >= 0 ? cUSD  : 7]) || 0,
        source:            String(r[cSrc  >= 0 ? cSrc  : 8] || '').trim().toUpperCase(),
        structure:         String(r[cStr  >= 0 ? cStr  : 9] || '').trim(),
        statut:            normalizeStatut(r[cStat >= 0 ? cStat : 11]),
        date_debut:        formatDate(r[cDeb  >= 0 ? cDeb  : 13]),
        date_fin:          formatDate(r[cFin  >= 0 ? cFin  : 14]),
        commentaire:       String(r[cCom  >= 0 ? cCom  : 15] || ''),
        groupe:            String(r[cGrp  >= 0 ? cGrp  : 16] || ''),
        budget_engage:     parseFloat(r[cEng  >= 0 ? cEng  : -1]) || 0,
        budget_depense:    parseFloat(r[cDep  >= 0 ? cDep  : -1]) || 0,
        taux_programmatique: r[17] ? String(r[17]).trim() : null,
        hypothese:         null,
      });
    }
  }

  // ── 2. Hypothèse Act 2026 sheet ───────────────────────────────────────
  const hypName = wb.SheetNames.find(n => /hypoth/i.test(n) && /act/i.test(n));
  if (hypName) {
    const ws   = wb.Sheets[hypName];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });

    const byRef  = {};
    const byName = {};
    let curRef   = null;

    for (const r of rows) {
      const v0 = r[0], v1 = r[1];
      if (!v0 && !v1) continue;
      if (String(v0) === 'N°') continue;

      const rawNum = String(v0 ?? '').replace(/[\s\xa0]/g, '');
      const num    = parseFloat(rawNum);

      if (!isNaN(num) && rawNum !== '') {
        if (v1 && !/Sous[\s-]Total/i.test(String(v1))) {
          curRef = rawNum;
          const entry = {
            ref:      rawNum,
            titre:    String(v1).trim(),
            source:   '',
            totalFDJ: safeInt(r[8]),
            totalUSD: safeFloat(r[9]),
            lignes:   [],
          };
          byRef[curRef]            = entry;
          byName[normText(String(v1))] = entry;
        }
        continue;
      }

      if (!curRef) continue;
      const label = v1 ? String(v1).trim() : '';
      if (!label) continue;

      if (/^Source/i.test(label)) {
        byRef[curRef].source = label;
        continue;
      }
      if (/Sous[\s-]Total/i.test(label)) continue;

      byRef[curRef].lignes.push({
        rubrique:     label,
        coutUnitaire: safeInt(r[2]),
        quantite:     safeInt(r[3]),
        uniteQte:     r[4] ? String(r[4]).trim() : null,
        frequence:    safeInt(r[5]),
        uniteFreq:    r[6] ? String(r[6]).trim() : null,
        tauxFin:      safeFloat(r[7]),
        totalFDJ:     safeInt(r[8]),
        totalUSD:     safeFloat(r[9]),
      });
    }

    // ── Match activities → hypothèses (triple strategy) ────────────────
    result.activities.forEach(act => {
      const numRef = act.ref.replace('Act.', '').trim();

      // 1) Exact reference match
      if (byRef[numRef]) { act.hypothese = byRef[numRef]; return; }

      // 2) Exact normalized name match
      const normName = normText(act.activite);
      if (byName[normName]) { act.hypothese = byName[normName]; return; }

      // 3) Fuzzy word-overlap (≥ 60%)
      const words = normName.split(' ').filter(w => w.length > 4);
      if (words.length >= 3) {
        let best = null, bestScore = 0;
        for (const [key, entry] of Object.entries(byName)) {
          const score = words.filter(w => key.includes(w)).length / words.length;
          if (score > bestScore && score >= 0.6) { bestScore = score; best = entry; }
        }
        if (best) act.hypothese = best;
      }
    });

    result.meta.hypCount = Object.keys(byRef).length;
  }

  // ── 3. Sommaire sheet ────────────────────────────────────────────────
  const somName = wb.SheetNames.find(n => /sommaire/i.test(n));
  if (somName) {
    const ws   = wb.Sheets[somName];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
    let subv   = null;

    for (const r of rows) {
      const col0 = r[0] ? String(r[0]).trim() : null;
      const col1 = r[1] ? String(r[1]).trim() : null;
      if (!col1 || col1 === 'Entité de mise en oeuvre') continue;
      if (col0 && col0 !== 'Subvention') subv = col0;
      if (subv) {
        result.sommaire.push({
          subvention: subv,
          entite:     col1,
          solde:      parseFloat(r[2]) || 0,
          activites:  parseFloat(r[3]) || 0,
          reliquat:   parseFloat(r[4]) || 0,
          note:       r[5] ? String(r[5]) : '',
        });
      }
    }
  }

  return result;
}

// ── KPI computation ────────────────────────────────────────────────────────

const OS_COLORS  = { OS1:'#4191ff', OS2:'#34d9a0', OS3:'#00d2b4', OS4:'#f06060', OS5:'#e8b84b', 'OS?':'#4a6480' };
const SRC_COLORS = { CDS:'#4191ff', FAE:'#00d2b4', RSS:'#e8b84b', HPV:'#f06060', AUTRE:'#4a6480' };

export function computeKPIs(rawData) {
  const acts = rawData.activities;
  if (!acts || !acts.length) return null;

  const statuts = { Réalisé:0, 'En Cours':0, 'Non Démarré':0, Reprogrammé:0 };
  const nBySrc={}, cntBySrc={}, engBySrc={}, depBySrc={};
  const nByOS={}, cntByOS={}, realByOS={};
  const nByStr={}, depByStr={};

  acts.forEach(a => {
    const src = a.source || 'AUTRE';
    const os  = a.os     || 'OS?';
    const str = a.structure || 'Autre';

    statuts[a.statut] !== undefined ? statuts[a.statut]++ : statuts['Non Démarré']++;

    nBySrc[src]   = (nBySrc[src]   || 0) + a.budget_usd;
    cntBySrc[src] = (cntBySrc[src] || 0) + 1;
    engBySrc[src] = (engBySrc[src] || 0) + (a.budget_engage  || 0);
    depBySrc[src] = (depBySrc[src] || 0) + (a.budget_depense || 0);

    nByOS[os]    = (nByOS[os]    || 0) + a.budget_usd;
    cntByOS[os]  = (cntByOS[os]  || 0) + 1;
    if (a.statut === 'Réalisé') realByOS[os] = (realByOS[os] || 0) + 1;

    nByStr[str]  = (nByStr[str]  || 0) + a.budget_usd;
    depByStr[str]= (depByStr[str]|| 0) + (a.budget_depense || 0);
  });

  const totalBudget  = Object.values(nBySrc).reduce((s,v) => s+v, 0);
  const totalDepense = acts.reduce((s,a) => s + (a.budget_depense || 0), 0);
  const totalEngage  = acts.reduce((s,a) => s + (a.budget_engage  || 0), 0);

  const statutDonut = [
    { name:'Réalisé',      value:statuts.Réalisé,      color:'#34d9a0' },
    { name:'En Cours',     value:statuts['En Cours'],  color:'#e8b84b' },
    { name:'Non Démarré',  value:statuts['Non Démarré'],color:'#f06060' },
    { name:'Reprogrammé',  value:statuts.Reprogrammé,  color:'#7b9fff' },
  ].filter(d => d.value > 0);

  const budgetBySourceBars = Object.entries(nBySrc)
    .sort(([,a],[,b]) => b-a)
    .map(([name,budget]) => ({
      name, budget:Math.round(budget),
      depense:Math.round(depBySrc[name]||0),
      engage: Math.round(engBySrc[name]||0),
      color:  SRC_COLORS[name] || '#4a6480',
      activites: cntBySrc[name]||0,
    }));

  const activitesByOSBars = Object.entries(cntByOS)
    .sort(([,a],[,b]) => b-a)
    .map(([os,count]) => ({
      os, count,
      budget:  Math.round(nByOS[os]||0),
      realise: realByOS[os]||0,
      taux:    count > 0 ? Math.round((realByOS[os]||0)/count*100) : 0,
      color:   OS_COLORS[os] || '#4a6480',
    }));

  const budgetByOSDonut = Object.entries(nByOS)
    .sort(([,a],[,b]) => b-a)
    .map(([name,value]) => ({ name, value:Math.round(value), color:OS_COLORS[name]||'#4a6480' }));

  const structureBars = Object.entries(nByStr)
    .sort(([,a],[,b]) => b-a).slice(0,7)
    .map(([name,budget]) => ({
      name, budget:Math.round(budget),
      depense:Math.round(depByStr[name]||0),
      taux: budget > 0 ? Math.round((depByStr[name]||0)/budget*100) : 0,
    }));

  const financialBySource = Object.entries(nBySrc)
    .map(([source,budget]) => ({
      source, budget:Math.round(budget),
      depense:  Math.round(depBySrc[source]||0),
      engage:   Math.round(engBySrc[source]||0),
      activites:cntBySrc[source]||0,
      realise:  acts.filter(a => a.source===source && a.statut==='Réalisé').length,
      tauxAbsorption: budget>0 ? Math.round((depBySrc[source]||0)/budget*100) : 0,
      color: SRC_COLORS[source] || '#4a6480',
    })).sort((a,b) => b.budget-a.budget);

  return {
    totalActivites:  acts.length,
    statuts,
    totalBudget:     Math.round(totalBudget),
    totalDepense:    Math.round(totalDepense),
    totalEngage:     Math.round(totalEngage),
    tauxAbsorption:  totalBudget>0 ? Math.round(totalDepense/totalBudget*100) : 0,
    statutDonut,
    budgetByOSDonut,
    budgetBySourceBars,
    activitesByOSBars,
    structureBars,
    financialBySource,
    sommaire:       rawData.sommaire,
    OS_COLORS,
    SOURCE_COLORS:  SRC_COLORS,
  };
}

// ── Programmatic KPIs ─────────────────────────────────────────────────────

export function computeProgKPIs(activities) {
  if (!activities?.length) return null;

  const MONTHS    = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
  const OS_C2     = { OS1:'#1a5fa8', OS2:'#007b8a', OS3:'#1a7a4a', OS4:'#b8860b', OS5:'#9b2335', 'OS?':'#7a8fa6' };

  const byOS = {};
  activities.forEach(a => {
    const os = a.os || 'OS?';
    if (!byOS[os]) byOS[os] = { os, total:0, realise:0, enCours:0, nonDemarre:0, reprog:0, budget:0, depense:0, color:OS_C2[os]||'#7a8fa6' };
    byOS[os].total++;
    byOS[os].budget  += a.budget_usd  || 0;
    byOS[os].depense += a.budget_depense || 0;
    if      (a.statut==='Réalisé')     byOS[os].realise++;
    else if (a.statut==='En Cours')    byOS[os].enCours++;
    else if (a.statut==='Reprogrammé') byOS[os].reprog++;
    else                               byOS[os].nonDemarre++;
  });

  const byOSArr = Object.values(byOS)
    .sort((a,b) => b.total-a.total)
    .map(o => ({ ...o,
      tauxRealisation: o.total>0 ? Math.round(o.realise/o.total*100) : 0,
      tauxAbsorption:  o.budget>0? Math.round(o.depense/o.budget*100) : 0,
    }));

  const byGroupe = {};
  activities.forEach(a => {
    const g = a.groupe || 'Autres';
    if (g==='-') return;
    if (!byGroupe[g]) byGroupe[g] = { groupe:g, total:0, realise:0, enCours:0, budget:0, depense:0 };
    byGroupe[g].total++;
    byGroupe[g].budget  += a.budget_usd  || 0;
    byGroupe[g].depense += a.budget_depense || 0;
    if (a.statut==='Réalisé')  byGroupe[g].realise++;
    if (a.statut==='En Cours') byGroupe[g].enCours++;
  });
  const byGroupeArr = Object.values(byGroupe)
    .sort((a,b) => b.total-a.total)
    .map(g => ({ ...g, tauxRealisation: g.total>0 ? Math.round(g.realise/g.total*100) : 0 }));

  const timeline = {};
  activities.forEach(a => {
    if (!a.date_fin) return;
    const parts = String(a.date_fin).split(/[\/\-T ]/);
    let d, m;
    if (parts.length >= 3) {
      if (parts[0].length === 4) { m = parseInt(parts[1]); d = parseInt(parts[0]); }
      else { m = parseInt(parts[1]); d = parseInt(parts[2]); }
    }
    if (!m || isNaN(m) || !d || isNaN(d)) return;
    const key = `${d}-${String(m).padStart(2,'0')}`;
    if (!timeline[key]) timeline[key] = { mois: MONTHS[m-1], key, total:0, realise:0, enCours:0 };
    timeline[key].total++;
    if (a.statut==='Réalisé')  timeline[key].realise++;
    if (a.statut==='En Cours') timeline[key].enCours++;
  });
  const timelineArr = Object.values(timeline).sort((a,b) => a.key.localeCompare(b.key));

  const tauxMap = { '0-24':0, '25-49':0, '50-79':0, '80-100':0 };
  activities.forEach(a => {
    if (!a.taux_programmatique) return;
    const s = String(a.taux_programmatique);
    if      (s.startsWith('0'))  tauxMap['0-24']++;
    else if (s.startsWith('25')) tauxMap['25-49']++;
    else if (s.startsWith('50')) tauxMap['50-79']++;
    else if (s.startsWith('80')) tauxMap['80-100']++;
  });

  return { byOS:byOSArr, byGroupe:byGroupeArr, timeline:timelineArr, tauxMap };
}
