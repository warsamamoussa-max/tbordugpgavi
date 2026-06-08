import React, { useState, useMemo } from 'react';
import { fmtUSD, fmtFDJ } from '../utils/storage';

const STATUT_STYLE = {
  'Réalisé':     { bg:'#dcfce7', color:'#15803d', border:'#86efac' },
  'En Cours':    { bg:'#fef3c7', color:'#b45309', border:'#fcd34d' },
  'Non Démarré': { bg:'#fee2e2', color:'#991b1b', border:'#fca5a5' },
  'Reprogrammé': { bg:'#ede9fe', color:'#6d28d9', border:'#c4b5fd' },
};

function HypoModal({ activity, onClose }) {
  const h = activity.hypothese;
  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:1000,background:'rgba(15,23,42,.5)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div onClick={e=>e.stopPropagation()} style={{background:'var(--surface)',borderRadius:16,width:'100%',maxWidth:720,maxHeight:'88vh',overflow:'hidden',display:'flex',flexDirection:'column',boxShadow:'0 24px 64px rgba(0,0,0,.18)'}}>
        {/* Modal header */}
        <div style={{padding:'20px 24px',borderBottom:'1px solid var(--border)',flexShrink:0}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:'var(--font-mono)',fontSize:9,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:5}}>
                {activity.ref} · {activity.os} · {activity.source}
              </div>
              <div style={{fontFamily:'var(--font-display)',fontSize:15,fontWeight:700,color:'var(--navy)',lineHeight:1.3}}>
                {activity.activite}
              </div>
              {activity.structure && <div style={{fontSize:11.5,color:'var(--muted)',marginTop:3}}>Structure : <strong style={{color:'var(--text)'}}>{activity.structure}</strong></div>}
            </div>
            <button onClick={onClose} style={{background:'none',border:'none',fontSize:22,color:'var(--muted)',cursor:'pointer',padding:'0 0 0 16px',lineHeight:1,flexShrink:0}}>×</button>
          </div>
          {/* Mini KPIs */}
          <div style={{display:'flex',gap:8,marginTop:12,flexWrap:'wrap'}}>
            {[
              {l:'Budget USD',v:fmtUSD(activity.budget_usd),c:'var(--teal)',bg:'var(--teal-light)',bd:'rgba(0,123,138,.25)'},
              {l:'Engagé',v:fmtUSD(activity.budget_engage),c:'var(--blue)',bg:'var(--blue-light)',bd:'#93c5fd'},
              {l:'Dépensé',v:fmtUSD(activity.budget_depense),c:'var(--ok)',bg:'var(--ok-light)',bd:'#86efac'},
              {l:'Budget FDJ',v:fmtFDJ(activity.budget_djf),c:'var(--navy)',bg:'var(--surface-2)',bd:'var(--border-2)'},
              ...(activity.statut?[{l:'Statut',v:activity.statut,c:STATUT_STYLE[activity.statut]?.color||'var(--muted)',bg:STATUT_STYLE[activity.statut]?.bg||'var(--surface-2)',bd:STATUT_STYLE[activity.statut]?.border||'var(--border-2)'}]:[]),
            ].map(k=>(
              <div key={k.l} style={{background:k.bg,border:`1px solid ${k.bd}`,borderRadius:6,padding:'5px 12px'}}>
                <div style={{fontFamily:'var(--font-mono)',fontSize:8,color:k.c,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:2}}>{k.l}</div>
                <div style={{fontFamily:'var(--font-mono)',fontSize:12.5,fontWeight:700,color:k.c}}>{k.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hypothèse */}
        <div style={{overflowY:'auto',flex:1,padding:'18px 24px'}}>
          {h ? (
            <>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14}}>
                <div>
                  <div style={{fontFamily:'var(--font-mono)',fontSize:9,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:4}}>Hypothèse budgétaire</div>
                  {h.source && <div style={{fontSize:12,color:'var(--teal)',fontStyle:'italic'}}>{h.source}</div>}
                </div>
                <div style={{display:'flex',gap:16}}>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontFamily:'var(--font-mono)',fontSize:8.5,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:3}}>Total FDJ</div>
                    <div style={{fontFamily:'var(--font-display)',fontSize:16,fontWeight:700,color:'var(--navy)'}}>{h.totalFDJ?.toLocaleString('fr-FR')??'—'}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontFamily:'var(--font-mono)',fontSize:8.5,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:3}}>Total USD</div>
                    <div style={{fontFamily:'var(--font-display)',fontSize:16,fontWeight:700,color:'var(--teal)'}}>{h.totalUSD?`$${h.totalUSD.toLocaleString('fr-FR')}`:'—'}</div>
                  </div>
                </div>
              </div>

              {h.lignes?.length > 0 && (
                <div className="table-wrap">
                  <table style={{fontSize:11.5}}>
                    <thead>
                      <tr>
                        <th style={{width:'30%'}}>Rubrique</th>
                        <th style={{textAlign:'right'}}>Coût unit.</th>
                        <th style={{textAlign:'right'}}>Qté</th>
                        <th>Unité</th>
                        <th style={{textAlign:'right'}}>Fréq.</th>
                        <th>U.Fréq</th>
                        <th style={{textAlign:'right'}}>Taux</th>
                        <th style={{textAlign:'right'}}>Total FDJ</th>
                        <th style={{textAlign:'right'}}>Total USD</th>
                      </tr>
                    </thead>
                    <tbody>
                      {h.lignes.map((l,i)=>(
                        <tr key={i}>
                          <td style={{fontWeight:500}}>{l.rubrique}</td>
                          <td style={{textAlign:'right',fontFamily:'var(--font-mono)'}}>{l.coutUnitaire?.toLocaleString('fr-FR')??'—'}</td>
                          <td style={{textAlign:'right',fontFamily:'var(--font-mono)'}}>{l.quantite??'—'}</td>
                          <td style={{color:'var(--muted)'}}>{l.uniteQte??''}</td>
                          <td style={{textAlign:'right',fontFamily:'var(--font-mono)'}}>{l.frequence??'—'}</td>
                          <td style={{color:'var(--muted)'}}>{l.uniteFreq??''}</td>
                          <td style={{textAlign:'right',fontFamily:'var(--font-mono)'}}>{l.tauxFin!=null?`${l.tauxFin}%`:'—'}</td>
                          <td style={{textAlign:'right',fontFamily:'var(--font-mono)',fontWeight:500}}>{l.totalFDJ?.toLocaleString('fr-FR')??'—'}</td>
                          <td style={{textAlign:'right',fontFamily:'var(--font-mono)',color:'var(--teal)',fontWeight:600}}>{l.totalUSD?`$${l.totalUSD}`:'—'}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={7} style={{fontWeight:700}}>TOTAL</td>
                        <td style={{textAlign:'right'}}>{h.totalFDJ?.toLocaleString('fr-FR')??'—'}</td>
                        <td style={{textAlign:'right',color:'var(--teal)'}}>{h.totalUSD?`$${h.totalUSD}`:'—'}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div style={{padding:24,textAlign:'center',color:'var(--muted)',fontFamily:'var(--font-mono)',fontSize:11}}>
              Aucune hypothèse budgétaire associée à cette activité
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TabPlanTravail({ rawData }) {
  const activities = rawData?.activities || [];
  const [search,     setSearch]     = useState('');
  const [filterOS,   setFilterOS]   = useState('');
  const [filterSrc,  setFilterSrc]  = useState('');
  const [filterStat, setFilterStat] = useState('');
  const [selected,   setSelected]   = useState(null);

  const allOS   = useMemo(()=>[...new Set(activities.map(a=>a.os))].sort(), [activities]);
  const allSrc  = useMemo(()=>[...new Set(activities.map(a=>a.source))].sort(), [activities]);
  const allStat = ['Réalisé','En Cours','Non Démarré','Reprogrammé'];

  const filtered = useMemo(()=>{
    const q = search.toLowerCase();
    return activities.filter(a=>
      (!q         || a.activite.toLowerCase().includes(q) || a.ref.toLowerCase().includes(q) || a.structure.toLowerCase().includes(q)) &&
      (!filterOS  || a.os===filterOS) &&
      (!filterSrc || a.source===filterSrc) &&
      (!filterStat|| a.statut===filterStat)
    );
  },[activities,search,filterOS,filterSrc,filterStat]);

  const totalBudget  = filtered.reduce((s,a)=>s+(a.budget_usd||0),0);
  const totalDepense = filtered.reduce((s,a)=>s+(a.budget_depense||0),0);

  if (!activities.length) return (
    <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--muted)',fontFamily:'var(--font-mono)',fontSize:12}}>
      Chargez un fichier PTA pour voir le plan de travail
    </div>
  );

  return (
    <>
      {selected && <HypoModal activity={selected} onClose={()=>setSelected(null)}/>}

      {/* Filters */}
      <div className="filter-row">
        <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher une activité, structure…" style={{flex:1,minWidth:200}}/>
        <select value={filterOS}   onChange={e=>setFilterOS(e.target.value)}><option value="">Tous les OS</option>{allOS.map(o=><option key={o} value={o}>{o}</option>)}</select>
        <select value={filterSrc}  onChange={e=>setFilterSrc(e.target.value)}><option value="">Toutes les sources</option>{allSrc.map(s=><option key={s} value={s}>{s}</option>)}</select>
        <select value={filterStat} onChange={e=>setFilterStat(e.target.value)}><option value="">Tous les statuts</option>{allStat.map(s=><option key={s} value={s}>{s}</option>)}</select>
        <span style={{fontFamily:'var(--font-mono)',fontSize:10.5,color:'var(--muted)',whiteSpace:'nowrap'}}>
          {filtered.length}/{activities.length} · {fmtUSD(totalBudget)}
        </span>
      </div>

      {/* Table */}
      <div className="table-wrap" style={{flex:1}}>
        <table>
          <thead>
            <tr>
              <th style={{width:95}}>Réf.</th>
              <th>Activité</th>
              <th style={{width:50}}>OS</th>
              <th style={{width:60}}>Source</th>
              <th style={{textAlign:'right',width:95}}>Budget USD</th>
              <th style={{textAlign:'right',width:85}}>Dépensé</th>
              <th style={{width:125}}>Statut</th>
              <th style={{width:90}}>Échéance</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a=>{
              const ss = STATUT_STYLE[a.statut]||STATUT_STYLE['Non Démarré'];
              return (
                <tr key={a.ref} style={{cursor:'pointer'}} onClick={()=>setSelected(a)}>
                  <td style={{fontFamily:'var(--font-mono)',fontSize:10.5,color:'var(--teal)',fontWeight:600}}>{a.ref}</td>
                  <td>
                    <div style={{fontWeight:500,color:'var(--text-hi)',lineHeight:1.4}}>{a.activite}</div>
                    {a.structure && <div style={{fontSize:10.5,color:'var(--muted)',marginTop:1}}>{a.structure}</div>}
                  </td>
                  <td style={{fontFamily:'var(--font-mono)',fontSize:10,fontWeight:700,color:'var(--navy)'}}>{a.os}</td>
                  <td><span className="badge" style={{background:'var(--surface-2)',color:'var(--text)',border:'1px solid var(--border)'}}>{a.source}</span></td>
                  <td style={{textAlign:'right',fontFamily:'var(--font-mono)',fontSize:11.5,fontWeight:700}}>{fmtUSD(a.budget_usd)}</td>
                  <td style={{textAlign:'right',fontFamily:'var(--font-mono)',fontSize:11,color:'var(--ok)'}}>{fmtUSD(a.budget_depense)}</td>
                  <td><span className="badge" style={{background:ss.bg,color:ss.color,border:`1px solid ${ss.border}`}}>{a.statut}</span></td>
                  <td style={{fontFamily:'var(--font-mono)',fontSize:10.5,color:'var(--muted)'}}>{a.date_fin||'—'}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4} style={{fontWeight:700}}>Total ({filtered.length} activités)</td>
              <td style={{textAlign:'right'}}>{fmtUSD(totalBudget)}</td>
              <td style={{textAlign:'right',color:'var(--ok)'}}>{fmtUSD(totalDepense)}</td>
              <td colSpan={2}/>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
}
