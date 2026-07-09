const GAS_WEB_APP_URL = process.env.GAS_WEB_APP_URL;
const GAS_PROXY_SECRET = process.env.GAS_PROXY_SECRET;
module.exports = async function handler(req,res){
  if(!GAS_WEB_APP_URL||!GAS_PROXY_SECRET)return res.status(500).json({ok:false,error:"Variáveis GAS_WEB_APP_URL e GAS_PROXY_SECRET não configuradas."});
  try{
    if(req.method==="GET"){
      const params=new URLSearchParams();for(const [k,v] of Object.entries(req.query||{})){if(v!==undefined&&v!==null)params.set(k,String(Array.isArray(v)?v[0]:v))}params.set("token",GAS_PROXY_SECRET);
      const r=await fetch(`${GAS_WEB_APP_URL}?${params.toString()}`,{method:"GET",redirect:"follow"});return relay(res,r)
    }
    if(req.method==="POST"){
      const payload=typeof req.body==="string"?JSON.parse(req.body):(req.body||{});payload.token=GAS_PROXY_SECRET;
      const r=await fetch(GAS_WEB_APP_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(payload),redirect:"follow"});return relay(res,r)
    }
    res.setHeader("Allow","GET, POST");return res.status(405).json({ok:false,error:"Método não permitido."})
  }catch(error){return res.status(500).json({ok:false,error:error.message||"Falha de comunicação com o backend."})}
};
async function relay(res,response){const text=await response.text();try{const json=JSON.parse(text);return res.status(json.code==="SESSION_EXPIRED"?401:200).json(json)}catch{return res.status(502).json({ok:false,error:"Resposta inválida do Apps Script.",details:text.slice(0,300)})}}
