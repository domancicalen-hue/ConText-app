import { useState, useEffect, useRef } from "react";

// ══════════════════════════════════════════════════════════════════════════
// SPLASH BIOLUMINESCENTE
// ══════════════════════════════════════════════════════════════════════════
function Splash({ onDone, duration=3800 }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    const dpr    = window.devicePixelRatio || 1;
    canvas.width  = canvas.offsetWidth  * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;

    const COLORS = [[60,230,180],[90,200,255],[140,255,180],[200,168,75]];

    class Particle {
      reset(burst, bx, by) {
        this.x    = burst ? bx : Math.random() * W;
        this.y    = burst ? by : Math.random() * H;
        this.vx   = (Math.random()-.5)*(burst?2.5:.35);
        this.vy   = (Math.random()-.5)*(burst?2.5:.35)-(burst?.8:.08);
        const c   = COLORS[Math.floor(Math.random()*COLORS.length)];
        this.r=c[0]; this.g=c[1]; this.b=c[2];
        this.size  = Math.random()*1.8+.4;
        this.life  = 1;
        this.decay = Math.random()*.006+(burst?.014:.0025);
        this.phase = Math.random()*Math.PI*2;
        this.burst = burst||false;
        this.trail = [];
      }
      constructor(burst,bx,by){this.reset(burst,bx,by);}
      update(){
        this.trail.push({x:this.x,y:this.y});
        if(this.trail.length>6)this.trail.shift();
        this.x+=this.vx; this.y+=this.vy;
        this.vy+=.005; this.vx*=.997;
        this.life-=this.decay; this.phase+=.035;
      }
      draw(){
        const glow=Math.sin(this.phase)*.5+.5;
        this.trail.forEach((p,i)=>{
          const a=(i/this.trail.length)*this.life*.25;
          ctx.beginPath(); ctx.arc(p.x,p.y,this.size*.4,0,Math.PI*2);
          ctx.fillStyle=`rgba(${this.r},${this.g},${this.b},${a})`; ctx.fill();
        });
        const gr=ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,this.size*5*(1+glow*.4));
        gr.addColorStop(0,`rgba(${this.r},${this.g},${this.b},${this.life*.28*glow})`);
        gr.addColorStop(1,`rgba(${this.r},${this.g},${this.b},0)`);
        ctx.beginPath(); ctx.arc(this.x,this.y,this.size*5*(1+glow*.4),0,Math.PI*2);
        ctx.fillStyle=gr; ctx.fill();
        ctx.beginPath(); ctx.arc(this.x,this.y,this.size*(1+glow*.25),0,Math.PI*2);
        ctx.fillStyle=`rgba(${this.r},${this.g},${this.b},${this.life*(.65+glow*.3)})`; ctx.fill();
      }
    }

    class Wave {
      constructor(i){
        this.phase=Math.random()*Math.PI*2; this.speed=.006+i*.002;
        this.amp=22+i*12; this.y=H*(.25+i*.13);
        const c=COLORS[i%COLORS.length]; this.r=c[0];this.g=c[1];this.b=c[2];
      }
      draw(t){
        ctx.beginPath(); ctx.moveTo(0,H);
        for(let x=0;x<=W;x+=5){
          const y=this.y+Math.sin(x*.007+t*this.speed+this.phase)*this.amp
            +Math.sin(x*.003+t*this.speed*.6)*this.amp*.35;
          ctx.lineTo(x,y);
        }
        ctx.lineTo(W,H); ctx.closePath();
        const gr=ctx.createLinearGradient(0,this.y-this.amp,0,this.y+this.amp);
        gr.addColorStop(0,`rgba(${this.r},${this.g},${this.b},.055)`);
        gr.addColorStop(1,`rgba(${this.r},${this.g},${this.b},0)`);
        ctx.fillStyle=gr; ctx.fill();
      }
    }

    const particles = Array.from({length:35},()=>new Particle(false));
    const waves     = [0,1,2,3].map(i=>new Wave(i));
    let t=0, burstCount=0;

    const burstInterval = setInterval(()=>{
      if(burstCount<4){
        const bx=W*(.15+Math.random()*.7);
        const by=H*(.6+Math.random()*.35);
        for(let i=0;i<12;i++) particles.push(new Particle(true,bx,by));
        burstCount++;
      }
    },750);

    function draw(){
      t++;
      ctx.fillStyle="rgba(7,7,14,.22)"; ctx.fillRect(0,0,W,H);
      waves.forEach(w=>w.draw(t));
      for(let i=particles.length-1;i>=0;i--){
        particles[i].update(); particles[i].draw();
        if(particles[i].life<=0){
          if(!particles[i].burst) particles[i].reset(false);
          else particles.splice(i,1);
        }
      }
      animRef.current=requestAnimationFrame(draw);
    }
    draw();

    const timer=setTimeout(()=>{clearInterval(burstInterval);onDone();},duration);
    return()=>{cancelAnimationFrame(animRef.current);clearInterval(burstInterval);clearTimeout(timer);};
  },[duration,onDone]);

  return (
    <div style={{position:"fixed",inset:0,zIndex:999,background:"#07070e",overflow:"hidden"}}>
      <canvas ref={canvasRef} style={{position:"absolute",inset:0,width:"100%",height:"100%"}}/>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
        <div style={{background:"rgba(7,7,14,.72)",backdropFilter:"blur(18px)",WebkitBackdropFilter:"blur(18px)",border:"1px solid rgba(60,230,180,.12)",borderRadius:20,padding:"44px 52px 40px",display:"flex",flexDirection:"column",alignItems:"center",boxShadow:"0 8px 60px rgba(0,0,0,.6)",maxWidth:340,width:"85%"}}>
          <div style={{marginBottom:22,animation:"logoBreath 2.5s ease-in-out infinite alternate"}}>
            <img src="/icons/context-app-icon-20260611-clean.png" alt="ConText" width="94" height="94" style={{display:"block",objectFit:"contain",filter:"drop-shadow(0 0 18px rgba(255,204,0,.38))"}} />
          </div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:46,fontWeight:300,letterSpacing:".06em",lineHeight:1,marginBottom:16,animation:"fadeUp .8s ease .15s both",background:"linear-gradient(135deg,#3ce6b4 0%,#e8d890 50%,#5ac8ff 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
            ConText
          </div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,fontStyle:"italic",color:"#d8f4e8",lineHeight:1.8,textAlign:"center",animation:"fadeUp .8s ease .75s both"}}>
            Scrivi come pensi.<br/>Invia come vuoi apparire.
          </div>
          <div style={{marginTop:10,fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",letterSpacing:".32em",color:"rgba(60,230,180,.5)",textTransform:"uppercase",animation:"fadeUp .8s ease 1.1s both"}}>
            ◆ Tone Intelligence
          </div>
          <div style={{display:"flex",gap:8,marginTop:32,animation:"fadeUp .5s ease 1.4s both"}}>
            {[0,.28,.56].map((d,i)=>(
              <div key={i} style={{width:5,height:5,borderRadius:"50%",background:"rgba(60,230,180,.8)",boxShadow:"0 0 8px rgba(60,230,180,.7)",animation:`bioDotp 1.6s ease ${d}s infinite`}}/>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// DATI
// ══════════════════════════════════════════════════════════════════════════
const SCENARIOS = [
  {id:"review",  icon:"★",label:"Rispondere a una critica",   hint:"Scrivi la tua risposta alla critica...",     color:"#e05c6b"},
  {id:"raise",   icon:"↑",label:"Chiedere quello che meriti",   hint:"Scrivi cosa vuoi ottenere...",  color:"#60d394"},
  {id:"late",    icon:"⏱",label:"Scusarsi con classe",      hint:"Scrivi le tue scuse senza filtri...",      color:"#fbbf24"},
  {id:"refuse",  icon:"✕",label:"Rifiutare con eleganza",hint:"Scrivi il tuo rifiuto senza filtri...",         color:"#a78bfa"},
  {id:"feedback",icon:"◎",label:"Dire una cosa scomoda",    hint:"Scrivi quello che pensi davvero...",            color:"#3ecfbe"},
  {id:"followup",icon:"→",label:"Se nessuno risponde...",     hint:"Scrivi quello che vorresti dire...",           color:"#f97316"},
];

const ALL_TONES = [
  {id:"professional",label:"Professionale",icon:"◈",color:"#c8a84b",pro:false,prompt:"professionale: formale, preciso, rispettoso. Niente colloquialismi."},
  {id:"friendly",    label:"Amichevole",   icon:"◉",color:"#e05c6b",pro:false,prompt:"amichevole: caldo, naturale, come un collega fidato."},
  {id:"diplomatic",  label:"Diplomatico",  icon:"◎",color:"#3ecfbe",pro:false,prompt:"diplomatico: neutro, equilibrato, lascia porte aperte."},
  {id:"assertive",   label:"Assertivo",    icon:"▲",color:"#ff6b35",pro:true, prompt:"assertivo: diretto, fermo, nessuna scusa. Frasi brevi."},
  {id:"empathetic",  label:"Empatico",     icon:"♡",color:"#a78bfa",pro:true, prompt:"empatico: riconosce prima il punto di vista altrui, poi il proprio."},
  {id:"socratic",    label:"Socratico",    icon:"?",color:"#60d394",pro:true, prompt:"socratico: usa domande intelligenti invece di affermazioni."},
  {id:"stoic",       label:"Stoico",       icon:"—",color:"#94a3b8",pro:true, prompt:"stoico: minimalista, freddo, solo fatti essenziali."},
  {id:"strategic",   label:"Strategico",   icon:"◆",color:"#fbbf24",pro:true, prompt:"strategico: ogni frase calibrata per ottenere un effetto preciso."},
  {id:"ironic",      label:"Ironico",      icon:"~",color:"#f472b6",pro:true, prompt:"ironico elegante: sottile, mai volgare. Intelligente e distante."},
];

const EXAMPLES = [
  "Il cliente non paga da 60 giorni e ignora le mie email.",
  "Il mio capo si prende i meriti del mio lavoro davanti a tutti.",
  "Un collega arriva sempre in ritardo e ricade su di me.",
];

// ══════════════════════════════════════════════════════════════════════════
// APP PRINCIPALE
// ══════════════════════════════════════════════════════════════════════════
function MainApp() {
  const [step, setStep]           = useState(0);
  const [scenario, setScenario]   = useState(null);
  const [input, setText]          = useState("");
  const [activeTone, setActiveTone] = useState(null);
  const [result, setResult]       = useState("");
  const [loading, setLoading]     = useState(false);
  const [copied, setCopied]       = useState(false);
  const [shareStatus, setShareStatus] = useState("");
  const [isPro, setIsPro]         = useState(false);
  const [credits, setCredits]     = useState(0);
  const [hasCreditLedger, setHasCreditLedger] = useState(false);
  const [freeUsed, setFreeUsed]   = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showInstall, setShowInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installStatus, setInstallStatus] = useState("");
  const [history, setHistory]     = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const textareaRef               = useRef(null);

  const FREE_LIMIT = 3;
  const APP_SHARE_URL = "https://con-text-app.vercel.app";
  const APP_SHARE_TEXT = "Prova ConText: trasforma i tuoi messaggi nel tono giusto, in pochi secondi.";
  const remaining  = FREE_LIMIT - freeUsed;

  function refreshCreditState(){
    try{
      const storedCredits = localStorage.getItem("ctx_credits");
      setHasCreditLedger(storedCredits !== null);
      setCredits(Math.max(0, parseInt(storedCredits || "0", 10) || 0));
      setIsPro(localStorage.getItem("ctx_pro")==="1");
    }catch{}
  }

  function reserveCreditForGeneration(tone){
    if(!(tone.pro&&isPro&&hasCreditLedger)) return {reserved:false, blocked:false, previous:credits};
    let current=credits;
    try{ current=Math.max(0, parseInt(localStorage.getItem("ctx_credits") || String(credits), 10) || 0); }catch{}
    if(current<=0){
      setCredits(0);
      try{localStorage.setItem("ctx_credits","0");}catch{}
      setShowPaywall(true);
      return {reserved:false, blocked:true, previous:0};
    }
    const nextCredits=Math.max(0, current-1);
    setCredits(nextCredits);
    try{localStorage.setItem("ctx_credits",String(nextCredits));}catch{}
    return {reserved:true, blocked:false, previous:current};
  }

  function refundReservedCredit(reservation){
    if(!reservation?.reserved) return;
    let current=credits;
    try{ current=Math.max(0, parseInt(localStorage.getItem("ctx_credits") || "0", 10) || 0); }catch{}
    const restored=Math.min(current+1, reservation.previous);
    setCredits(restored);
    try{localStorage.setItem("ctx_credits",String(restored));}catch{}
  }

  useEffect(()=>{
    try{
      const h=localStorage.getItem("ctx_h");
      const u=localStorage.getItem("ctx_u");
      const d=localStorage.getItem("ctx_d");
      if(h) setHistory(JSON.parse(h));
      if(u&&d===new Date().toDateString()) setFreeUsed(parseInt(u));
      refreshCreditState();
    }catch{}
  },[]);

  useEffect(()=>{
    const onStorage = (event)=>{
      if(["ctx_pro","ctx_credits"].includes(event.key)) refreshCreditState();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", refreshCreditState);
    return ()=>{
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", refreshCreditState);
    };
  },[]);

  useEffect(()=>{ if(step===1) setTimeout(()=>textareaRef.current?.focus(),100); },[step]);

  useEffect(()=>{
    const onBeforeInstallPrompt = (event)=>{
      event.preventDefault();
      setDeferredPrompt(event);
      setInstallStatus("ConText può essere installata su questo dispositivo.");
    };
    const onAppInstalled = ()=>{
      setDeferredPrompt(null);
      setInstallStatus("ConText è stata installata correttamente.");
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return ()=>{
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  },[]);

  function pickScenario(id){ setScenario(id); setText(""); setResult(""); setActiveTone(null); setStep(1); }
  function skipScenario()  { setScenario(null); setText(""); setResult(""); setActiveTone(null); setStep(1); }
  function goToTones()     { if(!input.trim()) return; setResult(""); setActiveTone(null); setStep(2); }
  function restart()       { setStep(0); setScenario(null); setText(""); setResult(""); setActiveTone(null); }

  async function transform(tone) {
    if(tone.pro&&!isPro){ setShowPaywall(true); return; }
    if(tone.pro&&isPro&&hasCreditLedger&&credits<=0){ setShowPaywall(true); return; }
    if(!tone.pro&&!isPro&&freeUsed>=FREE_LIMIT){ setShowPaywall(true); return; }
    const creditReservation=reserveCreditForGeneration(tone);
    if(creditReservation.blocked) return;
    setActiveTone(tone); setLoading(true); setResult(""); setStep(3);
    const sc=scenario?SCENARIOS.find(s=>s.id===scenario):null;
    try{
      const res=await fetch("/api/transform",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          system:`Sei un esperto di comunicazione scritta in italiano.${sc?` Contesto: ${sc.label}.`:""} Riscrivi il messaggio nel tono indicato. Rispondi SOLO con il testo riscritto. Niente virgolette, niente spiegazioni. Massimo 4 frasi. Sempre in italiano.`,
          userMessage:`Tono: ${tone.prompt}\n\nMessaggio: "${input}"`,
        }),
      });
      const data=await res.json();
      const generatedText=data.content?.map(c=>c.text||"").join("").trim();
      const text=generatedText||"Errore nella risposta.";
      setResult(text);
      if(tone.pro&&isPro&&hasCreditLedger&&!generatedText){
        refundReservedCredit(creditReservation);
      }
      if(isPro){
        const entry={id:Date.now(),date:new Date().toLocaleString("it-IT"),original:input,tone:tone.label,result:text};
        const nh=[entry,...history].slice(0,50);
        setHistory(nh);
        try{localStorage.setItem("ctx_h",JSON.stringify(nh));}catch{}
      }
      if(!tone.pro){
        const n=freeUsed+1; setFreeUsed(n);
        try{localStorage.setItem("ctx_u",n);localStorage.setItem("ctx_d",new Date().toDateString());}catch{}
      }
    }catch{ refundReservedCredit(creditReservation); setResult("Errore di connessione. Riprova."); }
    setLoading(false);
  }

  async function installApp(){
    if(!deferredPrompt){
      setInstallStatus("Se il pulsante automatico non compare, usa le istruzioni qui sotto per aggiungere ConText alla schermata Home o al desktop.");
      return;
    }
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if(choice?.outcome === "accepted") setInstallStatus("Installazione avviata. Troverai ConText tra le tue app.");
    else setInstallStatus("Installazione annullata. Puoi riprovare quando vuoi.");
    setDeferredPrompt(null);
  }

  function copyResult(){ navigator.clipboard.writeText(result); setCopied(true); setTimeout(()=>setCopied(false),2000); }

  async function copyShareLink(){
    if(navigator.clipboard?.writeText){
      await navigator.clipboard.writeText(APP_SHARE_URL);
      return;
    }
    const helper=document.createElement("textarea");
    helper.value=APP_SHARE_URL;
    helper.setAttribute("readonly","");
    helper.style.position="fixed";
    helper.style.left="-9999px";
    document.body.appendChild(helper);
    helper.select();
    document.execCommand("copy");
    document.body.removeChild(helper);
  }

  async function shareApp(){
    const shareData={title:"ConText",text:APP_SHARE_TEXT,url:APP_SHARE_URL};
    try{
      if(navigator.share){
        await navigator.share(shareData);
        setShareStatus("Condiviso");
      }else{
        await copyShareLink();
        setShareStatus("Link copiato");
      }
    }catch(error){
      if(error?.name==="AbortError") return;
      try{
        await copyShareLink();
        setShareStatus("Link copiato");
      }catch{
        setShareStatus("Apri link");
        window.open(APP_SHARE_URL,"_blank","noopener,noreferrer");
      }
    }
    setTimeout(()=>setShareStatus(""),2200);
  }

  // ── CSS ────────────────────────────────────────────────────────────────
  const css = `
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    :root{--bg:#07070e;--bg2:#0f0f1c;--bg3:#161626;--gold:#c8a84b;--teal:#3ecfbe;--red:#e05c6b;--text:#f0ece4;--sub:#aaa6ba;--muted:#706d82;--border:#24243a;--glass:rgba(15,15,28,.78);}
    html,body,#root{width:100%;max-width:100%;overflow-x:hidden;}
    body{background:radial-gradient(circle at 0% 0%,#12342d 0,#07070e 30%,#07070e 100%);}
    button,a{-webkit-tap-highlight-color:transparent;}
    @keyframes fadeUp {from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes logoBreath{from{filter:drop-shadow(0 0 10px rgba(255,204,0,.32)) drop-shadow(0 0 24px rgba(255,204,0,.14))}to{filter:drop-shadow(0 0 24px rgba(255,204,0,.62)) drop-shadow(0 0 55px rgba(255,204,0,.28))}}
    @keyframes bioDotp{0%,100%{opacity:.25;transform:scale(1) translateY(0)}50%{opacity:1;transform:scale(1.7) translateY(-4px)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes stepPulse{0%,100%{box-shadow:0 0 0 0 rgba(200,168,75,.32)}50%{box-shadow:0 0 0 10px rgba(200,168,75,0)}}
    .fade{animation:fadeUp .38s ease both;}
    .spin{display:inline-block;animation:spin 1s linear infinite;}
    textarea{font-family:'Cormorant Garamond',serif!important;}
    textarea::placeholder{color:#4e4b62;font-style:italic;}
    textarea:focus{outline:none;}
    ::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:#24243a;}
    .app-shell{min-height:100vh;background:radial-gradient(circle at top left,#12332c 0,#07070e 33%,#07070e 100%);color:var(--text);}
    .app-header{position:sticky;top:0;z-index:20;background:rgba(7,7,14,.88);border-bottom:1px solid var(--border);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);}
    .header-inner{max-width:1060px;margin:0 auto;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;gap:16px;}
    .brand{cursor:pointer;display:flex;align-items:center;gap:11px;min-width:190px;}
    .brand-kicker{font-family:'JetBrains Mono',monospace;font-size:8px;color:var(--gold);letter-spacing:.28em;text-transform:uppercase;}
    .brand-name{font-family:'Cormorant Garamond',serif;font-size:25px;font-weight:300;color:var(--text);line-height:1;}
    .brand-name em{color:var(--gold);font-weight:400;}
    .top-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:flex-end;}
    .top-link,.credit-pill,.history-pill{background:rgba(15,15,28,.72);border:1px solid var(--border);color:var(--sub);padding:8px 11px;border-radius:999px;cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.11em;text-decoration:none;line-height:1;transition:all .16s;white-space:nowrap;}
    .top-link:hover,.history-pill:hover{color:var(--gold);border-color:#c8a84b55;transform:translateY(-1px);}
    .credit-pill{border-color:var(--gold);color:var(--gold);font-weight:700;background:#c8a84b10;}
    .free-pill{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--teal);padding:8px 10px;white-space:nowrap;}
    .pro-banner{text-align:center;padding:10px 16px;border-bottom:1px solid #c8a84b20;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.18em;}
    .step-wrap{max-width:760px;margin:0 auto;padding:24px 20px 0;}
    .step-card{background:rgba(15,15,28,.58);border:1px solid var(--border);border-radius:16px;padding:14px;box-shadow:0 18px 70px rgba(0,0,0,.18);}
    .step-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;}
    .step-item{position:relative;border:1px solid var(--border);border-radius:12px;padding:11px 8px 10px;text-align:center;background:#090916;transition:all .22s;min-width:0;}
    .step-item.active{border-color:#c8a84b99;background:linear-gradient(145deg,#c8a84b,#eadb91);color:#07070e;animation:stepPulse 2.2s infinite;}
    .step-item.done{border-color:#c8a84b44;background:#c8a84b12;}
    .step-number{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;margin-bottom:4px;color:inherit;}
    .step-label{font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:.12em;color:var(--sub);text-transform:uppercase;}
    .step-item.active .step-label{color:#07070e;}.step-item.done .step-label,.step-item.done .step-number{color:var(--gold);}
    .screen{max-width:960px;margin:0 auto;padding:34px 20px 62px;}
    .narrow{max-width:760px;}
    .hero-layout{display:grid;grid-template-columns:1.05fr .95fr;gap:26px;align-items:center;}
    .eyebrow{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--teal);letter-spacing:.34em;text-transform:uppercase;margin-bottom:14px;}
    .hero-title{font-family:'Cormorant Garamond',serif;font-size:clamp(45px,8vw,76px);font-weight:300;line-height:.96;letter-spacing:-.035em;color:var(--text);margin-bottom:18px;max-width:100%;overflow-wrap:normal;}
    .hero-title span{color:var(--gold);font-style:italic;}
    .lead{font-family:'JetBrains Mono',monospace;font-size:12px;line-height:1.95;color:#d6d1df;max-width:650px;margin-bottom:22px;}
    .cta-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;margin:20px 0 18px;}
    .primary-cta,.secondary-cta,.wide-cta{border-radius:10px;padding:16px 18px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.18em;font-weight:700;cursor:pointer;transition:all .18s;text-transform:uppercase;}
    .primary-cta,.wide-cta{background:var(--gold);border:1px solid var(--gold);color:#07070e;box-shadow:0 18px 55px rgba(200,168,75,.12);}
    .secondary-cta{background:#3ecfbe0d;border:1px solid #3ecfbe33;color:var(--teal);}
    .primary-cta:hover,.wide-cta:hover,.secondary-cta:hover{transform:translateY(-2px);filter:brightness(1.05);}
    .trust-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:16px;}
    .trust-card,.info-card,.scenario-card,.tone-card,.result-card,.input-card,.message-summary,.example-card{background:rgba(15,15,28,.82);border:1px solid var(--border);border-radius:14px;box-shadow:0 18px 70px rgba(0,0,0,.18);}
    .trust-card{padding:15px;}.trust-card strong{display:block;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.13em;color:var(--gold);text-transform:uppercase;margin-bottom:6px;}.trust-card span{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--sub);line-height:1.65;}
    .example-card{padding:24px;border-color:#3ecfbe2c;background:linear-gradient(145deg,rgba(18,18,34,.96),rgba(8,8,16,.96));}
    .example-label,.section-kicker{font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:.26em;color:var(--teal);text-transform:uppercase;margin-bottom:12px;}
    .before-text,.after-text{font-family:'Cormorant Garamond',serif;line-height:1.62;border-radius:10px;padding:17px 18px;}
    .before-text{font-size:20px;color:#908ca2;font-style:italic;background:#080810;border:1px solid var(--border);margin-bottom:12px;}
    .after-text{font-size:23px;color:var(--text);background:#3ecfbe0d;border:1px solid #3ecfbe34;border-left:3px solid var(--gold);}
    .section-title{margin:44px 0 18px;}.section-title h2{font-family:'Cormorant Garamond',serif;font-size:clamp(32px,5vw,48px);font-weight:300;line-height:1.05;color:var(--text);}.section-title p{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--sub);line-height:1.85;margin-top:8px;max-width:660px;}
    .scenario-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}.scenario-card{cursor:pointer;text-align:left;padding:21px 18px;min-height:134px;transition:all .18s;}.scenario-card:hover{transform:translateY(-3px);border-color:#c8a84b55;}.scenario-icon{font-size:27px;display:block;margin-bottom:15px;}.scenario-label{font-family:'Cormorant Garamond',serif;font-size:20px;color:var(--text);font-weight:600;line-height:1.12;}
    .info-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:24px 0 4px;}.info-card{padding:18px;}.info-card-title{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--gold);letter-spacing:.17em;text-transform:uppercase;margin-bottom:8px;}.info-card-body{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--sub);line-height:1.75;}
    .selected-scenario{display:flex;align-items:center;gap:13px;margin-bottom:24px;padding:16px 18px;border-radius:14px;}.section-heading{font-family:'Cormorant Garamond',serif;font-size:clamp(34px,6vw,52px);font-weight:300;color:var(--text);line-height:1.04;margin-bottom:10px;}.helper{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--sub);line-height:1.85;margin-bottom:20px;}
    .input-card{overflow:hidden;border-radius:16px;margin-bottom:16px;} .message-textarea{width:100%;min-height:210px;background:transparent;border:none;color:var(--text);font-size:26px;padding:24px;resize:vertical;line-height:1.55;}
    .input-footer{padding:14px 18px 18px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;}.counter{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted);}.example-buttons{display:flex;gap:8px;}.ex-btn{background:#090916;border:1px solid var(--border);border-radius:999px;color:#9c98ad;font-size:10px;padding:8px 12px;cursor:pointer;font-family:'JetBrains Mono',monospace;transition:all .15s;}.ex-btn:hover{color:var(--gold);border-color:#c8a84b55;}
    .wide-cta{width:100%;}.wide-cta:disabled{opacity:.38;cursor:not-allowed;box-shadow:none;filter:none;transform:none;background:#161626;color:var(--sub);border-color:var(--border);}
    .message-summary{padding:18px 20px;border-left:4px solid var(--gold);margin-bottom:28px;}.summary-text{font-family:'Cormorant Garamond',serif;font-size:22px;color:#cac5d7;font-style:italic;line-height:1.55;}.text-link{background:transparent;border:none;color:#8f8fa8;font-size:10px;cursor:pointer;font-family:'JetBrains Mono',monospace;margin-top:11px;letter-spacing:.12em;padding:0;}.text-link:hover{color:var(--gold);}
    .tone-section-title{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--sub);letter-spacing:.24em;margin:22px 0 12px;text-transform:uppercase;}.tone-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}.tone-card{border-radius:14px;padding:20px 14px;cursor:pointer;text-align:center;transition:all .18s;position:relative;min-height:122px;}.tone-card:hover:not(:disabled){transform:translateY(-3px);filter:brightness(1.08);}.tone-icon{font-size:29px;margin-bottom:10px;font-family:'JetBrains Mono',monospace;}.tone-label{font-family:'Cormorant Garamond',serif;font-size:20px;color:var(--text);font-weight:600;}.tone-badge{position:absolute;top:8px;right:8px;font-family:'JetBrains Mono',monospace;font-size:7px;color:var(--gold);border:1px solid #c8a84b30;padding:3px 6px;border-radius:999px;background:#07070e;}
    .result-card{padding:28px 24px;margin-bottom:16px;border-radius:16px;}.result-text{font-family:'Cormorant Garamond',serif;font-size:clamp(27px,6vw,40px);line-height:1.45;color:var(--text);}.action-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;}.ghost-btn{background:rgba(15,15,28,.76);border:1px solid var(--border);border-radius:10px;padding:15px 13px;cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--sub);letter-spacing:.15em;transition:all .18s;text-transform:uppercase;}.ghost-btn:hover{color:var(--gold);border-color:#c8a84b55;}.original-card{margin-top:18px;padding:16px 18px;background:rgba(15,15,28,.68);border:1px solid var(--border);border-radius:12px;}.original-card p{font-family:'Cormorant Garamond',serif;font-size:18px;color:#b7b7c8;font-style:italic;line-height:1.5;}
    .modal-card{background:#0c0c18;border:1px solid #3ce6b433;border-radius:16px;padding:28px;max-width:520px;width:100%;box-shadow:0 20px 80px rgba(0,0,0,.45);}.paywall-card{border-color:#c8a84b40;max-width:430px;}
    footer{border-top:1px solid var(--border);padding:24px 20px 30px;text-align:center;font-family:'JetBrains Mono',monospace;font-size:9px;color:#5d5a70;line-height:1.8;background:#07070e;} footer a{color:var(--sub);margin:0 6px;}
    @media(max-width:800px){
      .header-inner{padding:14px 16px;align-items:flex-start;flex-direction:column;gap:13px;}.brand{width:100%;}.top-actions{width:100%;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;justify-content:stretch;}.top-link,.credit-pill,.history-pill{font-size:8px;padding:9px 6px;text-align:center;width:100%;min-width:0;letter-spacing:.06em;}.free-pill{grid-column:1 / span 2;width:100%;padding:9px 6px;font-size:10px;text-align:left;}.credit-pill{grid-column:3 / span 1;}.step-wrap{padding:18px 14px 0;}.step-card{padding:8px;border-radius:14px;}.step-grid{gap:5px;}.step-item{padding:9px 2px 8px;border-radius:10px;}.step-number{font-size:11px;}.step-label{font-size:6.5px;letter-spacing:.02em;white-space:normal;overflow:hidden;text-overflow:clip;}.screen{padding:30px 16px 56px;}.hero-layout{grid-template-columns:minmax(0,1fr);gap:22px;}.hero-title{font-size:clamp(39px,11.4vw,48px);line-height:1.02;letter-spacing:-.025em;}.lead{font-size:12px;line-height:1.9;max-width:100%;}.cta-row{grid-template-columns:1fr;}.primary-cta,.secondary-cta,.wide-cta{width:100%;}.trust-grid,.info-grid,.scenario-grid,.tone-grid{grid-template-columns:1fr;}.example-card{padding:20px;}.before-text{font-size:20px;}.after-text{font-size:25px;}.section-title{margin-top:42px;}.scenario-card{min-height:auto;padding:22px 20px;display:grid;grid-template-columns:auto minmax(0,1fr);gap:16px;align-items:center;}.scenario-icon{margin:0;}.scenario-label{font-size:23px;}.message-textarea{min-height:245px;font-size:27px;padding:22px;}.input-footer{align-items:flex-start;}.example-buttons{width:100%;}.ex-btn{flex:1;padding:10px 8px;}.tone-card{min-height:auto;padding:22px 18px;display:flex;align-items:center;gap:15px;text-align:left;}.tone-icon{margin:0;min-width:34px;}.tone-label{font-size:24px;}.action-grid{grid-template-columns:1fr;}.modal-card{padding:24px 20px;border-radius:14px;}.trust-card,.info-card{padding:18px;}}
    @media(max-width:800px){
      .app-header{overflow:hidden;}.header-inner,.top-actions,.step-wrap,.screen,.hero-layout{width:100%;max-width:100%;min-width:0;}.top-actions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;}.top-actions>*{min-width:0;max-width:100%;white-space:normal;}.free-pill{grid-column:1 / span 1;text-align:center;}.credit-pill{grid-column:2 / span 1;}.step-grid{grid-template-columns:repeat(2,minmax(0,1fr));}.step-label{font-size:7px;letter-spacing:.06em;}.hero-title{font-size:clamp(35px,10.8vw,43px);line-height:1.06;}.hero-title span{display:inline;}.lead{overflow-wrap:break-word;}.example-card,.trust-card,.info-card,.scenario-card,.message-summary,.input-card,.tone-card,.result-card{max-width:100%;}
    }
  `;

  const Logo = ({size=28}) => (
    <img src="/icons/context-app-icon-20260611-clean.png" alt="ConText" width={size} height={size} style={{display:"block",objectFit:"contain",filter:"drop-shadow(0 0 10px rgba(255,204,0,.22))"}} />
  );

  // ── HEADER ─────────────────────────────────────────────────────────────
  const header = (
    <header className="app-header">
      <div className="header-inner">
        <div onClick={restart} className="brand" aria-label="Torna all'inizio di ConText">
          <Logo size={30}/>
          <div>
            <div className="brand-kicker">◆ Tone Intelligence</div>
            <div className="brand-name">Con<em>Text</em></div>
          </div>
        </div>
        <div className="top-actions">
          <a className="top-link" href="/blog/index.html" target="_blank" rel="noopener noreferrer" title="Leggi il blog ConText">Blog</a>
          <a className="top-link" href="/guida.html" target="_blank" rel="noopener noreferrer" title="Apri la guida completa di ConText">Guida</a>
          <a className="top-link" href="/attiva.html" target="_blank" rel="noopener noreferrer" title="Attiva un codice ConText">Attiva</a>
          <button className="top-link" onClick={shareApp} title="Condividi ConText con altre persone" style={{color:shareStatus?"var(--teal)":"var(--sub)",borderColor:shareStatus?"#3ecfbe55":"var(--border)",background:shareStatus?"#3ecfbe10":"rgba(15,15,28,.72)"}}>{shareStatus||"Condividi"}</button>
          <button className="top-link" onClick={()=>setShowInstall(true)} title="Installa ConText come app">Installa</button>
          {isPro&&(
            <button className="history-pill" onClick={()=>setShowHistory(h=>!h)} style={{background:showHistory?"#c8a84b18":"rgba(15,15,28,.72)",borderColor:showHistory?"#c8a84b55":"var(--border)",color:showHistory?"var(--gold)":"var(--sub)"}}>↺ Storia</button>
          )}
          {isPro&&hasCreditLedger&&(
            <div className="free-pill" style={{color:credits>0?"var(--teal)":"var(--red)"}} title="Crediti residui per i toni avanzati">{credits} crediti</div>
          )}
          {!isPro&&<div className="free-pill">{remaining} gratis oggi</div>}
          <button onClick={()=>setShowPaywall(true)} className="credit-pill" style={{background:isPro?"var(--gold)":"#c8a84b10",color:isPro?"#07070e":"var(--gold)"}}>
            {isPro ? (hasCreditLedger ? "RICARICA" : "✓ CREDITI") : "CREDITI"}
          </button>
        </div>
      </div>
    </header>
  );

  // ── STEP BAR ───────────────────────────────────────────────────────────
  const STEP_LABELS = ["Situazione","Messaggio","Tono","Risultato"];
  const stepBar = (
    <div className="step-wrap">
      <div className="step-card" aria-label="Avanzamento trasformazione messaggio">
        <div className="step-grid">
          {STEP_LABELS.map((s,i)=>(
            <div key={i} className={`step-item ${step===i?"active":step>i?"done":""}`}>
              <div className="step-number">{step>i?"✓":i+1}</div>
              <div className="step-label">{s}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── STEP 0: SCENARIO ───────────────────────────────────────────────────
  const step0 = (
    <div className="fade screen">
      <section className="hero-layout" aria-label="Presentazione ConText">
        <div>
          <div className="eyebrow">Scrittura difficile, tono giusto</div>
          <h1 className="hero-title">Scrivi naturale. <span>Invia meglio.</span></h1>
          <p className="lead">ConText prende un messaggio scritto di getto e lo trasforma in una versione più professionale, diplomatica o amichevole. In italiano, in pochi secondi, senza registrarti.</p>
          <div className="cta-row">
            <button className="primary-cta" onClick={skipScenario}>Inizia subito →</button>
            <button className="secondary-cta" onClick={()=>setShowPaywall(true)}>Vedi crediti</button>
          </div>
          <div className="trust-grid">
            <div className="trust-card"><strong>3 gratis al giorno</strong><span>Provi i toni base senza account e senza carta.</span></div>
            <div className="trust-card"><strong>Privacy prudente</strong><span>La cronologia resta sul dispositivo quando disponibile.</span></div>
            <div className="trust-card"><strong>Per lavoro</strong><span>Clienti, recensioni, colleghi, richieste e risposte delicate.</span></div>
          </div>
        </div>
        <div className="example-card" aria-label="Esempio prima e dopo">
          <div className="example-label">Esempio prima / dopo</div>
          <div className="before-text">“Non avete ancora pagato. È passato troppo tempo e questa cosa non va bene.”</div>
          <div className="section-kicker" style={{color:"var(--gold)",margin:"10px 0"}}>↓ tono professionale</div>
          <div className="after-text">“Vi scrivo per sollecitare gentilmente il saldo della fattura in sospeso. Resto disponibile per eventuali chiarimenti, ma vi chiedo di procedere appena possibile.”</div>
        </div>
      </section>

      <section aria-label="Scegli situazione">
        <div className="section-title">
          <div className="section-kicker">Passo 1</div>
          <h2>Qual è la situazione?</h2>
          <p>Scegli una scorciatoia se vuoi un risultato più calibrato, oppure salta e scrivi direttamente quello che hai in testa.</p>
        </div>
        <div className="scenario-grid">
          {SCENARIOS.map(s=>(
            <button key={s.id} className="scenario-card" onClick={()=>pickScenario(s.id)}>
              <span className="scenario-icon" style={{color:s.color}}>{s.icon}</span>
              <span className="scenario-label">{s.label}</span>
            </button>
          ))}
        </div>
        <button onClick={skipScenario} className="wide-cta" style={{marginTop:14,background:"transparent",color:"var(--teal)",borderColor:"#3ecfbe38",boxShadow:"none"}}>Scrivi direttamente senza scegliere →</button>
      </section>

      <section className="info-grid" aria-label="Garanzie ConText">
        {[
          ["Nessun account", "Puoi capire subito se l'app ti serve, senza registrazione iniziale."],
          ["Crediti chiari", "I toni avanzati usano crediti, senza abbonamento e senza scadenza."],
          ["Installabile", "Puoi aggiungerla alla schermata Home e usarla come piccola app."],
        ].map(([title,body])=>(
          <div key={title} className="info-card"><div className="info-card-title">{title}</div><div className="info-card-body">{body}</div></div>
        ))}
      </section>
    </div>
  );

  // ── STEP 1: SCRIVI ─────────────────────────────────────────────────────
  const sc = scenario ? SCENARIOS.find(s=>s.id===scenario) : null;
  const step1 = (
    <div className="fade screen narrow">
      {sc&&(
        <div className="selected-scenario" style={{background:sc.color+"12",border:`1px solid ${sc.color}36`}}>
          <span style={{fontSize:27,color:sc.color}}>{sc.icon}</span>
          <div>
            <div className="section-kicker" style={{color:sc.color,marginBottom:4}}>Situazione scelta</div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,color:"var(--text)",fontWeight:600,lineHeight:1.05}}>{sc.label}</div>
          </div>
          <button onClick={()=>setStep(0)} style={{marginLeft:"auto",background:"transparent",border:"none",color:"var(--sub)",cursor:"pointer",fontSize:20,padding:8}}>✕</button>
        </div>
      )}
      <div className="section-kicker">Passo 2</div>
      <h2 className="section-heading">Scrivi come ti viene.</h2>
      <p className="helper">Non serve essere diplomatico adesso. Inserisci il messaggio grezzo: ConText penserà a renderlo più adatto al contesto.</p>

      <div className="input-card" onFocusCapture={e=>e.currentTarget.style.borderColor="#c8a84b55"} onBlurCapture={e=>e.currentTarget.style.borderColor="var(--border)"}>
        <textarea ref={textareaRef} value={input} onChange={e=>{setText(e.target.value);setResult("");}}
          onKeyDown={e=>{if(e.key==="Enter"&&(e.metaKey||e.ctrlKey)&&input.trim())goToTones();}}
          placeholder={sc?sc.hint:"Scrivi quello che vorresti dire davvero..."}
          className="message-textarea"
        />
        <div className="input-footer">
          <div className="counter">{input.length>0?`${input.length} caratteri`:"Puoi anche partire da un esempio"}</div>
          <div className="example-buttons">
            {EXAMPLES.map((ex,i)=>(<button key={i} className="ex-btn" onClick={()=>setText(ex)}>esempio {i+1}</button>))}
          </div>
        </div>
      </div>

      <button className="wide-cta" onClick={goToTones} disabled={!input.trim()}>{input.trim()?"Scegli il tono →":"Scrivi il messaggio per continuare"}</button>
    </div>
  );

  // ── STEP 2: TONI ───────────────────────────────────────────────────────
  const step2 = (
    <div className="fade screen narrow">
      <div className="message-summary">
        <div className="section-kicker" style={{color:"var(--gold)"}}>Il tuo messaggio</div>
        <p className="summary-text">“{input}”</p>
        <button onClick={()=>setStep(1)} className="text-link">← modifica il testo</button>
      </div>

      <div className="section-kicker">Passo 3</div>
      <h2 className="section-heading">Che impressione vuoi dare?</h2>
      <p className="helper">Tocca un tono: ConText trasforma subito il messaggio. I toni base consumano le prove gratuite giornaliere; quelli avanzati usano crediti.</p>

      <div className="tone-section-title">Toni base — gratuiti</div>
      <div className="tone-grid">
        {ALL_TONES.filter(t=>!t.pro).map(tone=>(
          <button key={tone.id} className="tone-card" onClick={()=>transform(tone)} style={{background:`${tone.color}10`,border:`1px solid ${tone.color}40`}}>
            <div className="tone-icon" style={{color:tone.color}}>{tone.icon}</div>
            <div className="tone-label">{tone.label}</div>
          </button>
        ))}
      </div>

      <div className="tone-section-title" style={{color:"var(--gold)",marginTop:30}}>Toni avanzati {!isPro&&<span style={{color:"var(--sub)",letterSpacing:0,textTransform:"none"}}>— usa crediti per sbloccare</span>} {isPro&&hasCreditLedger&&<span style={{color:credits>0?"var(--teal)":"var(--red)",letterSpacing:0,textTransform:"none"}}>— {credits} crediti residui</span>}</div>
      <div className="tone-grid">
        {ALL_TONES.filter(t=>t.pro).map(tone=>(
          <button key={tone.id} className="tone-card" onClick={()=>transform(tone)} style={{background:isPro?`${tone.color}10`:"rgba(15,15,28,.82)",border:`1px solid ${isPro?tone.color+"40":"var(--border)"}`,opacity:isPro&&(!hasCreditLedger||credits>0)?1:.52}}>
            {!isPro&&<div className="tone-badge">CREDITI</div>}
            {isPro&&hasCreditLedger&&credits<=0&&<div className="tone-badge" style={{color:"var(--red)",borderColor:"#e05c6b40"}}>ESAURITI</div>}
            <div className="tone-icon" style={{color:isPro?tone.color:"#8f8fa8"}}>{tone.icon}</div>
            <div className="tone-label" style={{color:isPro?"var(--text)":"#5b586d"}}>{tone.label}</div>
          </button>
        ))}
      </div>
    </div>
  );

  // ── STEP 3: RISULTATO ──────────────────────────────────────────────────
  const step3 = (
    <div className="fade screen narrow">
      <div className="section-kicker">Passo 4</div>
      <h2 className="section-heading">{loading?"Sto riscrivendo...":"Messaggio pronto."}</h2>
      {activeTone&&<p className="helper" style={{color:activeTone.color,letterSpacing:".12em",textTransform:"uppercase",marginBottom:20}}>{activeTone.icon} tono {activeTone.label}</p>}

      {loading?(
        <div className="result-card" style={{textAlign:"center",padding:52}}>
          <div className="spin" style={{fontSize:38,color:"var(--gold)",display:"block",marginBottom:16}}>◌</div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"11px",color:"var(--sub)",lineHeight:1.8}}>ConText sta cercando il tono giusto...</div>
        </div>
      ):(
        <>
          <div className="result-card" style={{border:`1px solid ${activeTone?.color+"45"||"var(--border)"}`,borderLeft:`4px solid ${activeTone?.color||"var(--gold)"}`}}>
            <p className="result-text">{result}</p>
          </div>
          <div className="action-grid">
            <button onClick={copyResult} className="ghost-btn" style={{background:copied?"#3ecfbe18":"rgba(15,15,28,.76)",borderColor:copied?"var(--teal)":"var(--border)",color:copied?"var(--teal)":"var(--sub)"}}>{copied?"✓ Copiato":"Copia testo"}</button>
            <button onClick={()=>setStep(2)} className="ghost-btn">← Altro tono</button>
          </div>
          <button onClick={restart} className="wide-cta">+ Nuovo messaggio</button>
          <div className="original-card">
            <div className="section-kicker" style={{color:"var(--muted)",marginBottom:7}}>Originale</div>
            <p>“{input}”</p>
          </div>
        </>
      )}
    </div>
  );

  // ── HISTORY PANEL  // ── HISTORY PANEL ──────────────────────────────────────────────────────
  const historyPanel = showHistory&&(
    <div style={{position:"fixed",inset:0,background:"#000000e8",zIndex:50,display:"flex",justifyContent:"flex-end"}} onClick={()=>setShowHistory(false)}>
      <div className="fade" onClick={e=>e.stopPropagation()} style={{width:"min(380px,100vw)",height:"100vh",background:"var(--bg2)",borderLeft:"1px solid var(--border)",overflowY:"auto",padding:24}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:300,color:"var(--text)"}}>Cronologia</div>
          <button onClick={()=>setShowHistory(false)} style={{background:"transparent",border:"none",color:"var(--sub)",fontSize:20,cursor:"pointer"}}>✕</button>
        </div>
        {history.length===0?(
          <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:"var(--sub)"}}>Nessuna trasformazione ancora.</p>
        ):history.map(item=>{
          const tone=ALL_TONES.find(t=>t.label===item.tone);
          return(
            <div key={item.id} style={{borderBottom:"1px solid var(--border)",paddingBottom:16,marginBottom:16}}>
              <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap"}}>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"8px",color:tone?.color||"var(--gold)",border:`1px solid ${tone?.color||"var(--gold)"}40`,padding:"2px 7px",borderRadius:2}}>{item.tone}</span>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"8px",color:"#2a2a3e",marginLeft:"auto"}}>{item.date}</span>
              </div>
              <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:13,color:"#555",fontStyle:"italic",marginBottom:4}}>"{item.original}"</p>
              <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,color:"var(--sub)",lineHeight:1.65}}>{item.result}</p>
            </div>
          );
        })}
      </div>
    </div>
  );


  // ── INSTALL PANEL ───────────────────────────────────────────────────────
  const installPanel = showInstall&&(
    <div style={{position:"fixed",inset:0,background:"#000000e8",zIndex:95,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={()=>setShowInstall(false)}>
      <div className="fade" onClick={e=>e.stopPropagation()} style={{background:"#0c0c18",border:"1px solid #3ce6b433",borderRadius:6,padding:28,maxWidth:520,width:"100%",boxShadow:"0 20px 80px rgba(0,0,0,.45)"}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"8px",color:"var(--teal)",letterSpacing:".3em",marginBottom:10}}>◆ APP INSTALLABILE</div>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:300,color:"var(--text)",marginBottom:10}}>Porta ConText sul telefono o sul desktop</h2>
        <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:"#c2c2d4",lineHeight:1.8,marginBottom:18}}>ConText non richiede App Store: puoi aggiungerla come app installabile dal browser. Resta leggera, veloce e sempre raggiungibile.</p>
        <button onClick={installApp} style={{width:"100%",background:"var(--teal)",color:"#07100e",border:"none",borderRadius:3,padding:14,fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",letterSpacing:".18em",fontWeight:700,cursor:"pointer",marginBottom:14}}>
          {deferredPrompt ? "INSTALLA ORA" : "MOSTRA ISTRUZIONI"}
        </button>
        {installStatus&&<div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",color:"var(--teal)",lineHeight:1.7,background:"#3ce6b40c",border:"1px solid #3ce6b422",padding:"10px 12px",borderRadius:3,marginBottom:14}}>{installStatus}</div>}
        <div style={{display:"grid",gap:10}}>
          <div style={{background:"#111120",border:"1px solid var(--border)",borderRadius:3,padding:13}}>
            <strong style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",color:"var(--gold)",letterSpacing:".12em"}}>iPhone / iPad</strong>
            <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",color:"#c2c2d4",lineHeight:1.7,marginTop:7}}>Apri ConText in Safari, tocca Condividi, poi scegli “Aggiungi alla schermata Home”.</p>
          </div>
          <div style={{background:"#111120",border:"1px solid var(--border)",borderRadius:3,padding:13}}>
            <strong style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",color:"var(--gold)",letterSpacing:".12em"}}>Android</strong>
            <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",color:"#c2c2d4",lineHeight:1.7,marginTop:7}}>Apri ConText in Chrome, tocca il menu con i tre puntini e scegli “Installa app” o “Aggiungi a schermata Home”.</p>
          </div>
          <div style={{background:"#111120",border:"1px solid var(--border)",borderRadius:3,padding:13}}>
            <strong style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",color:"var(--gold)",letterSpacing:".12em"}}>Desktop</strong>
            <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",color:"#c2c2d4",lineHeight:1.7,marginTop:7}}>Su Chrome o Edge cerca l’icona di installazione nella barra indirizzi, oppure apri il menu del browser e scegli “Installa ConText”.</p>
          </div>
        </div>
        <button onClick={()=>setShowInstall(false)} style={{width:"100%",marginTop:16,background:"transparent",color:"#c2c2d4",border:"1px solid var(--border)",borderRadius:3,padding:11,fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",cursor:"pointer"}}>
          chiudi
        </button>
      </div>
    </div>
  );

  // ── PAYWALL ────────────────────────────────────────────────────────────
  const paywall = showPaywall&&(
    <div style={{position:"fixed",inset:0,background:"#000000e8",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={()=>setShowPaywall(false)}>
      <div className="fade" onClick={e=>e.stopPropagation()} style={{background:"#0c0c18",border:"1px solid #c8a84b40",borderRadius:4,padding:32,maxWidth:400,width:"100%"}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"8px",color:"var(--gold)",letterSpacing:".3em",marginBottom:10}}>◆ CREDITI CONTEXT</div>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:300,color:"var(--text)",marginBottom:10}}>{isPro&&hasCreditLedger&&credits<=0 ? "Crediti esauriti" : "Sblocca i toni avanzati con i crediti"}</h2>
        <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:"var(--sub)",lineHeight:1.8,marginBottom:22}}>{isPro&&hasCreditLedger&&credits<=0 ? "Hai terminato i crediti disponibili su questo dispositivo. Ricarica con un nuovo pacchetto per continuare a usare i toni avanzati: nessun abbonamento, nessuna scadenza." : "Hai usato le 3 trasformazioni gratuite di oggi, oppure hai scelto un tono avanzato. Torna domani o usa crediti: nessun abbonamento, nessuna scadenza."}</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:22}}>
          {[["◆","9 toni"],["∿","Toni avanzati"],["↺","Nessun abbonamento"],["∞","Senza scadenza"]].map(([ic,lb])=>(
            <div key={lb} style={{background:"#111120",border:"1px solid var(--border)",borderRadius:3,padding:12}}>
              <span style={{color:"var(--gold)",display:"block",fontSize:14,marginBottom:5,fontFamily:"'JetBrains Mono',monospace"}}>{ic}</span>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",color:"#a8a8b8",letterSpacing:".08em"}}>{lb}</span>
            </div>
          ))}
        </div>
        <button onClick={()=>{window.open('/crediti.html','_blank','noopener,noreferrer');setShowPaywall(false);}} style={{width:"100%",background:"var(--gold)",color:"#07070e",border:"none",borderRadius:3,padding:14,fontFamily:"'JetBrains Mono',monospace",fontSize:"11px",letterSpacing:".2em",fontWeight:700,cursor:"pointer",marginBottom:10,transition:"opacity .2s"}}
          onMouseEnter={e=>e.target.style.opacity=".85"}
          onMouseLeave={e=>e.target.style.opacity="1"}>
          SCOPRI I PACCHETTI CREDITI
        </button>
        <button onClick={()=>setShowPaywall(false)} style={{width:"100%",background:"transparent",color:"var(--sub)",border:"1px solid var(--border)",borderRadius:3,padding:11,fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",cursor:"pointer"}}>
          torna all'app gratis
        </button>
        <button onClick={()=>{window.open('/attiva.html','_blank','noopener,noreferrer');setShowPaywall(false);}} style={{width:"100%",marginTop:8,background:"transparent",color:"var(--gold)",border:"1px solid #c8a84b33",borderRadius:3,padding:11,fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",cursor:"pointer"}}>
          ho già un codice
        </button>
      </div>
    </div>
  );

  return (
    <div className="app-shell">
      <style>{css}</style>
      {header}
      {isPro&&step===0&&<div className="pro-banner" style={{background:hasCreditLedger&&credits<=0?"#e05c6b0d":"#c8a84b0d",borderBottomColor:hasCreditLedger&&credits<=0?"#e05c6b22":"#c8a84b20",color:hasCreditLedger&&credits<=0?"var(--red)":"var(--gold)"}}>◆ {hasCreditLedger ? `${credits} CREDITI RESIDUI` : "MODALITÀ CREDITI"} — {hasCreditLedger&&credits<=0 ? "RICARICA PER USARE I TONI AVANZATI" : "TONI AVANZATI ATTIVI"}</div>}
      {stepBar}
      <div style={{paddingBottom:40}}>
        {step===0&&step0}
        {step===1&&step1}
        {step===2&&step2}
        {step===3&&step3}
      </div>
      {historyPanel}
      {installPanel}
      {paywall}
      <footer style={{borderTop:"1px solid var(--border)",padding:"18px 20px 26px",textAlign:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:"8px",color:"#5d5a70",lineHeight:1.8}}>
        <a href="/privacy.html" target="_blank" rel="noopener noreferrer" style={{color:"var(--sub)",margin:"0 6px"}}>Privacy</a>
        <a href="/termini.html" target="_blank" rel="noopener noreferrer" style={{color:"var(--sub)",margin:"0 6px"}}>Termini</a>
        <a href="/contatti.html" target="_blank" rel="noopener noreferrer" style={{color:"var(--sub)",margin:"0 6px"}}>Contatti</a>
        <span style={{display:"block",marginTop:6}}>ConText non sostituisce consulenza legale o professionale: aiuta a formulare meglio i messaggi.</span>
      </footer>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// ROOT — splash + app
// ══════════════════════════════════════════════════════════════════════════
export default function App() {
  const [ready, setReady] = useState(false);
  const [splashDuration] = useState(()=>{
    try{return localStorage.getItem("ctx_seen_splash") ? 1500 : 3800;}catch{return 3800;}
  });
  function finishSplash(){
    try{localStorage.setItem("ctx_seen_splash","1");}catch{}
    setReady(true);
  }
  return (
    <>
      {!ready && <Splash duration={splashDuration} onDone={finishSplash}/>}
      {ready  && <MainApp/>}
    </>
  );
}
