import * as XLSX from 'xlsx';

function normText(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
}
function normalizeOS(val) {
  const m = String(val || '').match(/(\d+)/);
  return m ? `OS${m[1]}` : 'OS?';
}
function normalizeStatut(val) {
  const t = String(val || '').toLowerCase();
  if (/réalis|realise/.test(t))    return 'Réalisé';
  if (/en cours/.test(t))           return 'En Cours';
  if (/reprogramm/.test(t))         return 'Reprogrammé';
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
function safeNum(v) {
  if (v == null) return null;
  const n = parseFloat(String(v).replace(/[\s\xa0]/g,'').replace(',','.'));
  return isNaN(n) ? null : n;
}

export function parsePTAFile(arrayBuffer) {
  const wb = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
  const result = { activities: [], sommaire: [], meta: { sheets: wb.SheetNames, parseDate: new Date().toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'}) } };

  // ── Suivi budgétaire ──────────────────────────────────────────────────
  const suiviName = wb.SheetNames.find(n => /suivi.*budget/i.test(n) || /budget.*suivi/i.test(n));
  if (suiviName) {
    const ws   = wb.Sheets[suiviName];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
    const hdr  = rows[0] || [];
    const col  = (...keys) => hdr.findIndex(h => h && keys.some(k => String(h).toLowerCase().includes(k.toLowerCase())));

    const cOS   = col('objectifs strat','objectif strat');
    const cRef  = col('ref');
    const cAct  = col('activit');
    const cType = col('type');
    const cDJF  = col('budget djf','budget dj','montant djf');
    const cUSD  = col('budget usd','budget us','montant usd');
    const cSrc  = col('source');
    const cStr  = col('structure');
    const cStat = col('statut');
    const cDeb  = col('date debut','date d');
    const cFin  = col('date fin');
    const cCom  = col('commentaire');
    const cGrp  = col('groupe');
    const cEng  = col('engag');
    const cDep  = col('pens','dépens');
    const cTaux = col('taux prog','taux d\'ex');

    for (let i = 1; i < rows.length; i++) {
      const r   = rows[i];
      const ref = r[cRef] ? String(r[cRef]).trim() : null;
      if (!ref || !ref.startsWith('Act.')) continue;
      result.activities.push({
        os:              normalizeOS(cOS >= 0 ? r[cOS] : r[0]),
        os_full:         String(cOS >= 0 ? r[cOS] : r[0] || '').substring(0,120),
        ref,
        activite:        String(cAct >= 0 ? r[cAct] : r[4] || '').trim(),
        type:            String(cType >= 0 ? r[cType] : r[5] || ''),
        budget_djf:      safeNum(cDJF >= 0 ? r[cDJF] : r[6]) || 0,
        budget_usd:      safeNum(cUSD >= 0 ? r[cUSD] : r[7]) || 0,
        source:          String(cSrc >= 0 ? r[cSrc] : r[8] || '').trim().toUpperCase(),
        structure:       String(cStr >= 0 ? r[cStr] : r[9] || '').trim(),
        statut:          normalizeStatut(cStat >= 0 ? r[cStat] : r[11]),
        date_debut:      formatDate(cDeb >= 0 ? r[cDeb] : r[13]),
        date_fin:        formatDate(cFin >= 0 ? r[cFin] : r[14]),
        commentaire:     String(cCom >= 0 ? r[cCom] : r[15] || ''),
        groupe:          String(cGrp >= 0 ? r[cGrp] : r[16] || ''),
        budget_engage:   safeNum(cEng >= 0 ? r[cEng] : null) || 0,
        budget_depense:  safeNum(cDep >= 0 ? r[cDep] : null) || 0,
        taux_prog:       cTaux >= 0 ? r[cTaux] : null,
        hypothese:       null,
      });
    }
  }

  // ── Hypothèse Act ─────────────────────────────────────────────────────
  const hypName = wb.SheetNames.find(n => /hypoth/i.test(n));
  if (hypName) {
    const ws   = wb.Sheets[hypName];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
    const byRef = {}, byName = {};
    let cur = null;

    for (const r of rows) {
      const v0 = r[0], v1 = r[1];
      if (!v0 && !v1) continue;
      if (String(v0) === 'N°') continue;
      const raw  = String(v0 ?? '').replace(/[\s\xa0]/g,'');
      const num  = parseFloat(raw);
      if (!isNaN(num) && raw && v1 && !/sous.?total/i.test(String(v1))) {
        cur = raw;
        const entry = { ref: raw, titre: String(v1).trim(), source: '', totalFDJ: safeNum(r[8]), totalUSD: safeNum(r[9]), lignes: [] };
        byRef[cur] = entry;
        byName[normText(String(v1))] = entry;
        continue;
      }
      if (!cur) continue;
      const label = v1 ? String(v1).trim() : '';
      if (!label || /sous.?total/i.test(label)) continue;
      if (/^source/i.test(label)) { byRef[cur].source = label; continue; }
      byRef[cur].lignes.push({
        rubrique: label,
        coutUnitaire: safeNum(r[2]), quantite: safeNum(r[3]), uniteQte: r[4] ? String(r[4]).trim() : null,
        frequence: safeNum(r[5]), uniteFreq: r[6] ? String(r[6]).trim() : null,
        tauxFin: safeNum(r[7]), totalFDJ: safeNum(r[8]), totalUSD: safeNum(r[9]),
      });
    }

    // Triple matching: ref → name → fuzzy
    result.activities.forEach(act => {
      const numRef = act.ref.replace('Act.','').trim();
      if (byRef[numRef]) { act.hypothese = byRef[numRef]; return; }
      const normName = normText(act.activite);
      if (byName[normName]) { act.hypothese = byName[normName]; return; }
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

  // ── Sommaire ──────────────────────────────────────────────────────────
  const somName = wb.SheetNames.find(n => /sommaire/i.test(n));
  if (somName) {
    const ws   = wb.Sheets[somName];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
    let subv = null;
    for (const r of rows) {
      const c0 = r[0] ? String(r[0]).trim() : null;
      const c1 = r[1] ? String(r[1]).trim() : null;
      if (!c1 || /entité/i.test(c1)) continue;
      if (c0 && !/subvention/i.test(c0)) subv = c0;
      if (subv) result.sommaire.push({ subvention:subv, entite:c1, solde:safeNum(r[2])||0, activites:safeNum(r[3])||0, reliquat:safeNum(r[4])||0, note: r[5] ? String(r[5]) : '' });
    }
  }

  return result;
}

// ── KPI computation ────────────────────────────────────────────────────────
const OS_COLOR  = { OS1:'#1a5fa8', OS2:'#007b8a', OS3:'#15803d', OS4:'#b45309', OS5:'#7c3aed', 'OS?':'#64748b' };
const SRC_COLOR = { CDS:'#4191ff', FAE:'#00b4c8', RSS:'#f59e0b', HPV:'#ef4444', VPI:'#8b5cf6', AUTRE:'#64748b' };

export function computeKPIs(raw) {
  const acts = raw.activities;
  if (!acts?.length) return null;

  const statuts = { Réalisé:0, 'En Cours':0, 'Non Démarré':0, Reprogrammé:0 };
  const bySrc={}, depBySrc={}, engBySrc={}, cntBySrc={};
  const byOS={}, cntByOS={}, realByOS={};

  acts.forEach(a => {
    const src = a.source || 'AUTRE';
    const os  = a.os || 'OS?';
    statuts[a.statut] !== undefined ? statuts[a.statut]++ : statuts['Non Démarré']++;
    bySrc[src]    = (bySrc[src]    || 0) + (a.budget_usd     || 0);
    depBySrc[src] = (depBySrc[src] || 0) + (a.budget_depense || 0);
    engBySrc[src] = (engBySrc[src] || 0) + (a.budget_engage  || 0);
    cntBySrc[src] = (cntBySrc[src] || 0) + 1;
    byOS[os]   = (byOS[os]   || 0) + (a.budget_usd || 0);
    cntByOS[os]= (cntByOS[os]|| 0) + 1;
    if (a.statut==='Réalisé') realByOS[os]=(realByOS[os]||0)+1;
  });

  const totalBudget  = Object.values(bySrc).reduce((s,v)=>s+v,0);
  const totalDepense = acts.reduce((s,a)=>s+(a.budget_depense||0),0);
  const totalEngage  = acts.reduce((s,a)=>s+(a.budget_engage ||0),0);

  const bySourceArr = Object.entries(bySrc).sort(([,a],[,b])=>b-a).map(([source,budget])=>({
    source, budget:Math.round(budget), depense:Math.round(depBySrc[source]||0), engage:Math.round(engBySrc[source]||0),
    activites:cntBySrc[source]||0, realise:acts.filter(a=>a.source===source&&a.statut==='Réalisé').length,
    tauxAbsorption:budget>0?Math.round((depBySrc[source]||0)/budget*100):0,
    color:SRC_COLOR[source]||'#64748b',
  }));

  const byOSArr = Object.entries(cntByOS).sort(([,a],[,b])=>b-a).map(([os,count])=>({
    os, count, budget:Math.round(byOS[os]||0), realise:realByOS[os]||0,
    taux:count>0?Math.round((realByOS[os]||0)/count*100):0, color:OS_COLOR[os]||'#64748b',
  }));

  const statutDonut = [
    {name:'Réalisé',     value:statuts.Réalisé,      color:'#22c55e'},
    {name:'En Cours',    value:statuts['En Cours'],   color:'#f59e0b'},
    {name:'Non Démarré', value:statuts['Non Démarré'],color:'#ef4444'},
    {name:'Reprogrammé', value:statuts.Reprogrammé,   color:'#6366f1'},
  ].filter(d=>d.value>0);

  return {
    totalActivites:acts.length, statuts, totalBudget:Math.round(totalBudget),
    totalDepense:Math.round(totalDepense), totalEngage:Math.round(totalEngage),
    tauxAbsorption:totalBudget>0?Math.round(totalDepense/totalBudget*100):0,
    statutDonut, bySourceArr, byOSArr,
    sommaire: raw.sommaire, OS_COLOR, SRC_COLOR,
  };
}

export function computeProgKPIs(activities) {
  if (!activities?.length) return null;
  const MONTHS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
  const OS_C   = { OS1:'#1a5fa8', OS2:'#007b8a', OS3:'#15803d', OS4:'#b45309', OS5:'#7c3aed', 'OS?':'#64748b' };

  const byOS={}, byGrp={}, timeline={};
  activities.forEach(a => {
    const os  = a.os || 'OS?';
    const grp = a.groupe || 'Autre';
    if (!byOS[os]) byOS[os]={os,total:0,realise:0,enCours:0,nonDemarre:0,reprog:0,budget:0,depense:0,color:OS_C[os]||'#64748b'};
    byOS[os].total++; byOS[os].budget+=(a.budget_usd||0); byOS[os].depense+=(a.budget_depense||0);
    if      (a.statut==='Réalisé')     byOS[os].realise++;
    else if (a.statut==='En Cours')    byOS[os].enCours++;
    else if (a.statut==='Reprogrammé') byOS[os].reprog++;
    else                               byOS[os].nonDemarre++;
    if (grp && grp!=='-') {
      if (!byGrp[grp]) byGrp[grp]={groupe:grp,total:0,realise:0,enCours:0,budget:0};
      byGrp[grp].total++; byGrp[grp].budget+=(a.budget_usd||0);
      if (a.statut==='Réalisé')  byGrp[grp].realise++;
      if (a.statut==='En Cours') byGrp[grp].enCours++;
    }
    if (a.date_fin) {
      const parts = String(a.date_fin).split(/[\/\-T ]/);
      let m = null;
      if (parts.length>=3) m = parts[0].length===4 ? parseInt(parts[1]) : parseInt(parts[1]);
      if (m && !isNaN(m) && m>=1 && m<=12) {
        const key = String(m).padStart(2,'0');
        if (!timeline[key]) timeline[key]={mois:MONTHS[m-1],key,total:0,realise:0,enCours:0};
        timeline[key].total++;
        if (a.statut==='Réalisé')  timeline[key].realise++;
        if (a.statut==='En Cours') timeline[key].enCours++;
      }
    }
  });

  return {
    byOS: Object.values(byOS).sort((a,b)=>b.total-a.total).map(o=>({...o, tauxRealisation:o.total>0?Math.round(o.realise/o.total*100):0, tauxAbsorption:o.budget>0?Math.round(o.depense/o.budget*100):0})),
    byGroupe: Object.values(byGrp).sort((a,b)=>b.total-a.total).map(g=>({...g,tauxRealisation:g.total>0?Math.round(g.realise/g.total*100):0})),
    timeline: Object.values(timeline).sort((a,b)=>a.key.localeCompare(b.key)),
  };
}
