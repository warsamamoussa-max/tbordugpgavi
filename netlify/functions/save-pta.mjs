import { getStore } from '@netlify/blobs';
export default async (req) => {
  if (req.method==='OPTIONS') return new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'POST,OPTIONS','Access-Control-Allow-Headers':'Content-Type,X-Admin-Token'}});
  if (req.method!=='POST') return new Response('Method Not Allowed',{status:405});
  const token = req.headers.get('X-Admin-Token')||'';
  if (!token||token.length!==64) return new Response(JSON.stringify({error:'Non autorisé'}),{status:401,headers:{'Content-Type':'application/json'}});
  try {
    const {rawData,kpis,fileName,date} = await req.json();
    if (!rawData||!kpis||!fileName) return new Response(JSON.stringify({error:'Données manquantes'}),{status:400,headers:{'Content-Type':'application/json'}});
    const store = getStore({name:'ugp-gavi-pta',consistency:'strong'});
    await store.setJSON('pta-data',{rawData,kpis,fileName,date,updatedAt:new Date().toISOString()});
    return new Response(JSON.stringify({ok:true,fileName,date}),{status:200,headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
  } catch(err) {
    return new Response(JSON.stringify({error:err.message}),{status:500,headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
  }
};
export const config = { path:'/api/save-pta' };
