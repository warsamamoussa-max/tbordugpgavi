import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fmtUSD } from '../utils/storage';

function absColor(v) { return v>=80?'var(--ok)':v>=50?'var(--warn)':'var(--danger)'; }

export default function TabSuiviFinancier({ kpis }) {
  if (!kpis) return (
    <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--muted)',fontFamily:'var(--font-mono)',fontSize:12}}>
      Chargez un fichier PTA pour voir le suivi financier
    </div>
  );

  const { bySourceArr = [] } = kpis;

  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      {/* Cards par source */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12}}>
        {bySourceArr.map((s,i)=>(
          <div key={s.source} className={`card fade-up-${i}`} style={{position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:s.color,borderRadius:'12px 12px 0 0'}}/>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
              <div>
                <div style={{fontFamily:'var(--font-mono)',fontSize:9,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.1em',marginBottom:3}}>Subvention</div>
                <div style={{fontFamily:'var(--font-display)',fontSize:20,fontWeight:700,color:'var(--navy)'}}>{s.source}</div>
              </div>
              <span className="badge" style={{background:absColor(s.tauxAbsorption)==='var(--ok)'?'var(--ok-light)':absColor(s.tauxAbsorption)==='var(--warn)'?'var(--warn-light)':'var(--danger-light)',color:absColor(s.tauxAbsorption),border:`1px solid ${absColor(s.tauxAbsorption)==='var(--ok)'?'#86efac':absColor(s.tauxAbsorption)==='var(--warn)'?'#fcd34d':'#fca5a5'}`}}>
                {s.tauxAbsorption}% abs.
              </span>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
              {[{l:'Budget',v:fmtUSD(s.budget),c:'var(--navy)'},{l:'Engagé',v:fmtUSD(s.engage),c:'var(--blue)'},{l:'Dépensé',v:fmtUSD(s.depense),c:'var(--ok)'},{l:'Activités',v:s.activites,c:'var(--text)'}].map(k=>(
                <div key={k.l}>
                  <div style={{fontFamily:'var(--font-mono)',fontSize:8.5,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:2}}>{k.l}</div>
                  <div style={{fontFamily:'var(--font-mono)',fontSize:12.5,fontWeight:700,color:k.c}}>{k.v}</div>
                </div>
              ))}
            </div>
            <div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                <span style={{fontFamily:'var(--font-mono)',fontSize:8.5,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.08em'}}>Absorption</span>
                <span style={{fontFamily:'var(--font-mono)',fontSize:9,fontWeight:700,color:absColor(s.tauxAbsorption)}}>{s.tauxAbsorption}%</span>
              </div>
              <div className="progress"><div className="progress-fill" style={{width:`${Math.min(100,s.tauxAbsorption)}%`,background:absColor(s.tauxAbsorption)}}/></div>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison chart */}
      {bySourceArr.length > 0 && (
        <div className="card fade-up-4">
          <div className="card-title">Budget vs Dépenses vs Engagements (USD)</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={bySourceArr} margin={{top:0,right:16,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" vertical={false}/>
              <XAxis dataKey="source" tick={{fontFamily:'var(--font-mono)',fontSize:10,fill:'var(--muted)'}} axisLine={false} tickLine={false}/>
              <YAxis hide/>
              <Tooltip formatter={v=>[fmtUSD(v)]} contentStyle={{fontFamily:'var(--font-mono)',fontSize:10}}/>
              <Legend wrapperStyle={{fontFamily:'var(--font-mono)',fontSize:10}}/>
              <Bar dataKey="budget"  name="Budget"  fill="var(--blue)" radius={[3,3,0,0]}/>
              <Bar dataKey="engage"  name="Engagé"  fill="var(--teal)" radius={[3,3,0,0]}/>
              <Bar dataKey="depense" name="Dépensé" fill="var(--ok)"   radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
