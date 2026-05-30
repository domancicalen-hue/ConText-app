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
            <svg width="72" height="72" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="22" fill="rgba(60,230,180,.05)"/>
              <path d="M36 8 C20 8 8 16 8 24 C8 32 20 40 36 40 L36 34 C23 34 14 29.5 14 24 C14 18.5 23 14 36 14 Z" fill="none" stroke="url(#lg)" strokeWidth="1.8"/>
              <circle cx="30" cy="24" r="2.8" fill="url(#dg)"/>
              <circle cx="30" cy="24" r="5.5" fill="none" stroke="rgba(60,230,180,.3)" strokeWidth=".5"/>
              <line x1="36" y1="8"  x2="41" y2="8"  stroke="url(#lg)" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="36" y1="40" x2="41" y2="40" stroke="url(#lg)" strokeWidth="1.8" strokeLinecap="round"/>
              <line x1="8"  y1="24" x2="44" y2="24" stroke="rgba(60,230,180,.2)" strokeWidth=".4" strokeDasharray="2 3"/>
              <line x1="24" y1="5"  x2="24" y2="43" stroke="rgba(60,230,180,.2)" strokeWidth=".4" strokeDasharray="2 3"/>
              <defs>
                <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%"  stopColor="#3ce6b4"/>
                  <stop offset="50%" stopColor="#c8a84b"/>
                  <stop offset="100%" stopColor="#5ac8ff"/>
                </linearGradient>
                <radialGradient id="dg" cx="50%" cy="50%" r="50%">
                  <stop offset="0%"   stopColor="#ffffff"/>
                  <stop offset="100%" stopColor="#3ce6b4"/>
                </radialGradient>
              </defs>
            </svg>
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
  const [isPro, setIsPro]         = useState(false);
  const [freeUsed, setFreeUsed]   = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showInstall, setShowInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installStatus, setInstallStatus] = useState("");
  const [history, setHistory]     = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const textareaRef               = useRef(null);

  const FREE_LIMIT = 3;
  const remaining  = FREE_LIMIT - freeUsed;

  useEffect(()=>{
    try{
      const h=localStorage.getItem("ctx_h");
      const u=localStorage.getItem("ctx_u");
      const d=localStorage.getItem("ctx_d");
      if(h) setHistory(JSON.parse(h));
      if(u&&d===new Date().toDateString()) setFreeUsed(parseInt(u));
      if(localStorage.getItem("ctx_pro")==="1") setIsPro(true);
    }catch{}
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
    if(!tone.pro&&!isPro&&freeUsed>=FREE_LIMIT){ setShowPaywall(true); return; }
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
      const text=data.content?.map(c=>c.text||"").join("")||"Errore nella risposta.";
      setResult(text);
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
    }catch{ setResult("Errore di connessione. Riprova."); }
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

  // ── CSS ────────────────────────────────────────────────────────────────
  const css = `
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    :root{--bg:#07070e;--bg2:#0f0f1c;--bg3:#161626;--gold:#c8a84b;--teal:#3ecfbe;--red:#e05c6b;--text:#f0ece4;--sub:#9995a8;--border:#1e1e32;}
    html,body,#root{width:100%;max-width:100%;overflow-x:hidden;}
    body{background:var(--bg);}
    @keyframes fadeUp {from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes logoBreath{from{filter:drop-shadow(0 0 10px rgba(60,230,180,.4)) drop-shadow(0 0 28px rgba(90,200,255,.2))}to{filter:drop-shadow(0 0 24px rgba(60,230,180,.75)) drop-shadow(0 0 55px rgba(90,200,255,.4))}}
    @keyframes bioDotp{0%,100%{opacity:.25;transform:scale(1) translateY(0)}50%{opacity:1;transform:scale(1.7) translateY(-4px)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes stepPulse{0%,100%{box-shadow:0 0 0 0 rgba(200,168,75,.3)}50%{box-shadow:0 0 0 8px rgba(200,168,75,0)}}
    .fade{animation:fadeUp .35s ease both;}
    .spin{display:inline-block;animation:spin 1s linear infinite;}
    textarea{font-family:'Cormorant Garamond',serif!important;}
    textarea::placeholder{color:#2a2a40;font-style:italic;}
    textarea:focus{outline:none;}
    ::-webkit-scrollbar{width:3px;}
    ::-webkit-scrollbar-thumb{background:#1e1e32;}
    .sc-btn{transition:all .18s;border:1px solid var(--border);}
    .sc-btn:hover{transform:translateY(-2px);}
    .tone-btn{transition:all .18s;}
    .tone-btn:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.08);}
    .send-btn{transition:all .18s;}
    .send-btn:hover:not(:disabled){transform:translateY(-1px);opacity:.9;}
    .send-btn:disabled{opacity:.3;cursor:not-allowed;}
    .ex-btn{transition:all .15s;}
    .ex-btn:hover{color:var(--sub)!important;border-color:#2e2e44!important;}
    .icon-btn{transition:all .15s;}
    .icon-btn:hover{color:var(--gold)!important;border-color:#c8a84b55!important;}
    .top-actions{display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:flex-end;}
    .top-link{background:transparent;border:1px solid var(--border);color:var(--sub);padding:6px 10px;border-radius:3px;cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.1em;text-decoration:none;line-height:1;transition:all .15s;}
    .top-link:hover{color:var(--gold);border-color:#c8a84b55;}
    @media (max-width:560px){
      header{padding:12px 14px!important;align-items:flex-start!important;gap:10px!important;flex-wrap:wrap;}
      .top-actions{width:100%;max-width:none;gap:5px;justify-content:flex-start;}
      .top-link{font-size:8px;padding:6px 8px;}
    }
  `;

  const Logo = ({size=24}) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M36 8 C20 8 8 16 8 24 C8 32 20 40 36 40 L36 34 C23 34 14 29.5 14 24 C14 18.5 23 14 36 14 Z" fill="none" stroke="#c8a84b" strokeWidth="1.8"/>
      <circle cx="30" cy="24" r="2.8" fill="#c8a84b"/>
      <line x1="36" y1="8"  x2="40" y2="8"  stroke="#c8a84b" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="36" y1="40" x2="40" y2="40" stroke="#c8a84b" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );

  // ── HEADER ─────────────────────────────────────────────────────────────
  const header = (
    <header style={{padding:"14px 20px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center",background:"linear-gradient(180deg,#09091a,var(--bg))",position:"sticky",top:0,zIndex:20,backdropFilter:"blur(8px)"}}>
      <div onClick={restart} style={{cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
        <Logo size={24}/>
        <div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"8px",color:"var(--gold)",letterSpacing:".28em"}}>◆ TONE INTELLIGENCE</div>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:300,color:"var(--text)",lineHeight:1.1}}>Con<em style={{color:"var(--gold)",fontWeight:400}}>Text</em></div>
        </div>
      </div>
      <div className="top-actions">
        <a className="top-link" href="/blog/index.html" target="_blank" rel="noopener noreferrer" title="Leggi il blog ConText">Blog</a>
        <a className="top-link" href="/guida.html" target="_blank" rel="noopener noreferrer" title="Apri la guida completa di ConText">Guida</a>
        <a className="top-link" href="/attiva.html" target="_blank" rel="noopener noreferrer" title="Attiva un codice ConText">Attiva</a>
        <button className="top-link" onClick={()=>setShowInstall(true)} title="Installa ConText come app">Installa</button>
        {isPro&&(
          <button className="icon-btn" onClick={()=>setShowHistory(h=>!h)} style={{background:showHistory?"#c8a84b18":"transparent",border:"1px solid "+(showHistory?"#c8a84b40":"var(--border)"),color:showHistory?"var(--gold)":"var(--sub)",padding:"6px 12px",borderRadius:3,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",letterSpacing:".1em"}}>
            ↺ Storia
          </button>
        )}
        {!isPro&&(
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:remaining>1?"var(--teal)":"var(--red)",padding:"6px 10px"}}>
            {remaining} gratis oggi
          </div>
        )}
        <button onClick={()=>setShowPaywall(true)} style={{background:isPro?"var(--gold)":"transparent",border:"1px solid var(--gold)",color:isPro?"#07070e":"var(--gold)",padding:"6px 14px",borderRadius:3,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",letterSpacing:".12em",fontWeight:isPro?500:300,transition:"all .2s"}}>
          {isPro?"✓ CREDITI":"CREDITI"}
        </button>
      </div>
    </header>
  );

  // ── STEP BAR ───────────────────────────────────────────────────────────
  const STEP_LABELS = ["Situazione","Messaggio","Tono","Risultato"];
  const stepBar = (
    <div style={{display:"flex",alignItems:"center",padding:"16px 20px 0",maxWidth:680,margin:"0 auto",width:"100%"}}>
      {STEP_LABELS.map((s,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",flex:i<STEP_LABELS.length-1?1:"auto"}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:step===i?"var(--gold)":step>i?"#c8a84b30":"transparent",border:`1px solid ${step>=i?"var(--gold)":"var(--border)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:step===i?"#07070e":step>i?"var(--gold)":"var(--sub)",fontWeight:step===i?700:400,transition:"all .3s",...(step===i?{animation:"stepPulse 2s infinite"}:{})}}>
              {step>i?"✓":i+1}
            </div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"8px",color:step>=i?"var(--gold)":"var(--sub)",letterSpacing:".1em",whiteSpace:"nowrap",transition:"color .3s"}}>{s}</div>
          </div>
          {i<STEP_LABELS.length-1&&<div style={{flex:1,height:1,background:step>i?"var(--gold)":"var(--border)",margin:"0 6px 18px",transition:"background .3s"}}/>}
        </div>
      ))}
    </div>
  );

  // ── STEP 0: SCENARIO ───────────────────────────────────────────────────
  const step0 = (
    <div className="fade" style={{maxWidth:680,margin:"0 auto",padding:"28px 16px"}}>
      <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(25px,5vw,38px)",fontWeight:300,color:"var(--text)",marginBottom:6,lineHeight:1.1}}>Scrivi quello che pensi. <span style={{color:"var(--gold)"}}>ConText lo dice nel modo giusto.</span></h2>
      <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:"var(--sub)",marginBottom:12,lineHeight:1.7}}>Trasforma qualsiasi messaggio nel tono perfetto per la situazione. In italiano. In pochi secondi. Prova senza registrarti: 3 trasformazioni gratis ogni giorno.</p>
      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
        {["3 gratis ogni giorno","Nessun account per provare","Crediti senza abbonamento","Codice attivazione pronto"].map(t=><span key={t} style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"8px",color:"var(--teal)",border:"1px solid #3ecfbe24",borderRadius:999,padding:"6px 9px",background:"#3ecfbe0a",letterSpacing:".08em"}}>{t}</span>)}
      </div>
      <div style={{background:"var(--bg2)",border:"1px solid #3ecfbe22",borderRadius:4,padding:"14px 16px",marginBottom:22}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"8px",color:"var(--teal)",letterSpacing:".2em",marginBottom:8}}>ESEMPIO PRIMA / DOPO</div>
        <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,color:"#8f8fa8",fontStyle:"italic",lineHeight:1.5,marginBottom:8}}>“Non avete ancora pagato. È passato troppo tempo e questa cosa non va bene.”</p>
        <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:"var(--text)",lineHeight:1.55,borderLeft:"2px solid var(--gold)",paddingLeft:12}}>“Vi scrivo per sollecitare gentilmente il saldo della fattura in sospeso. Resto disponibile per eventuali chiarimenti, ma vi chiedo di procedere appena possibile.”</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10,marginBottom:22}}>
        {[
          ["Privacy", "Provi senza account e la cronologia resta sul dispositivo."],
          ["Lavoro", "Pensato per clienti, recensioni, colleghi e richieste delicate."],
          ["Premium", "I toni avanzati saranno collegati a codici/crediti acquistati."]
        ].map(([title,body])=>(
          <div key={title} style={{background:"#0f0f1caa",border:"1px solid var(--border)",borderRadius:4,padding:"12px 13px"}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"8px",color:"var(--gold)",letterSpacing:".16em",marginBottom:6}}>{title.toUpperCase()}</div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",color:"var(--sub)",lineHeight:1.65}}>{body}</div>
          </div>
        ))}
      </div>
      <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:"var(--sub)",marginBottom:24,lineHeight:1.7}}>Scegli la situazione oppure scrivi direttamente.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:10,marginBottom:20}}>
        {SCENARIOS.map(s=>(
          <button key={s.id} className="sc-btn" onClick={()=>pickScenario(s.id)} style={{background:"var(--bg2)",borderRadius:4,padding:"16px 14px",cursor:"pointer",textAlign:"left"}}>
            <span style={{fontSize:22,color:s.color,display:"block",marginBottom:8}}>{s.icon}</span>
            <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,color:"var(--text)",fontWeight:600,display:"block"}}>{s.label}</span>
          </button>
        ))}
      </div>
      <button onClick={skipScenario} style={{background:"transparent",border:"1px solid var(--border)",borderRadius:3,color:"var(--sub)",padding:"12px 24px",cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",letterSpacing:".15em",width:"100%",transition:"all .15s"}}
        onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--gold)";e.currentTarget.style.color="var(--gold)";}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--sub)";}}>
        → Scrivi direttamente senza scegliere una situazione
      </button>
    </div>
  );

  // ── STEP 1: SCRIVI ─────────────────────────────────────────────────────
  const sc = scenario ? SCENARIOS.find(s=>s.id===scenario) : null;
  const step1 = (
    <div className="fade" style={{maxWidth:680,margin:"0 auto",padding:"28px 16px"}}>
      {sc&&(
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20,padding:"12px 16px",background:sc.color+"12",border:`1px solid ${sc.color}30`,borderRadius:4}}>
          <span style={{fontSize:20,color:sc.color}}>{sc.icon}</span>
          <div>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"8px",color:sc.color,letterSpacing:".2em",marginBottom:2}}>SITUAZIONE</div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,color:"var(--text)",fontWeight:600}}>{sc.label}</div>
          </div>
          <button onClick={()=>setStep(0)} style={{marginLeft:"auto",background:"transparent",border:"none",color:"var(--sub)",cursor:"pointer",fontSize:16,padding:4}}>✕</button>
        </div>
      )}
      <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(20px,4vw,28px)",fontWeight:300,color:"var(--text)",marginBottom:6}}>Scrivi cosa vuoi dire</h2>
      <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:"var(--sub)",marginBottom:16,lineHeight:1.7}}>Senza filtri, come lo pensi davvero.</p>

      <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:4,marginBottom:16,transition:"border-color .2s"}}
        onFocusCapture={e=>e.currentTarget.style.borderColor="#c8a84b40"}
        onBlurCapture={e=>e.currentTarget.style.borderColor="var(--border)"}>
        <textarea ref={textareaRef} value={input} onChange={e=>{setText(e.target.value);setResult("");}}
          onKeyDown={e=>{if(e.key==="Enter"&&(e.metaKey||e.ctrlKey)&&input.trim())goToTones();}}
          placeholder={sc?sc.hint:"Scrivi quello che vuoi dire davvero..."}
          style={{width:"100%",minHeight:130,background:"transparent",border:"none",color:"var(--text)",fontSize:18,padding:"16px",resize:"vertical",lineHeight:1.7}}
        />
        <div style={{padding:"8px 16px 12px",borderTop:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",color:"#2a2a3e"}}>
            {input.length>0?`${input.length} caratteri`:"Oppure usa un esempio →"}
          </div>
          <div style={{display:"flex",gap:6}}>
            {EXAMPLES.map((ex,i)=>(
              <button key={i} className="ex-btn" onClick={()=>setText(ex)} style={{background:"transparent",border:"1px solid #1e1e32",borderRadius:2,color:"#8f8fa8",fontSize:"9px",padding:"4px 9px",cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>
                es.{i+1}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button className="send-btn" onClick={goToTones} disabled={!input.trim()} style={{width:"100%",background:input.trim()?"var(--gold)":"var(--bg3)",color:input.trim()?"#07070e":"var(--sub)",border:"none",borderRadius:4,padding:"16px",fontFamily:"'JetBrains Mono',monospace",fontSize:"12px",letterSpacing:".2em",fontWeight:700,cursor:input.trim()?"pointer":"not-allowed"}}>
        {input.trim()?"SCEGLI IL TONO →":"SCRIVI IL MESSAGGIO PER CONTINUARE"}
      </button>
    </div>
  );

  // ── STEP 2: TONI ───────────────────────────────────────────────────────
  const step2 = (
    <div className="fade" style={{maxWidth:680,margin:"0 auto",padding:"28px 16px"}}>
      <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderLeft:"3px solid var(--gold)",borderRadius:4,padding:"14px 16px",marginBottom:24}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"8px",color:"var(--gold)",letterSpacing:".2em",marginBottom:6}}>IL TUO MESSAGGIO</div>
        <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:"var(--sub)",fontStyle:"italic",lineHeight:1.6}}>"{input}"</p>
        <button onClick={()=>setStep(1)} style={{background:"transparent",border:"none",color:"#8f8fa8",fontSize:"10px",cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",marginTop:8,letterSpacing:".1em",padding:0,transition:"color .15s"}}
          onMouseEnter={e=>e.target.style.color="var(--sub)"}
          onMouseLeave={e=>e.target.style.color="#3a3a52"}>
          ← modifica
        </button>
      </div>

      <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(20px,4vw,28px)",fontWeight:300,color:"var(--text)",marginBottom:6}}>Come vuoi sembrare?</h2>
      <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:"var(--sub)",marginBottom:20,lineHeight:1.7}}>Tocca un tono — il messaggio viene trasformato subito.</p>

      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"8px",color:"var(--sub)",letterSpacing:".25em",marginBottom:10,textTransform:"uppercase"}}>Toni base — gratuiti</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:22}}>
        {ALL_TONES.filter(t=>!t.pro).map(tone=>(
          <button key={tone.id} className="tone-btn" onClick={()=>transform(tone)} style={{background:`${tone.color}10`,border:`1px solid ${tone.color}40`,borderRadius:4,padding:"16px 12px",cursor:"pointer",textAlign:"center"}}>
            <div style={{fontSize:24,color:tone.color,marginBottom:8,fontFamily:"'JetBrains Mono',monospace"}}>{tone.icon}</div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:"var(--text)",fontWeight:600}}>{tone.label}</div>
          </button>
        ))}
      </div>

      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"8px",color:"var(--gold)",letterSpacing:".25em",textTransform:"uppercase"}}>Toni avanzati</div>
        {!isPro&&<div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"8px",color:"#8f8fa8"}}>— usa crediti per sbloccare</div>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
        {ALL_TONES.filter(t=>t.pro).map(tone=>(
          <button key={tone.id} className="tone-btn" onClick={()=>transform(tone)} style={{background:isPro?`${tone.color}10`:"var(--bg2)",border:`1px solid ${isPro?tone.color+"40":"var(--border)"}`,borderRadius:4,padding:"16px 12px",cursor:"pointer",textAlign:"center",opacity:isPro?1:.5,position:"relative"}}>
            {!isPro&&<div style={{position:"absolute",top:5,right:5,fontFamily:"'JetBrains Mono',monospace",fontSize:"7px",color:"var(--gold)",border:"1px solid #c8a84b30",padding:"2px 5px",borderRadius:2}}>CREDITI</div>}
            <div style={{fontSize:24,color:isPro?tone.color:"#8f8fa8",marginBottom:8,fontFamily:"'JetBrains Mono',monospace"}}>{tone.icon}</div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:isPro?"var(--text)":"#3a3a52",fontWeight:600}}>{tone.label}</div>
          </button>
        ))}
      </div>
    </div>
  );

  // ── STEP 3: RISULTATO ──────────────────────────────────────────────────
  const step3 = (
    <div className="fade" style={{maxWidth:680,margin:"0 auto",padding:"28px 16px"}}>
      <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(20px,4vw,28px)",fontWeight:300,color:"var(--text)",marginBottom:6}}>
        {loading?"Riscrittura in corso...":"Ecco il tuo messaggio"}
      </h2>
      {activeTone&&<div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",color:activeTone.color,letterSpacing:".2em",marginBottom:20}}>{activeTone.icon} TONO {activeTone.label.toUpperCase()}</div>}

      {loading?(
        <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:4,padding:40,textAlign:"center"}}>
          <div className="spin" style={{fontSize:30,color:"var(--gold)",display:"block",marginBottom:14}}>◌</div>
          <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:"var(--sub)"}}>Claude sta riscrivendo...</div>
        </div>
      ):(
        <>
          <div style={{background:"var(--bg2)",border:`1px solid ${activeTone?.color+"40"||"var(--border)"}`,borderLeft:`3px solid ${activeTone?.color||"var(--gold)"}`,borderRadius:4,padding:"22px 20px",marginBottom:16}}>
            <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,lineHeight:1.75,color:"var(--text)"}}>{result}</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            <button onClick={copyResult} style={{background:copied?"#3ecfbe18":"transparent",border:`1px solid ${copied?"var(--teal)":"var(--border)"}`,borderRadius:4,padding:"14px",cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:copied?"var(--teal)":"var(--sub)",letterSpacing:".15em",transition:"all .2s"}}>
              {copied?"✓ COPIATO":"COPIA TESTO"}
            </button>
            <button onClick={()=>setStep(2)} style={{background:"transparent",border:"1px solid var(--border)",borderRadius:4,padding:"14px",cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:"var(--sub)",letterSpacing:".15em",transition:"all .2s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--gold)";e.currentTarget.style.color="var(--gold)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--sub)";}}>
              ← ALTRO TONO
            </button>
          </div>
          <button onClick={restart} style={{width:"100%",background:"var(--gold)",color:"#07070e",border:"none",borderRadius:4,padding:"14px",fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",letterSpacing:".2em",fontWeight:700,cursor:"pointer",transition:"opacity .2s"}}
            onMouseEnter={e=>e.target.style.opacity=".85"}
            onMouseLeave={e=>e.target.style.opacity="1"}>
            + NUOVO MESSAGGIO
          </button>
          <div style={{marginTop:18,padding:"12px 16px",background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:3}}>
            <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"8px",color:"#8f8fa8",letterSpacing:".2em",marginBottom:4}}>ORIGINALE</div>
            <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14,color:"#b7b7c8",fontStyle:"italic"}}>"{input}"</p>
          </div>
        </>
      )}
    </div>
  );

  // ── HISTORY PANEL ──────────────────────────────────────────────────────
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
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:300,color:"var(--text)",marginBottom:10}}>Sblocca i toni avanzati con i crediti</h2>
        <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:"10px",color:"var(--sub)",lineHeight:1.8,marginBottom:22}}>Hai usato le 3 trasformazioni gratuite di oggi, oppure hai scelto un tono avanzato. Torna domani o usa crediti: nessun abbonamento, nessuna scadenza.</p>
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
    <div style={{minHeight:"100vh",background:"var(--bg)",color:"var(--text)"}}>
      <style>{css}</style>
      {header}
      {isPro&&step===0&&<div style={{textAlign:"center",padding:"9px",background:"#c8a84b0d",borderBottom:"1px solid #c8a84b20",fontFamily:"'JetBrains Mono',monospace",fontSize:"9px",color:"var(--gold)",letterSpacing:".2em"}}>◆ MODALITÀ CREDITI — TONI AVANZATI ATTIVI</div>}
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
