import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { fmtUSD, fmtPct } from '../utils.js';

// ── Demo fallback data ──────────────────────────────────────────────────────
const DEMO = {
  totalActivites: 100,
  totalBudget:    2079000,
  totalDepense:   460000,
  totalEngage:    560000,
  tauxAbsorption: 22,
  statutDonut: [
    { name:'Réalisé',     value:28, color:'#34d9a0' },
    { name:'En Cours',    value:16, color:'#e8b84b' },
    { name:'Non Démarré', value:54, color:'#f06060' },
    { name:'Reprogrammé', value: 2, color:'#7b9fff' },
  ],
  budgetBySourceBars: [
    { name:'RSS', budget:795000, depense:120000, color:'#e8b84b' },
    { name:'FAE', budget:755000, depense:210000, color:'#00d2b4' },
    { name:'CDS', budget:414000, depense: 90000, color:'#4191ff' },
    { name:'HPV', budget:115000, depense: 35000, color:'#f06060' },
  ],
  activitesByOSBars: [
    { os:'OS1', count:53, color:'#4191ff' },
    { os:'OS3', count:33, color:'#00d2b4' },
    { os:'OS5', count:11, color:'#e8b84b' },
    { os:'OS2', count: 8, color:'#f06060' },
    { os:'OS4', count: 1, color:'#4a6480' },
  ],
};

function absorptionColor(v) {
  if (v >= 80) return 'var(--ok)';
  if (v >= 50) return 'var(--warn)';
  return 'var(--danger)';
}
function absorptionBg(v) {
  if (v >= 80) return 'var(--ok-light)';
  if (v >= 50) return 'var(--warn-light)';
  return 'var(--danger-light)';
}

const CustomTooltipBar = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div style={{ background:'var(--surface)', border:'1px solid var(--br-hi)', borderRadius:8, padding:'8px 12px', boxShadow:'var(--sh-md)', fontFamily:'var(--f-mono)', fontSize:10 }}>
      <div style={{ color: p.color || 'var(--teal)', fontWeight:500, marginBottom:2 }}>{p.name || p.os}</div>
      <div style={{ color:'var(--t-hi)' }}>{fmtUSD((payload[0].value||0) * 1000)}</div>
    </div>
  );
};

export default function OverviewTab({ kpis }) {
  const d = kpis || DEMO;

  const statByName = name => d.statutDonut.find(s => s.name === name)?.value ?? 0;
  const nReal = statByName('Réalisé');
  const nCours= statByName('En Cours');
  const nND   = statByName('Non Démarré');
  const osMax = d.activitesByOSBars.length ? Math.max(...d.activitesByOSBars.map(o => o.count)) : 1;

  const kpiCards = [
    { label:'Activités PTA',     value:d.totalActivites,                                sub:'Total 2026',           color:'var(--teal)', bg:'var(--teal-light)' },
    { label:'Réalisées',         value:nReal,                                            sub:`${d.totalActivites ? Math.round(nReal/d.totalActivites*100) : 0}% du plan`, color:'var(--ok)', bg:'var(--ok-light)' },
    { label:'En cours',          value:nCours,                                           sub:'En exécution',         color:'var(--warn)', bg:'var(--warn-light)' },
    { label:'Non démarrées',     value:nND,                                              sub:'À lancer',             color:'var(--danger)', bg:'var(--danger-light)' },
    { label:'Budget total',      value:fmtUSD(d.totalBudget),                           sub:'4 subventions',        color:'var(--blue)', bg:'var(--blue-light)' },
    { label:"Taux d'absorption", value:fmtPct(d.tauxAbsorption),                        sub:`${fmtUSD(d.totalDepense)} dépensés`, color:absorptionColor(d.tauxAbsorption), bg:absorptionBg(d.tauxAbsorption) },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {/* KPI row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:10 }}>
        {kpiCards.map((k, i) => (
          <div key={k.label} className={`kpi u${i}`} style={{ '--kpi-accent': k.color }}>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{ fontSize:typeof k.value==='string' ? 20 : 26 }}>{k.value}</div>
            <div className="kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        {/* Statut donut */}
        <div className="card u2">
          <div className="section-label">Statut des activités</div>
          <div style={{ display:'flex', gap:16, alignItems:'center' }}>
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={d.statutDonut} cx="50%" cy="50%" innerRadius={40} outerRadius={62} dataKey="value" strokeWidth={0}>
                  {d.statutDonut.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={v => [v, 'activités']} contentStyle={{ fontFamily:'var(--f-mono)', fontSize:10 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:7 }}>
              {d.statutDonut.map(s => (
                <div key={s.name} style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:s.color, flexShrink:0 }} />
                  <span style={{ fontFamily:'var(--f-mono)', fontSize:10.5, color:'var(--t-body)', flex:1 }}>{s.name}</span>
                  <span style={{ fontFamily:'var(--f-mono)', fontSize:11, fontWeight:600, color:'var(--t-hi)' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Budget by source */}
        <div className="card u3">
          <div className="section-label">Budget par subvention (USD)</div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={d.budgetBySourceBars} margin={{ top:0, right:8, left:0, bottom:0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="var(--br)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontFamily:'var(--f-mono)', fontSize:10, fill:'var(--t-dim)' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltipBar />} />
              <Bar dataKey="budget" radius={[3,3,0,0]} name="Budget">
                {d.budgetBySourceBars.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
              <Bar dataKey="depense" radius={[3,3,0,0]} fill="rgba(0,0,0,.15)" name="Dépensé" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activités par OS */}
      <div className="card u4">
        <div className="section-label">Activités par objectif stratégique</div>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {d.activitesByOSBars.map(os => (
            <div key={os.os}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                <span style={{ fontFamily:'var(--f-mono)', fontSize:10, color:'var(--t-dim)', letterSpacing:'.06em' }}>{os.os}</span>
                <span style={{ fontFamily:'var(--f-mono)', fontSize:10, color:'var(--t-hi)', fontWeight:500 }}>
                  {os.count} <span style={{ fontWeight:400, color:'var(--t-dim)' }}>activités</span>
                </span>
              </div>
              <div className="prog">
                <div className="prog-fill" style={{ width:`${Math.round(os.count/osMax*100)}%`, background:os.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
