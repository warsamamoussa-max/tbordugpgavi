import React, { useState, useMemo } from 'react';
import { fmtUSD } from '../utils.js';

const STATUT_STYLE = {
  'Réalisé':     { bg:'var(--ok-light)',   color:'var(--ok)',   border:'#9ad4b5' },
  'En Cours':    { bg:'var(--warn-light)', color:'var(--warn)', border:'#f0d080' },
  'Non Démarré': { bg:'var(--danger-light)',color:'var(--danger)',border:'#de9aa0' },
  'Reprogrammé': { bg:'var(--blue-light)', color:'var(--blue)', border:'#a0bde0' },
};

function StatutBadge({ statut }) {
  const s = STATUT_STYLE[statut] || STATUT_STYLE['Non Démarré'];
  return (
    <span className="badge" style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}` }}>
      {statut}
    </span>
  );
}

function HypoModal({ activity, onClose }) {
  const h = activity.hypothese;
  const fmtFDJ = v => v ? Math.round(v).toLocaleString('fr-FR') : '—';

  return (
    <div
      onClick={onClose}
      style={{
        position:'fixed', inset:0, zIndex:1000,
        background:'rgba(26,45,74,.45)', backdropFilter:'blur(3px)',
        display:'flex', alignItems:'center', justifyContent:'center', padding:24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background:'var(--surface)', borderRadius:'var(--r-xl)',
          width:'100%', maxWidth:700, maxHeight:'85vh',
          overflow:'hidden', display:'flex', flexDirection:'column',
          boxShadow:'var(--sh-lg)',
        }}
      >
        {/* Header */}
        <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--br)', flexShrink:0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div>
              <div style={{ fontFamily:'var(--f-mono)', fontSize:9, color:'var(--t-dim)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:5 }}>
                {activity.ref} — {activity.os}
              </div>
              <div style={{ fontFamily:'var(--f-display)', fontSize:15, fontWeight:600, color:'var(--navy)', lineHeight:1.3 }}>
                {activity.activite}
              </div>
              {activity.structure && (
                <div style={{ fontSize:11.5, color:'var(--t-dim)', marginTop:4 }}>Structure : <strong style={{ color:'var(--t-body)', fontWeight:600 }}>{activity.structure}</strong></div>
              )}
            </div>
            <button
              onClick={onClose}
              style={{ background:'none', border:'none', fontSize:20, color:'var(--t-dim)', padding:'0 0 0 16px', lineHeight:1 }}
            >×</button>
          </div>
          {/* Mini KPIs */}
          <div style={{ display:'flex', gap:10, marginTop:14, flexWrap:'wrap' }}>
            {[
              { l:'Budget USD', v: activity.budget_usd ? '$'+Math.round(activity.budget_usd).toLocaleString('fr-FR') : '—', c:'var(--teal)', bg:'var(--teal-light)', bd:'var(--teal-mid)' },
              { l:'Engagé',     v: activity.budget_engage  ? '$'+Math.round(activity.budget_engage).toLocaleString('fr-FR') : '—', c:'var(--blue)', bg:'var(--blue-light)', bd:'#a0bde0' },
              { l:'Dépensé',    v: activity.budget_depense ? '$'+Math.round(activity.budget_depense).toLocaleString('fr-FR') : '—', c:'var(--ok)', bg:'var(--ok-light)', bd:'#9ad4b5' },
              { l:'Budget DJF', v: activity.budget_djf     ? Math.round(activity.budget_djf).toLocaleString('fr-FR')+' FDJ' : '—', c:'var(--navy)', bg:'var(--surface)', bd:'var(--br-hi)' },
              ...(activity.type ? [{ l:'Type', v:activity.type, c:'var(--gold)', bg:'var(--gold-light)', bd:'#e0c070' }] : []),
            ].map(k => (
              <div key={k.l} style={{ background:k.bg, border:`1px solid ${k.bd}`, borderRadius:'var(--r-m)', padding:'5px 12px' }}>
                <div style={{ fontFamily:'var(--f-mono)', fontSize:8.5, color:k.c, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:2 }}>{k.l}</div>
                <div style={{ fontFamily:'var(--f-mono)', fontSize:12.5, fontWeight:600, color:k.c }}>{k.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hypothèse content */}
        <div style={{ overflowY:'auto', flex:1, padding:'16px 24px' }}>
          {h ? (
            <>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                <div>
                  <div style={{ fontFamily:'var(--f-mono)', fontSize:9, color:'var(--t-dim)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:5 }}>Hypothèse budgétaire</div>
                  {h.source && <div style={{ fontFamily:'var(--f-body)', fontSize:12, color:'var(--teal)', fontStyle:'italic' }}>{h.source}</div>}
                </div>
                <div style={{ display:'flex', gap:16 }}>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontFamily:'var(--f-mono)', fontSize:9, color:'var(--t-dim)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:4 }}>Total FDJ</div>
                    <div style={{ fontFamily:'var(--f-display)', fontSize:17, fontWeight:600, color:'var(--navy)' }}>{fmtFDJ(h.totalFDJ)}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontFamily:'var(--f-mono)', fontSize:9, color:'var(--t-dim)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:4 }}>Total USD</div>
                    <div style={{ fontFamily:'var(--f-display)', fontSize:17, fontWeight:600, color:'var(--teal)' }}>{h.totalUSD ? `$${h.totalUSD.toLocaleString('fr-FR')}` : '—'}</div>
                  </div>
                </div>
              </div>

              {h.lignes?.length > 0 && (
                <div style={{ border:'1px solid var(--br)', borderRadius:'var(--r-m)', overflow:'hidden' }}>
                  <table style={{ fontSize:11.5 }}>
                    <thead>
                      <tr>
                        <th style={{ width:'35%' }}>Rubrique</th>
                        <th style={{ textAlign:'right' }}>Coût unit.</th>
                        <th style={{ textAlign:'right' }}>Qté</th>
                        <th>Unité</th>
                        <th style={{ textAlign:'right' }}>Freq.</th>
                        <th>Unité freq.</th>
                        <th style={{ textAlign:'right' }}>Taux fin.</th>
                        <th style={{ textAlign:'right' }}>Total FDJ</th>
                        <th style={{ textAlign:'right' }}>Total USD</th>
                      </tr>
                    </thead>
                    <tbody>
                      {h.lignes.map((l, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight:500 }}>{l.rubrique}</td>
                          <td style={{ textAlign:'right', fontFamily:'var(--f-mono)' }}>{l.coutUnitaire?.toLocaleString('fr-FR') ?? '—'}</td>
                          <td style={{ textAlign:'right', fontFamily:'var(--f-mono)' }}>{l.quantite ?? '—'}</td>
                          <td style={{ color:'var(--t-dim)' }}>{l.uniteQte ?? ''}</td>
                          <td style={{ textAlign:'right', fontFamily:'var(--f-mono)' }}>{l.frequence ?? '—'}</td>
                          <td style={{ color:'var(--t-dim)' }}>{l.uniteFreq ?? ''}</td>
                          <td style={{ textAlign:'right', fontFamily:'var(--f-mono)' }}>{l.tauxFin != null ? `${l.tauxFin}%` : '—'}</td>
                          <td style={{ textAlign:'right', fontFamily:'var(--f-mono)', fontWeight:500 }}>{l.totalFDJ?.toLocaleString('fr-FR') ?? '—'}</td>
                          <td style={{ textAlign:'right', fontFamily:'var(--f-mono)', color:'var(--teal)', fontWeight:500 }}>{l.totalUSD ? `$${l.totalUSD}` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={7} style={{ fontWeight:600 }}>TOTAL</td>
                        <td style={{ textAlign:'right' }}>{fmtFDJ(h.totalFDJ)}</td>
                        <td style={{ textAlign:'right', color:'var(--teal)' }}>{h.totalUSD ? `$${h.totalUSD}` : '—'}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div style={{ padding:'24px', textAlign:'center', color:'var(--t-dim)', fontFamily:'var(--f-mono)', fontSize:11 }}>
              Aucune hypothèse budgétaire associée à cette activité
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PlanTab({ rawData }) {
  const activities = rawData?.activities || [];
  const [search,     setSearch]     = useState('');
  const [filterOS,   setFilterOS]   = useState('');
  const [filterSrc,  setFilterSrc]  = useState('');
  const [filterStat, setFilterStat] = useState('');
  const [selected,   setSelected]   = useState(null);

  const allOS    = useMemo(() => [...new Set(activities.map(a => a.os))].sort(),  [activities]);
  const allSrc   = useMemo(() => [...new Set(activities.map(a => a.source))].sort(), [activities]);
  const allStats = ['Réalisé', 'En Cours', 'Non Démarré', 'Reprogrammé'];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return activities.filter(a =>
      (!q      || a.activite.toLowerCase().includes(q) || a.ref.toLowerCase().includes(q) || a.structure.toLowerCase().includes(q)) &&
      (!filterOS   || a.os     === filterOS) &&
      (!filterSrc  || a.source === filterSrc) &&
      (!filterStat || a.statut === filterStat)
    );
  }, [activities, search, filterOS, filterSrc, filterStat]);

  const totalBudget = filtered.reduce((s, a) => s + (a.budget_usd || 0), 0);

  if (!activities.length) {
    return (
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--t-dim)', fontFamily:'var(--f-mono)', fontSize:12 }}>
        Chargez un fichier PTA pour voir le plan de travail
      </div>
    );
  }

  return (
    <>
      {selected && <HypoModal activity={selected} onClose={() => setSelected(null)} />}

      {/* Filters */}
      <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap', marginBottom:14 }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher une activité, structure…"
          style={{ flex:1, minWidth:200, padding:'8px 12px' }}
        />
        <select value={filterOS} onChange={e => setFilterOS(e.target.value)} style={{ padding:'8px 10px' }}>
          <option value="">Tous les OS</option>
          {allOS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <select value={filterSrc} onChange={e => setFilterSrc(e.target.value)} style={{ padding:'8px 10px' }}>
          <option value="">Toutes les sources</option>
          {allSrc.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterStat} onChange={e => setFilterStat(e.target.value)} style={{ padding:'8px 10px' }}>
          <option value="">Tous les statuts</option>
          {allStats.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <div style={{ fontFamily:'var(--f-mono)', fontSize:10.5, color:'var(--t-dim)', whiteSpace:'nowrap' }}>
          {filtered.length} / {activities.length} · {fmtUSD(totalBudget)}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding:0, overflow:'hidden', flex:1, display:'flex', flexDirection:'column' }}>
        <div style={{ overflowY:'auto', flex:1 }}>
          <table>
            <thead>
              <tr>
                <th style={{ width:90 }}>Réf.</th>
                <th>Activité</th>
                <th style={{ width:50 }}>OS</th>
                <th style={{ width:60 }}>Source</th>
                <th style={{ textAlign:'right', width:90 }}>Budget USD</th>
                <th style={{ textAlign:'right', width:80 }}>Dépensé</th>
                <th style={{ width:120 }}>Statut</th>
                <th style={{ width:90 }}>Échéance</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.ref} style={{ cursor:'pointer' }} onClick={() => setSelected(a)}>
                  <td style={{ fontFamily:'var(--f-mono)', fontSize:10.5, color:'var(--teal)', fontWeight:500 }}>{a.ref}</td>
                  <td>
                    <div style={{ fontWeight:500, color:'var(--t-hi)', lineHeight:1.4 }}>{a.activite}</div>
                    {a.structure && <div style={{ fontSize:10.5, color:'var(--t-dim)', marginTop:2 }}>{a.structure}</div>}
                  </td>
                  <td style={{ fontFamily:'var(--f-mono)', fontSize:10, fontWeight:600, color:'var(--navy)' }}>{a.os}</td>
                  <td>
                    <span className="badge" style={{ background:'var(--surface-2)', color:'var(--t-body)', border:'1px solid var(--br)' }}>{a.source}</span>
                  </td>
                  <td style={{ textAlign:'right', fontFamily:'var(--f-mono)', fontSize:11.5, fontWeight:600, color:'var(--navy)' }}>{fmtUSD(a.budget_usd)}</td>
                  <td style={{ textAlign:'right', fontFamily:'var(--f-mono)', fontSize:11, color:'var(--ok)' }}>{fmtUSD(a.budget_depense)}</td>
                  <td><StatutBadge statut={a.statut} /></td>
                  <td style={{ fontFamily:'var(--f-mono)', fontSize:10.5, color:'var(--t-dim)' }}>{a.date_fin || '—'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} style={{ fontWeight:600 }}>Total ({filtered.length} activités)</td>
                <td style={{ textAlign:'right', fontWeight:700 }}>{fmtUSD(totalBudget)}</td>
                <td style={{ textAlign:'right', color:'var(--ok)', fontWeight:600 }}>{fmtUSD(filtered.reduce((s,a) => s+(a.budget_depense||0),0))}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  );
}
