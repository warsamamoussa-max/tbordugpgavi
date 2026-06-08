import { getStore } from '@netlify/blobs';
export default async (req) => {
  if (req.method === 'OPTIONS') return new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,OPTIONS','Access-Control-Allow-Headers':'Content-Type'}});
  try {
    const store = getStore({ name:'ugp-gavi-pta', consistency:'strong' });
    const data  = await store.get('pta-data',{type:'json'});
    if (!data) return new Response(JSON.stringify({ok:false,reason:'no-data'}),{status:200,headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Cache-Control':'public,max-age=30'}});
    return new Response(JSON.stringify({ok:true,...data}),{status:200,headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Cache-Control':'public,max-age=30'}});
  } catch(err) {
    return new Response(JSON.stringify({ok:false,error:err.message}),{status:500,headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}});
  }
};
export const config = { path:'/api/load-pta' };
