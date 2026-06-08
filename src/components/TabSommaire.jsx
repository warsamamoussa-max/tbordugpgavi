import React from 'react';
import { computeProgKPIs } from '../utils/parseExcel';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function ProgBar({ realise, enCours, total }) {
  if (!total) return <div className="progress"/>;
  const pR = Math.round(realise/total*100);
  const pC = Math.round(enCours/total*100);
  return (
    <div style={{display:'flex',height:6,borderRadius:99,overflow:'hidden',background:'var(--bg-deep)'}}>
      <div style={{width:`${pR}%`,background:'#22c55e',transition:'width .7s cubic-bezier(.22,1,.36,1)'}}/>
      <div style={{width:`${pC}%`,background:'#f59e0b'}}/>
    </div>
  );
}

export default function TabSommaire({ kpis, rawData }) {
  const { sommaire = [] } = kpis || {};
  const prog = rawData?.activities ? computeProgKPIs(rawData.activities) : null;

  if (!kpis && !rawData) return (
    <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--muted)',fontFamily:'var(--font-mono)',fontSize:12}}>
      Chargez un fichier PTA pour voir le suivi programmatique
    </div>
  );

  return (
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      {/* Avancement par OS */}
      {prog?.byOS?.length > 0 && (
        <div className="card fade-up">
          <div className="card-title">Avancement par objectif stratégique</div>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            {prog.byOS.map(os=>(
              <div key={os.os}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:10,height:10,borderRadius:3,background:os.color,flexShrink:0}}/>
                    <span style={{fontFamily:'var(--font-mono)',fontSize:11,fontWeight:700,color:'var(--navy)'}}>{os.os}</span>
                    <span style={{fontSize:11,color:'var(--muted)'}}>{os.total} activités</span>
                  </div>
                  <div style={{display:'flex',gap:14}}>
                    {[{l:'Réalisé',v:os.realise,c:'#22c55e'},{l:'En Cours',v:os.enCours,c:'#f59e0b'},{l:'Non Dém.',v:os.nonDemarre,c:'#ef4444'},{l:'Taux',v:`${os.tauxRealisation}%`,c:os.color}].map(s=>(
                      <div key={s.l} style={{textAlign:'center'}}>
                        <div style={{fontFamily:'var(--font-mono)',fontSize:8,color:'var(--muted)',textTransform:'uppercase'}}>{s.l}</div>
                        <div style={{fontFamily:'var(--font-mono)',fontSize:12,fontWeight:700,color:s.c}}>{s.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <ProgBar realise={os.realise} enCours={os.enCours} total={os.total}/>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      {prog?.timeline?.length > 0 && (
        <div className="card fade-up-1">
          <div className="card-title">Calendrier des échéances</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={prog.timeline} margin={{top:0,right:8,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" vertical={false}/>
              <XAxis dataKey="mois" tick={{fontFamily:'var(--font-mono)',fontSize:10,fill:'var(--muted)'}} axisLine={false} tickLine={false}/>
              <YAxis hide/>
              <Tooltip contentStyle={{fontFamily:'var(--font-mono)',fontSize:10}}/>
              <Bar dataKey="realise" name="Réalisé" fill="#22c55e" radius={[3,3,0,0]} stackId="a"/>
              <Bar dataKey="enCours" name="En Cours" fill="#f59e0b" stackId="a"/>
              <Bar dataKey="total"   name="Total"    fill="var(--bg-deep)" radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Sommaire financier */}
      {sommaire.length > 0 && (
        <div className="card fade-up-2" style={{padding:0,overflow:'hidden'}}>
          <div style={{padding:'14px 18px 10px',borderBottom:'1px solid var(--border)'}}>
            <div className="card-title" style={{margin:0}}>Sommaire financier par entité</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Subvention</th><th>Entité</th>
                <th style={{textAlign:'right'}}>Solde</th>
                <th style={{textAlign:'right'}}>Activités</th>
                <th style={{textAlign:'right'}}>Reliquat</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {sommaire.map((r,i)=>(
                <tr key={i}>
                  <td style={{fontFamily:'var(--font-mono)',fontWeight:700,color:'var(--navy)'}}>{r.subvention}</td>
                  <td>{r.entite}</td>
                  <td style={{textAlign:'right',fontFamily:'var(--font-mono)',fontSize:11}}>{r.solde?.toLocaleString('fr-FR')}</td>
                  <td style={{textAlign:'right',fontFamily:'var(--font-mono)'}}>{r.activites}</td>
                  <td style={{textAlign:'right',fontFamily:'var(--font-mono)',fontSize:11}}>{r.reliquat?.toLocaleString('fr-FR')}</td>
                  <td style={{color:'var(--muted)',fontSize:11}}>{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
