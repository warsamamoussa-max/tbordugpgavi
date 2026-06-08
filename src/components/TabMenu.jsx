import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { fmtUSD, fmtPct } from '../utils/storage';

const DEMO = {
  totalActivites:101, statuts:{ Réalisé:28, 'En Cours':16, 'Non Démarré':55, Reprogrammé:2 },
  totalBudget:2079000, totalDepense:460000, tauxAbsorption:22,
  statutDonut:[{name:'Réalisé',value:28,color:'#22c55e'},{name:'En Cours',value:16,color:'#f59e0b'},{name:'Non Démarré',value:55,color:'#ef4444'},{name:'Reprogrammé',value:2,color:'#6366f1'}],
  bySourceArr:[{source:'RSS',budget:795000,depense:120000,color:'#f59e0b'},{source:'FAE',budget:755000,depense:210000,color:'#00b4c8'},{source:'CDS',budget:414000,depense:90000,color:'#4191ff'},{source:'HPV',budget:115000,depense:35000,color:'#ef4444'}],
  byOSArr:[{os:'OS1',count:53,color:'#1a5fa8'},{os:'OS3',count:33,color:'#15803d'},{os:'OS5',count:11,color:'#7c3aed'},{os:'OS2',count:8,color:'#007b8a'},{os:'OS4',count:1,color:'#b45309'}],
};

function absColor(v) { return v>=80?'var(--ok)':v>=50?'var(--warn)':'var(--danger)'; }

export default function TabMenu({ kpis }) {
  const d = kpis || DEMO;
  const nR = d.statuts.Réalisé, nC = d.statuts['En Cours'], nN = d.statuts['Non Démarré'];
  const osMax = d.byOSArr.length ? Math.max(...d.byOSArr.map(o=>o.count)) : 1;

  const kpiCards = [
    { label:'Activités PTA',      value:d.totalActivites,                 sub:'Total 2026',          color:'var(--teal)' },
    { label:'Réalisées',          value:nR,                                sub:`${d.totalActivites ? Math.round(nR/d.totalActivites*100) : 0}% du plan`, color:'var(--ok)' },
    { label:'En cours',           value:nC,                                sub:'En exécution',        color:'var(--warn)' },
    { label:'Non démarrées',      value:nN,                                sub:'À lancer',            color:'var(--danger)' },
    { label:'Budget total',       value:fmtUSD(d.totalBudget),            sub:'4 subventions',       color:'var(--blue)' },
    { label:"Taux d'absorption",  value:fmtPct(d.tauxAbsorption),         sub:fmtUSD(d.totalDepense)+' dépensés', color:absColor(d.tauxAbsorption) },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {/* KPI cards */}
      <div className="kpi-grid">
        {kpiCards.map((k,i) => (
          <div key={k.label} className={`kpi-card fade-up-${i}`} style={{'--kpi-color':k.color}}>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{fontSize:typeof k.value==='string'?20:28}}>{k.value}</div>
            <div className="kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {/* Statut donut */}
        <div className="card fade-up-3">
          <div className="card-title">Statut des activités</div>
          <div style={{ display:'flex', gap:16, alignItems:'center' }}>
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={d.statutDonut} cx="50%" cy="50%" innerRadius={42} outerRadius={62} dataKey="value" strokeWidth={0}>
                  {d.statutDonut.map((e,i) => <Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip formatter={v=>[v,'activités']} contentStyle={{fontFamily:'var(--font-mono)',fontSize:10}}/>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8 }}>
              {d.statutDonut.map(s => (
                <div key={s.name} style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{width:8,height:8,borderRadius:'50%',background:s.color,flexShrink:0}}/>
                  <span style={{fontFamily:'var(--font-mono)',fontSize:10.5,flex:1}}>{s.name}</span>
                  <span style={{fontFamily:'var(--font-mono)',fontSize:11,fontWeight:700}}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Budget par source */}
        <div className="card fade-up-4">
          <div className="card-title">Budget par subvention (USD)</div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={d.bySourceArr} margin={{top:0,right:8,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" vertical={false}/>
              <XAxis dataKey="source" tick={{fontFamily:'var(--font-mono)',fontSize:10,fill:'var(--muted)'}} axisLine={false} tickLine={false}/>
              <YAxis hide/>
              <Tooltip formatter={v=>[fmtUSD(v)]} contentStyle={{fontFamily:'var(--font-mono)',fontSize:10}}/>
              <Bar dataKey="budget" name="Budget" radius={[3,3,0,0]}>
                {d.bySourceArr.map((e,i) => <Cell key={i} fill={e.color}/>)}
              </Bar>
              <Bar dataKey="depense" name="Dépensé" fill="rgba(0,0,0,.18)" radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activités par OS */}
      <div className="card fade-up-5">
        <div className="card-title">Activités par objectif stratégique</div>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {d.byOSArr.map(os => (
            <div key={os.os}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                <span style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--muted)'}}>{os.os}</span>
                <span style={{fontFamily:'var(--font-mono)',fontSize:10,fontWeight:600}}>
                  {os.count} <span style={{fontWeight:400,color:'var(--muted)'}}>activités</span>
                </span>
              </div>
              <div className="progress">
                <div className="progress-fill" style={{width:`${Math.round(os.count/osMax*100)}%`,background:os.color}}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
