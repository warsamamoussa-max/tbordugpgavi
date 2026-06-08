import React, { useState, useRef } from 'react';
import { parsePTAFile, computeKPIs } from '../utils/parseExcel';
import { savePTARemote, getSessionHash, fmtUSD } from '../utils/storage';

export default function TabAdmin({ kpis, fileName, parseDate, onDataLoaded }) {
  const [status,   setStatus]   = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    setLoading(true);
    setStatus({type:'info', text:`Lecture de ${file.name}…`});
    try {
      const buf     = await file.arrayBuffer();
      const rawData = parsePTAFile(buf);
      if (!rawData.activities.length) throw new Error("Aucune activité trouvée dans ce fichier.");
      const kpiData = computeKPIs(rawData);
      setStatus({type:'info', text:`${rawData.activities.length} activités parsées · ${rawData.meta.hypCount??0} hypothèses. Envoi…`});
      const hash  = getSessionHash();
      const today = new Date().toLocaleDateString('fr-FR',{day:'2-digit',month:'long',year:'numeric'});
      await savePTARemote(rawData, kpiData, file.name, today, hash);
      setStatus({type:'ok', text:`✓ ${file.name} — ${rawData.activities.length} activités chargées avec succès.`});
      onDataLoaded(rawData, kpiData, file.name, today);
    } catch(err) {
      setStatus({type:'err', text:`⚠️ ${err.message}`});
    } finally { setLoading(false); }
  };

  const onDrop  = e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); };
  const onChange= e => handleFile(e.target.files[0]);

  const ALERT = {ok:'alert-ok',err:'alert-err',info:'alert-info'};

  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      {/* Info panels */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
        {[
          {l:'Fichier PTA actif',    v:fileName||'Aucun fichier chargé'},
          {l:'Dernière mise à jour', v:parseDate||'—'},
          {l:'Activités chargées',   v:kpis?`${kpis.totalActivites} activités · Budget ${fmtUSD(kpis.totalBudget)}`:'—'},
        ].map(p=>(
          <div key={p.l} className="card">
            <div style={{fontFamily:'var(--font-mono)',fontSize:9.5,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:6}}>{p.l}</div>
            <div style={{fontFamily:'var(--font-body)',fontSize:12.5,fontWeight:600,color:'var(--text-hi)',wordBreak:'break-word'}}>{p.v}</div>
          </div>
        ))}
      </div>

      <div className="alert alert-info" style={{fontSize:12}}>
        ℹ️ Les données chargées sont <strong>sauvegardées sur le serveur Netlify</strong> et accessibles immédiatement par tous les visiteurs, quel que soit leur navigateur ou appareil.
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,alignItems:'start'}}>
        {/* Upload */}
        <div className="card" style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{fontFamily:'var(--font-mono)',fontWeight:700,fontSize:12.5}}>📂 Charger un nouveau fichier PTA</div>

          <div
            className={`dropzone${dragOver?' dragover':''}`}
            onDragOver={e=>{e.preventDefault();setDragOver(true)}}
            onDragLeave={()=>setDragOver(false)}
            onDrop={onDrop}
            onClick={()=>inputRef.current?.click()}
          >
            <input ref={inputRef} type="file" accept=".xlsx,.xlsm,.xls" onChange={onChange} style={{display:'none'}}/>
            <div className="dropzone-icon">📊</div>
            <div className="dropzone-text">Glissez votre fichier PTA ici<br/>ou cliquez pour parcourir</div>
            <div className="dropzone-hint">.xlsx · .xlsm · .xls</div>
          </div>

          {loading && (
            <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:'var(--surface-2)',borderRadius:'var(--r)'}}>
              <span className="spinner" style={{width:16,height:16}}/>
              <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--muted)'}}>{status?.text||'Traitement…'}</span>
            </div>
          )}
          {!loading && status && (
            <div className={`alert ${ALERT[status.type]||'alert-info'}`}>{status.text}</div>
          )}
        </div>

        {/* Guide */}
        <div className="card" style={{display:'flex',flexDirection:'column',gap:10}}>
          <div style={{fontFamily:'var(--font-mono)',fontWeight:700,fontSize:12.5}}>📋 Feuilles attendues</div>
          {[
            {name:'Suivi budgétaire',    desc:'Activités PTA (réf., activité, budget, statut, dates…)', req:true},
            {name:'Hypothèse Act 2026',  desc:'Détail des hypothèses budgétaires par activité', req:false},
            {name:'Sommaire',            desc:'Récapitulatif financier par subvention et entité', req:false},
          ].map(s=>(
            <div key={s.name} style={{padding:'10px 12px',background:'var(--surface-2)',borderRadius:'var(--r)',border:'1px solid var(--border)'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                <span style={{fontFamily:'var(--font-mono)',fontSize:11,fontWeight:700,color:'var(--navy)'}}>{s.name}</span>
                {s.req && <span className="badge" style={{background:'var(--teal-light)',color:'var(--teal)',border:'1px solid rgba(0,123,138,.25)',fontSize:8.5}}>Requis</span>}
              </div>
              <div style={{fontSize:11,color:'var(--muted)',lineHeight:1.5}}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
