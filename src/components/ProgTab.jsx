import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { computeProgKPIs } from '../parseXLSX.js';

const TAUX_STYLE = {
  '0-24':   { bg:'var(--danger-light)', color:'var(--danger)' },
  '25-49':  { bg:'var(--warn-light)',   color:'var(--warn)'   },
  '50-79':  { bg:'var(--blue-light)',   color:'var(--blue)'   },
  '80-100': { bg:'var(--ok-light)',     color:'var(--ok)'     },
};

function ProgBar({ realise, enCours, nonDemarre, reprog, total }) {
  if (!total) return <div className="prog" />;
  const pR  = Math.round(realise    / total * 100);
  const pC  = Math.round(enCours    / total * 100);
  const pNS = Math.round(nonDemarre / total * 100);
  return (
    <div style={{ display:'flex', height:6, borderRadius:99, overflow:'hidden', background:'var(--surface-3)' }}>
      <div style={{ width:`${pR}%`, background:'#34d9a0', transition:'width .7s cubic-bezier(.22,1,.36,1)' }} />
      <div style={{ width:`${pC}%`, background:'#e8b84b' }} />
      <div style={{ width:`${pNS}%`, background:'#f06060' }} />
    </div>
  );
}

export default function ProgTab({ rawData }) {
  const activities = rawData?.activities;

  if (!activities?.length) {
    return (
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--t-dim)', fontFamily:'var(--f-mono)', fontSize:12 }}>
        Chargez un fichier PTA pour voir le suivi programmatique
      </div>
    );
  }

  const prog = computeProgKPIs(activities);
  if (!prog) return null;

  const { byOS, byGroupe, timeline, tauxMap } = prog;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {/* Taux programmatique distribution */}
      {Object.values(tauxMap).some(v => v > 0) && (
        <div className="card u0">
          <div className="section-label">Répartition par taux d'avancement programmatique</div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {Object.entries(tauxMap).map(([range, count]) => {
              const s = TAUX_STYLE[range];
              return (
                <div key={range} style={{ background:s.bg, border:`1px solid ${s.color}33`, borderRadius:'var(--r-m)', padding:'10px 18px', textAlign:'center', minWidth:100 }}>
                  <div style={{ fontFamily:'var(--f-mono)', fontSize:9, color:s.color, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:4 }}>{range}%</div>
                  <div style={{ fontFamily:'var(--f-display)', fontSize:22, fontWeight:700, color:s.color, lineHeight:1 }}>{count}</div>
                  <div style={{ fontFamily:'var(--f-mono)', fontSize:9, color:s.color, marginTop:3 }}>activités</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* By OS */}
      <div className="card u1">
        <div className="section-label">Avancement par objectif stratégique</div>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {byOS.map(os => (
            <div key={os.os}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:10, height:10, borderRadius:3, background:os.color, flexShrink:0 }} />
                  <span style={{ fontFamily:'var(--f-mono)', fontSize:11, fontWeight:600, color:'var(--navy)' }}>{os.os}</span>
                  <span style={{ fontSize:11, color:'var(--t-dim)', fontFamily:'var(--f-body)' }}>{os.total} activités</span>
                </div>
                <div style={{ display:'flex', gap:12 }}>
                  {[
                    { l:'Réalisé',    v:os.realise,    c:'#34d9a0' },
                    { l:'En Cours',   v:os.enCours,    c:'#e8b84b' },
                    { l:'Non Dém.',   v:os.nonDemarre, c:'#f06060' },
                  ].map(s => (
                    <div key={s.l} style={{ textAlign:'center' }}>
                      <div style={{ fontFamily:'var(--f-mono)', fontSize:8, color:'var(--t-dim)', textTransform:'uppercase' }}>{s.l}</div>
                      <div style={{ fontFamily:'var(--f-mono)', fontSize:12, fontWeight:700, color:s.c }}>{s.v}</div>
                    </div>
                  ))}
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontFamily:'var(--f-mono)', fontSize:8, color:'var(--t-dim)', textTransform:'uppercase' }}>Réalisation</div>
                    <div style={{ fontFamily:'var(--f-mono)', fontSize:12, fontWeight:700, color:os.color }}>{os.tauxRealisation}%</div>
                  </div>
                </div>
              </div>
              <ProgBar realise={os.realise} enCours={os.enCours} nonDemarre={os.nonDemarre} reprog={os.reprog} total={os.total} />
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      {timeline.length > 0 && (
        <div className="card u2">
          <div className="section-label">Calendrier d'échéances (date de fin)</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={timeline} margin={{ top:0, right:8, left:0, bottom:0 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="var(--br)" vertical={false} />
              <XAxis dataKey="mois" tick={{ fontFamily:'var(--f-mono)', fontSize:10, fill:'var(--t-dim)' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ fontFamily:'var(--f-mono)', fontSize:10, border:'1px solid var(--br-hi)' }}
                formatter={(v, n) => [v, n]}
              />
              <Bar dataKey="realise"  name="Réalisé"  fill="#34d9a0" radius={[3,3,0,0]} stackId="a" />
              <Bar dataKey="enCours"  name="En Cours" fill="#e8b84b" radius={[0,0,0,0]} stackId="a" />
              <Bar dataKey="total"    name="Total"    fill="var(--surface-3)" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* By groupe */}
      {byGroupe.length > 0 && (
        <div className="card u3">
          <div className="section-label">Avancement par groupe d'activités</div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {byGroupe.slice(0, 8).map(g => (
              <div key={g.groupe}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ fontSize:12, color:'var(--t-hi)', fontWeight:500 }}>{g.groupe}</span>
                  <span style={{ fontFamily:'var(--f-mono)', fontSize:10.5, color:'var(--t-dim)' }}>
                    {g.realise}/{g.total} · <span style={{ color:'var(--teal)', fontWeight:600 }}>{g.tauxRealisation}%</span>
                  </span>
                </div>
                <ProgBar realise={g.realise} enCours={g.enCours} nonDemarre={g.total-g.realise-g.enCours} reprog={0} total={g.total} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
