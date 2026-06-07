import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import { fmtUSD, fmtPct } from '../utils.js';

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
function absorptionBorder(v) {
  if (v >= 80) return '#9ad4b5';
  if (v >= 50) return '#f0d080';
  return '#de9aa0';
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'var(--surface)', border:'1px solid var(--br-hi)', borderRadius:8, padding:'10px 14px', boxShadow:'var(--sh-md)', fontFamily:'var(--f-mono)', fontSize:10 }}>
      <div style={{ fontWeight:600, color:'var(--t-hi)', marginBottom:6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ display:'flex', justifyContent:'space-between', gap:16, color:p.color }}>
          <span>{p.name}</span>
          <span style={{ fontWeight:500 }}>{fmtUSD(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function FinanceTab({ kpis }) {
  if (!kpis) {
    return (
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--t-dim)', fontFamily:'var(--f-mono)', fontSize:12 }}>
        Chargez un fichier PTA pour voir le suivi financier
      </div>
    );
  }

  const { financialBySource = [], sommaire = [] } = kpis;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {/* Cards by source */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px,1fr))', gap:12 }}>
        {financialBySource.map((s, i) => (
          <div key={s.source} className={`card u${i}`} style={{ '--kpi-accent':s.color, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:s.color, borderRadius:'var(--r-l) var(--r-l) 0 0' }} />
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
              <div>
                <div style={{ fontFamily:'var(--f-mono)', fontSize:9, color:'var(--t-dim)', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:4 }}>
                  Subvention
                </div>
                <div style={{ fontFamily:'var(--f-display)', fontSize:18, fontWeight:700, color:'var(--navy)' }}>{s.source}</div>
              </div>
              <span className="badge" style={{ background: absorptionBg(s.tauxAbsorption), color: absorptionColor(s.tauxAbsorption), border:`1px solid ${absorptionBorder(s.tauxAbsorption)}` }}>
                {s.tauxAbsorption}% abs.
              </span>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
              {[
                { l:'Budget', v:fmtUSD(s.budget),  c:'var(--navy)' },
                { l:'Engagé', v:fmtUSD(s.engage),  c:'var(--blue)' },
                { l:'Dépensé',v:fmtUSD(s.depense), c:'var(--ok)'   },
                { l:'Activités',v:s.activites,      c:'var(--t-body)' },
              ].map(k => (
                <div key={k.l}>
                  <div style={{ fontFamily:'var(--f-mono)', fontSize:8.5, color:'var(--t-dim)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:2 }}>{k.l}</div>
                  <div style={{ fontFamily:'var(--f-mono)', fontSize:12, fontWeight:600, color:k.c }}>{k.v}</div>
                </div>
              ))}
            </div>

            {/* Absorption bar */}
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <span style={{ fontFamily:'var(--f-mono)', fontSize:8.5, color:'var(--t-dim)', textTransform:'uppercase', letterSpacing:'.08em' }}>Absorption</span>
                <span style={{ fontFamily:'var(--f-mono)', fontSize:9, fontWeight:600, color:absorptionColor(s.tauxAbsorption) }}>{s.tauxAbsorption}%</span>
              </div>
              <div className="prog">
                <div className="prog-fill" style={{ width:`${Math.min(100,s.tauxAbsorption)}%`, background:absorptionColor(s.tauxAbsorption) }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison chart */}
      {financialBySource.length > 0 && (
        <div className="card u4">
          <div className="section-label">Budget vs Dépenses vs Engagements (USD)</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={financialBySource} margin={{ top:0, right:16, left:0, bottom:0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="var(--br)" vertical={false} />
              <XAxis dataKey="source" tick={{ fontFamily:'var(--f-mono)', fontSize:10, fill:'var(--t-dim)' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontFamily:'var(--f-mono)', fontSize:10 }} />
              <Bar dataKey="budget"  name="Budget"  fill="var(--blue)"  radius={[3,3,0,0]} />
              <Bar dataKey="engage"  name="Engagé"  fill="var(--teal)"  radius={[3,3,0,0]} />
              <Bar dataKey="depense" name="Dépensé" fill="var(--ok)"    radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Sommaire table */}
      {sommaire?.length > 0 && (
        <div className="card u5" style={{ padding:0, overflow:'hidden' }}>
          <div style={{ padding:'14px 18px 10px', borderBottom:'1px solid var(--br)' }}>
            <div className="section-label" style={{ margin:0 }}>Sommaire financier par entité</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Subvention</th>
                <th>Entité</th>
                <th style={{ textAlign:'right' }}>Solde</th>
                <th style={{ textAlign:'right' }}>Activités</th>
                <th style={{ textAlign:'right' }}>Reliquat</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {sommaire.map((r, i) => (
                <tr key={i}>
                  <td style={{ fontFamily:'var(--f-mono)', fontWeight:600, color:'var(--navy)' }}>{r.subvention}</td>
                  <td>{r.entite}</td>
                  <td style={{ textAlign:'right', fontFamily:'var(--f-mono)', fontSize:11 }}>{r.solde?.toLocaleString('fr-FR')}</td>
                  <td style={{ textAlign:'right', fontFamily:'var(--f-mono)' }}>{r.activites}</td>
                  <td style={{ textAlign:'right', fontFamily:'var(--f-mono)', fontSize:11 }}>{r.reliquat?.toLocaleString('fr-FR')}</td>
                  <td style={{ color:'var(--t-dim)', fontSize:11 }}>{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
