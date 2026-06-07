import React, { useState, useRef } from 'react';
import { parseXLSX, computeKPIs } from '../parseXLSX.js';
import { savePTA, getAdminHash } from '../utils.js';

export default function AdminTab({ kpis, fileName, lastDate, onDataLoaded }) {
  const [status,   setStatus]   = useState(null);  // { type:'ok'|'err'|'info', text }
  const [loading,  setLoading]  = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    setLoading(true);
    setStatus({ type:'info', text:`Lecture de ${file.name}…` });
    try {
      const buf     = await file.arrayBuffer();
      const rawData = parseXLSX(buf);
      const kpiData = computeKPIs(rawData);

      if (!rawData.activities.length) throw new Error("Impossible de lire les activités dans ce fichier.");

      setStatus({ type:'info', text:`${rawData.activities.length} activités parsées. Envoi au serveur…` });

      const adminHash = getAdminHash();
      const today     = new Date().toLocaleDateString('fr-FR', { day:'2-digit', month:'long', year:'numeric' });

      await savePTA(rawData, kpiData, file.name, today, adminHash);

      setStatus({ type:'ok', text:`✓ ${file.name} chargé avec succès — ${rawData.activities.length} activités, ${rawData.meta.hypCount ?? 0} hypothèses.` });
      onDataLoaded(rawData, kpiData, file.name, today);
    } catch (err) {
      setStatus({ type:'err', text:`⚠️ ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const onDrop  = e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); };
  const onChange= e => handleFile(e.target.files[0]);

  const statusColors = {
    ok:   { bg:'var(--ok-light)',   color:'var(--ok)',   border:'#9ad4b5' },
    err:  { bg:'var(--danger-light)',color:'var(--danger)',border:'#de9aa0' },
    info: { bg:'var(--blue-light)', color:'var(--blue)', border:'#a0bde0' },
  };

  const infoPanels = [
    { label:'Fichier PTA actif',      value: fileName || 'Aucun fichier chargé' },
    { label:'Dernière mise à jour',   value: lastDate  || '—' },
    { label:'Activités chargées',     value: kpis ? `${kpis.totalActivites} activités` : '—' },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {/* Info panels */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
        {infoPanels.map(p => (
          <div key={p.label} className="card">
            <div style={{ fontFamily:'var(--f-mono)', fontSize:9.5, color:'var(--t-dim)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:7 }}>{p.label}</div>
            <div style={{ fontFamily:'var(--f-body)', fontSize:13, fontWeight:600, color:'var(--t-hi)', wordBreak:'break-word' }}>{p.value}</div>
          </div>
        ))}
      </div>

      {/* Info notice */}
      <div style={{ padding:'10px 14px', background:'var(--blue-light)', border:'1px solid #a0bde0', borderRadius:'var(--r-m)', fontSize:11.5, color:'var(--t-body)', lineHeight:1.7 }}>
        ℹ️ Les données chargées ici sont{' '}
        <strong style={{ color:'var(--t-hi)' }}>sauvegardées sur le serveur Netlify</strong>{' '}
        et accessibles immédiatement par tous les visiteurs, quel que soit leur navigateur ou appareil.
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, alignItems:'start' }}>
        {/* Upload area */}
        <div className="card" style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ fontFamily:'var(--f-mono)', fontWeight:700, fontSize:12.5 }}>📂 Charger un nouveau fichier PTA</div>

          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${dragOver ? 'var(--teal)' : 'var(--br-hi)'}`,
              borderRadius: 'var(--r-l)', padding: '32px 20px',
              textAlign: 'center', cursor: 'pointer',
              background: dragOver ? 'var(--teal-light)' : 'transparent',
              transition: 'all .2s',
            }}
          >
            <input ref={inputRef} type="file" accept=".xlsx,.xlsm,.xls" onChange={onChange} style={{ display:'none' }} />
            <div style={{ fontSize:28, marginBottom:8 }}>📊</div>
            <div style={{ fontFamily:'var(--f-mono)', fontSize:11, color:'var(--t-dim)' }}>
              Glissez votre fichier PTA ici<br />
              ou cliquez pour parcourir
            </div>
            <div style={{ marginTop:8, fontFamily:'var(--f-mono)', fontSize:9, color:'var(--br-focus)', letterSpacing:'.05em' }}>
              .xlsx · .xlsm · .xls
            </div>
          </div>

          {loading && (
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'var(--surface-2)', borderRadius:'var(--r-m)' }}>
              <span className="spinner" style={{ width:16, height:16 }} />
              <span style={{ fontFamily:'var(--f-mono)', fontSize:11, color:'var(--t-dim)' }}>{status?.text || 'Traitement…'}</span>
            </div>
          )}

          {!loading && status && (
            <div style={{
              padding:'10px 14px',
              background: statusColors[status.type]?.bg,
              color: statusColors[status.type]?.color,
              border: `1px solid ${statusColors[status.type]?.border}`,
              borderRadius: 'var(--r-m)', fontSize:12, lineHeight:1.5,
            }}>
              {status.text}
            </div>
          )}
        </div>

        {/* Sheets guide */}
        <div className="card" style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ fontFamily:'var(--f-mono)', fontWeight:700, fontSize:12.5 }}>📋 Feuilles attendues</div>
          {[
            { name:'Suivi budgétaire', desc:'Liste principale des activités PTA (colonnes : réf., activité, budget, statut, dates…)', required:true },
            { name:'Hypothèse Act 2026', desc:'Détail des hypothèses budgétaires par activité (lignes, coûts unitaires, quantités)', required:false },
            { name:'Sommaire', desc:'Récapitulatif financier par subvention et entité de mise en œuvre', required:false },
          ].map(s => (
            <div key={s.name} style={{ padding:'10px 12px', background:'var(--surface-2)', borderRadius:'var(--r-m)', border:'1px solid var(--br)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                <span style={{ fontFamily:'var(--f-mono)', fontSize:11, fontWeight:600, color:'var(--navy)' }}>{s.name}</span>
                {s.required && <span className="badge" style={{ background:'var(--teal-light)', color:'var(--teal)', border:'1px solid var(--teal-mid)', fontSize:8.5 }}>Requis</span>}
              </div>
              <div style={{ fontSize:11, color:'var(--t-dim)', lineHeight:1.5 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
