"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

/* ─────────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    ::selection { background: rgba(16,185,129,0.28); color: #fff; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: #050608; }
    ::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.35); border-radius: 2px; }
    html { scroll-behavior: smooth; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(28px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
    @keyframes spinSlow {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes pulseRing {
      0%   { box-shadow: 0 0 0 0 rgba(16,185,129,0.35); }
      70%  { box-shadow: 0 0 0 10px rgba(16,185,129,0); }
      100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
    }
    @keyframes checkDraw {
      from { stroke-dashoffset: 50; }
      to   { stroke-dashoffset: 0; }
    }

    .fade-up  { animation: fadeUp 0.75s ease both; }
    .blink    { animation: blink 2s ease-in-out infinite; }
    .spin     { animation: spinSlow 1s linear infinite; }
    .d1 { animation-delay: .1s; }
    .d2 { animation-delay: .22s; }
    .d3 { animation-delay: .36s; }
    .d4 { animation-delay: .50s; }

    .btn-primary {
      background: #10b981; color: #fff; border: none;
      cursor: pointer; font-family: inherit; font-weight: 600;
      border-radius: 8px; display: inline-flex; align-items: center;
      justify-content: center; gap: 8px;
      transition: background .22s, transform .22s, box-shadow .22s;
      text-decoration: none;
    }
    .btn-primary:hover {
      background: #059669; transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(16,185,129,.32);
    }
    .btn-primary:disabled { opacity: .55; cursor: not-allowed; transform: none; box-shadow: none; }

    .btn-outline {
      background: transparent; color: #94a3b8;
      border: 1px solid rgba(148,163,184,.2);
      cursor: pointer; font-family: inherit; font-weight: 500;
      border-radius: 8px; display: inline-flex; align-items: center;
      justify-content: center; gap: 8px;
      transition: border-color .22s, color .22s;
      text-decoration: none;
    }
    .btn-outline:hover { border-color: #10b981; color: #10b981; }

    .card {
      background: rgba(13,15,18,.65);
      border: 1px solid rgba(255,255,255,.06);
      border-radius: 16px;
      transition: border-color .28s, transform .28s;
      backdrop-filter: blur(10px);
    }
    .card:hover { border-color: rgba(16,185,129,.22); }

    .field {
      width: 100%; background: rgba(255,255,255,.03);
      border: 1px solid rgba(255,255,255,.08); border-radius: 10px;
      padding: 13px 16px; color: #f1f5f9;
      font-family: inherit; font-size: 14px;
      outline: none; resize: none;
      transition: border-color .2s, box-shadow .2s;
    }
    .field::placeholder { color: rgba(148,163,184,.38); }
    .field:focus {
      border-color: rgba(16,185,129,.55);
      box-shadow: 0 0 0 3px rgba(16,185,129,.09);
    }

    .faq-item {
      border: 1px solid rgba(255,255,255,.06);
      border-radius: 12px; overflow: hidden;
      transition: border-color .22s;
    }
    .faq-item:hover { border-color: rgba(16,185,129,.18); }
    .faq-item.open  { border-color: rgba(16,185,129,.32); }

    .ch-card {
      background: rgba(13,15,18,.65);
      border: 1px solid rgba(255,255,255,.06);
      border-radius: 16px; padding: 26px 22px;
      display: flex; flex-direction: column; gap: 12px;
      transition: border-color .28s, transform .28s, box-shadow .28s;
      text-decoration: none;
    }
    .ch-card:hover {
      border-color: rgba(16,185,129,.3);
      transform: translateY(-4px);
      box-shadow: 0 20px 48px rgba(0,0,0,.45);
    }

    .mob-menu {
      position: fixed; inset: 0; z-index: 200;
      background: rgba(5,6,8,.98); backdrop-filter: blur(20px);
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; gap: 32px;
      animation: fadeUp .2s ease;
    }

    @media(max-width:1024px){
      .dt-only { display: none !important; }
      .mob-only { display: flex !important; }
      .contact-grid { grid-template-columns: 1fr !important; }
      .channels-grid{ grid-template-columns: repeat(2,1fr) !important; }
    }
    @media(max-width:768px){
      .mob-hamburger { display: flex !important; }
      .hero-h1 { font-size: 38px !important; }
      .sec-h2  { font-size: 30px !important; }
      .channels-grid{ grid-template-columns: 1fr !important; }
      .faq-grid { grid-template-columns: 1fr !important; }
    }
    @media(max-width:640px){
      .form-row { grid-template-columns: 1fr !important; }
    }
  `}</style>
);

/* ─────────────────────────────────────────────
   BACKGROUND
───────────────────────────────────────────── */
const Background = () => (
  <div style={{ position:"fixed", inset:0, zIndex:0, overflow:"hidden", pointerEvents:"none" }}>
    <div style={{ position:"absolute", inset:0, background:"#050608" }} />
    <div style={{
      position:"absolute", inset:0, opacity:.03,
      backgroundImage:`linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),
                       linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)`,
      backgroundSize:"60px 60px",
    }} />
    <div style={{
      position:"absolute", top:"-20%", left:"50%", transform:"translateX(-50%)",
      width:"120%", height:"55%",
      background:"radial-gradient(ellipse at center,rgba(16,185,129,.07) 0%,transparent 70%)",
    }} />
    <div style={{
      position:"absolute", bottom:"5%", right:"-5%",
      width:600, height:600, borderRadius:"50%",
      background:"radial-gradient(circle,rgba(16,185,129,.04) 0%,transparent 65%)",
      filter:"blur(70px)",
    }} />
  </div>
);

/* ─────────────────────────────────────────────
   LOGO
───────────────────────────────────────────── */
const Logo = ({ size="default" }: { size?:"default"|"small" }) => (
  <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
    <img src="/images/logo.png" alt="GestPro"
      style={{ width:size==="small"?28:36, height:size==="small"?28:36, objectFit:"contain", borderRadius:8 }} />
    <span style={{ fontWeight:700, fontSize:size==="small"?16:20, color:"#f1f5f9", letterSpacing:"-0.02em" }}>
      GestPro
    </span>
  </div>
);

/* ─────────────────────────────────────────────
   NAV
───────────────────────────────────────────── */
const Nav = ({ onLogin, onRegister }: { onLogin:()=>void; onRegister:()=>void }) => {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const links = [
    { label:"Funcionalidades", href:"/#funcionalidades" },
    { label:"Como Funciona",   href:"/#como-funciona"   },
    { label:"Planos",          href:"/#planos"           },
    { label:"Suporte",         href:"/contato", active:true },
  ];

  return (
    <>
      <nav style={{
        position:"fixed", top:0, left:0, right:0, zIndex:100,
        padding:"16px 0",
        background: scrolled ? "rgba(5,6,8,.95)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,.05)" : "none",
        transition:"all .3s ease",
      }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px",
          display:"flex", alignItems:"center", justifyContent:"space-between" }}>

          <div onClick={() => router.push("/")} style={{ cursor:"pointer" }}>
            <Logo />
          </div>

          <div className="dt-only" style={{ display:"flex", alignItems:"center", gap:40 }}>
            {links.map(l => (
              <a key={l.label} href={l.href} style={{
                fontSize:14, fontWeight: l.active ? 600 : 500,
                color: l.active ? "#10b981" : "rgba(148,163,184,.8)",
                textDecoration:"none", transition:"color .2s",
              }}
                onMouseEnter={e => (e.currentTarget.style.color="#10b981")}
                onMouseLeave={e => (e.currentTarget.style.color = l.active ? "#10b981" : "rgba(148,163,184,.8)")}
              >{l.label}</a>
            ))}
          </div>

          <div className="dt-only" style={{ display:"flex", gap:12 }}>
            <button className="btn-outline" onClick={onLogin}    style={{ padding:"10px 20px", fontSize:14 }}>Entrar</button>
            <button className="btn-primary" onClick={onRegister} style={{ padding:"10px 24px", fontSize:14 }}>Começar grátis</button>
          </div>

          <button className="mob-only mob-hamburger" onClick={() => setMenuOpen(true)}
            style={{ display:"none", background:"none", border:"none", cursor:"pointer", color:"#f1f5f9", padding:8 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="mob-menu" onClick={() => setMenuOpen(false)}>
          <button onClick={() => setMenuOpen(false)}
            style={{ position:"absolute", top:24, right:24, background:"none", border:"none", color:"#f1f5f9", cursor:"pointer" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
          {links.map(l => (
            <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)}
              style={{ fontSize:22, fontWeight:600, color: l.active ? "#10b981" : "#f1f5f9", textDecoration:"none" }}>
              {l.label}
            </a>
          ))}
          <button className="btn-primary" onClick={() => { setMenuOpen(false); onRegister(); }}
            style={{ padding:"16px 48px", fontSize:16, marginTop:24 }}>
            Começar grátis
          </button>
        </div>
      )}
    </>
  );
};

/* ─────────────────────────────────────────────
   ICONS
───────────────────────────────────────────── */
const IcoWhatsApp = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);
const IcoMail = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="M2 7l10 7 10-7"/>
  </svg>
);
const IcoClock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
  </svg>
);
const IcoBook = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);
const IcoStar = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IcoArrow = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);
const IcoChevron = ({ open }: { open: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transition:"transform .3s ease", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
    <path d="M6 9l6 6 6-6"/>
  </svg>
);
const IcoCheck = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
    style={{ strokeDasharray:50, strokeDashoffset:0, animation:"checkDraw .5s ease forwards" }}>
    <path d="M20 6L9 17l-5-5"/>
  </svg>
);

/* ─────────────────────────────────────────────
   HERO
───────────────────────────────────────────── */
const Hero = () => (
  <section style={{
    position:"relative", zIndex:10,
    paddingTop:140, paddingBottom:64, paddingLeft:24, paddingRight:24,
    textAlign:"center",
  }}>
    <div style={{ maxWidth:660, margin:"0 auto" }}>
      <div className="fade-up" style={{
        display:"inline-flex", alignItems:"center", gap:8,
        padding:"8px 16px",
        background:"rgba(16,185,129,.1)", border:"1px solid rgba(16,185,129,.2)",
        borderRadius:100, marginBottom:24,
      }}>
        <span className="blink" style={{ width:6, height:6, borderRadius:"50%", background:"#10b981", display:"inline-block" }} />
        <span style={{ fontSize:13, fontWeight:500, color:"#10b981", letterSpacing:".05em", textTransform:"uppercase" as const }}>
          Suporte &amp; Contato
        </span>
      </div>

      <h1 className="hero-h1 fade-up d1" style={{
        fontSize:58, fontWeight:700, lineHeight:1.1,
        color:"#f1f5f9", letterSpacing:"-0.03em", marginBottom:20,
      }}>
        Como podemos
        <br /><span style={{ color:"#10b981" }}>te ajudar?</span>
      </h1>

      <p className="fade-up d2" style={{
        fontSize:17, lineHeight:1.75, color:"rgba(148,163,184,.8)",
        maxWidth:460, margin:"0 auto 40px",
      }}>
        Nossa equipe está pronta para resolver qualquer dúvida.
        Escolha o canal que preferir.
      </p>

      <div className="fade-up d3" style={{
        display:"inline-flex", alignItems:"center", gap:10,
        padding:"10px 20px",
        background:"rgba(16,185,129,.06)", border:"1px solid rgba(16,185,129,.15)",
        borderRadius:100,
      }}>
        <span style={{
          display:"block", width:10, height:10, borderRadius:"50%", background:"#10b981",
          animation:"pulseRing 2s ease-in-out infinite",
        }} />
        <span style={{ fontSize:13, color:"rgba(148,163,184,.8)" }}>
          Suporte online agora · Tempo médio:{" "}
          <span style={{ color:"#10b981", fontWeight:600 }}>~2 horas</span>
        </span>
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────
   CHANNELS
───────────────────────────────────────────── */
const CHANNELS = [
  {
    icon:<IcoWhatsApp />, title:"WhatsApp",
    badge:"Mais rápido", badgeColor:"#10b981",
    desc:"Atendimento direto e ágil. Ideal para dúvidas rápidas do dia a dia.",
    info:"Seg–Sex, 8h–18h", href:"https://wa.me/5511999999999", cta:"Falar agora",
  },
  {
    icon:<IcoMail />, title:"E-mail",
    badge:"Detalhado", badgeColor:"#6366f1",
    desc:"Para questões mais complexas. Respondemos em até 24 horas úteis.",
    info:"Resposta em até 24h", href:"mailto:suporte@gestpro.app", cta:"Enviar e-mail",
  },
  {
    icon:<IcoBook />, title:"Documentação",
    badge:"Autoatendimento", badgeColor:"#f59e0b",
    desc:"Guias e tutoriais completos para resolver por conta própria, a qualquer hora.",
    info:"Disponível 24h/7 dias", href:"/como-usar", cta:"Acessar docs",
  },
  {
    icon:<IcoStar />, title:"Suporte Pro",
    badge:"Pro & Premium", badgeColor:"#ec4899",
    desc:"Canal exclusivo com SLA garantido e gerente de conta dedicado.",
    info:"SLA de 2h úteis", href:"#formulario", cta:"Abrir chamado",
  },
];

const Channels = () => (
  <section style={{ position:"relative", zIndex:10, padding:"10px 24px 80px" }}>
    <div style={{ maxWidth:1100, margin:"0 auto" }}>
      <div className="channels-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
        {CHANNELS.map((ch, i) => (
          <a key={i} href={ch.href} className="ch-card fade-up"
            style={{ animationDelay:`${i*.1}s`, color:"inherit" } as React.CSSProperties}>
            <div style={{
              width:48, height:48, borderRadius:12,
              background:"rgba(16,185,129,.1)", border:"1px solid rgba(16,185,129,.15)",
              display:"flex", alignItems:"center", justifyContent:"center", color:"#10b981",
            }}>{ch.icon}</div>
            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" as const }}>
              <h3 style={{ fontSize:16, fontWeight:700, color:"#f1f5f9" }}>{ch.title}</h3>
              <span style={{
                fontSize:10, fontWeight:600, letterSpacing:".06em",
                color:ch.badgeColor, background:`${ch.badgeColor}18`,
                border:`1px solid ${ch.badgeColor}30`,
                padding:"2px 8px", borderRadius:99,
              }}>{ch.badge}</span>
            </div>
            <p style={{ fontSize:13, lineHeight:1.65, color:"rgba(148,163,184,.7)", flex:1 }}>{ch.desc}</p>
            <div style={{ display:"flex", alignItems:"center", gap:5, color:"rgba(148,163,184,.45)", fontSize:12 }}>
              <IcoClock /> {ch.info}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6, color:"#10b981", fontSize:13, fontWeight:600 }}>
              {ch.cta} <IcoArrow />
            </div>
          </a>
        ))}
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────
   FORM
───────────────────────────────────────────── */
type Status = "idle"|"loading"|"success";

const ContactForm = () => {
  const [v, setV] = useState({ nome:"", email:"", assunto:"duvida", mensagem:"" });
  const [status, setStatus] = useState<Status>("idle");

  const submit = async () => {
    if (!v.nome || !v.email || !v.mensagem) return;
    setStatus("loading");
    await new Promise(r => setTimeout(r, 1600));
    setStatus("success");
  };

  const assuntos = [
    { val:"duvida",       lab:"Dúvida geral"           },
    { val:"tecnico",      lab:"Problema técnico"        },
    { val:"financeiro",   lab:"Financeiro / Assinatura" },
    { val:"cancelamento", lab:"Cancelamento"            },
    { val:"sugestao",     lab:"Sugestão de melhoria"    },
    { val:"outro",        lab:"Outro"                   },
  ];

  if (status === "success") return (
    <div style={{
      textAlign:"center", padding:"60px 32px",
      background:"rgba(16,185,129,.04)",
      border:"1px solid rgba(16,185,129,.2)", borderRadius:20,
    }}>
      <div style={{
        width:64, height:64, borderRadius:"50%",
        background:"rgba(16,185,129,.12)", border:"2px solid rgba(16,185,129,.3)",
        display:"flex", alignItems:"center", justifyContent:"center",
        margin:"0 auto 24px", animation:"pulseRing 2s ease-in-out infinite",
      }}><IcoCheck /></div>
      <h3 style={{ fontSize:22, fontWeight:700, color:"#f1f5f9", marginBottom:10 }}>
        Mensagem enviada!
      </h3>
      <p style={{ fontSize:14, color:"rgba(148,163,184,.7)", lineHeight:1.75, marginBottom:28 }}>
        Recebemos seu contato. Nossa equipe responderá<br />
        em até 24h no e-mail <span style={{ color:"#10b981" }}>{v.email}</span>.
      </p>
      <button className="btn-outline"
        onClick={() => { setStatus("idle"); setV({ nome:"", email:"", assunto:"duvida", mensagem:"" }); }}
        style={{ padding:"12px 28px", fontSize:14 }}>
        Enviar outra mensagem
      </button>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div className="form-row" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div>
          <label style={{ display:"block", fontSize:12, fontWeight:500, color:"rgba(148,163,184,.7)", marginBottom:8, letterSpacing:".04em" }}>
            NOME COMPLETO *
          </label>
          <input className="field" type="text" placeholder="Seu nome"
            value={v.nome} onChange={e => setV({ ...v, nome:e.target.value })} />
        </div>
        <div>
          <label style={{ display:"block", fontSize:12, fontWeight:500, color:"rgba(148,163,184,.7)", marginBottom:8, letterSpacing:".04em" }}>
            E-MAIL *
          </label>
          <input className="field" type="email" placeholder="seu@email.com"
            value={v.email} onChange={e => setV({ ...v, email:e.target.value })} />
        </div>
      </div>

      <div>
        <label style={{ display:"block", fontSize:12, fontWeight:500, color:"rgba(148,163,184,.7)", marginBottom:8, letterSpacing:".04em" }}>
          ASSUNTO
        </label>
        <select className="field" value={v.assunto} onChange={e => setV({ ...v, assunto:e.target.value })}
          style={{ appearance:"none", cursor:"pointer" }}>
          {assuntos.map(a => <option key={a.val} value={a.val} style={{ background:"#0d0f12" }}>{a.lab}</option>)}
        </select>
      </div>

      <div>
        <label style={{ display:"block", fontSize:12, fontWeight:500, color:"rgba(148,163,184,.7)", marginBottom:8, letterSpacing:".04em" }}>
          MENSAGEM *
        </label>
        <textarea className="field" placeholder="Descreva sua dúvida com o máximo de detalhes..." rows={6}
          value={v.mensagem} onChange={e => setV({ ...v, mensagem:e.target.value })} />
        <div style={{ textAlign:"right", fontSize:11, color:"rgba(148,163,184,.28)", marginTop:4 }}>
          {v.mensagem.length} caracteres
        </div>
      </div>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap" as const, gap:12 }}>
        <p style={{ fontSize:12, color:"rgba(148,163,184,.3)" }}>* campos obrigatórios · resposta em até 24h úteis</p>
        <button className="btn-primary" onClick={submit}
          disabled={status==="loading" || !v.nome || !v.email || !v.mensagem}
          style={{ padding:"14px 32px", fontSize:15 }}>
          {status === "loading"
            ? <><svg className="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10" strokeLinecap="round"/></svg>Enviando...</>
            : <>Enviar mensagem <IcoArrow /></>
          }
        </button>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   CONTACT SECTION
───────────────────────────────────────────── */
const ContactSection = () => (
  <section id="formulario" style={{ position:"relative", zIndex:10, padding:"0 24px 80px" }}>
    <div style={{ maxWidth:1100, margin:"0 auto" }}>

      <div style={{ textAlign:"center", marginBottom:56 }}>
        <span className="fade-up" style={{
          display:"inline-block", fontSize:12, fontWeight:600,
          color:"#10b981", letterSpacing:".1em", textTransform:"uppercase" as const, marginBottom:16,
        }}>Formulário de Contato</span>
        <h2 className="sec-h2 fade-up d1" style={{ fontSize:40, fontWeight:700, color:"#f1f5f9", letterSpacing:"-0.02em" }}>
          Nos envie uma mensagem,
          <br /><span style={{ color:"#10b981" }}>respondemos em breve.</span>
        </h2>
      </div>

      <div className="contact-grid" style={{ display:"grid", gridTemplateColumns:"1fr 400px", gap:28, alignItems:"start" }}>

        {/* form */}
        <div className="card fade-up" style={{ padding:"40px 36px" }}>
          <ContactForm />
        </div>

        {/* sidebar */}
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>

          {/* contact info */}
          <div className="card fade-up d1" style={{ padding:"28px" }}>
            <h3 style={{ fontSize:15, fontWeight:700, color:"#f1f5f9", marginBottom:20 }}>Informações de contato</h3>
            {[
              { icon:<IcoMail />,     label:"E-mail",   val:"suporte@gestpro.app" },
              { icon:<IcoWhatsApp />, label:"WhatsApp", val:"+55 (11) 99999-9999" },
              { icon:<IcoClock />,    label:"Horário",  val:"Seg–Sex, 8h às 18h"  },
            ].map((item, i) => (
              <div key={i} style={{
                display:"flex", alignItems:"center", gap:14,
                paddingBottom: i < 2 ? 16 : 0, marginBottom: i < 2 ? 16 : 0,
                borderBottom: i < 2 ? "1px solid rgba(255,255,255,.04)" : "none",
              }}>
                <div style={{
                  width:40, height:40, borderRadius:10, flexShrink:0,
                  background:"rgba(16,185,129,.1)", border:"1px solid rgba(16,185,129,.15)",
                  display:"flex", alignItems:"center", justifyContent:"center", color:"#10b981",
                }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize:11, color:"rgba(148,163,184,.4)", textTransform:"uppercase" as const, letterSpacing:".06em", marginBottom:2 }}>{item.label}</div>
                  <div style={{ fontSize:14, color:"#f1f5f9", fontWeight:500 }}>{item.val}</div>
                </div>
              </div>
            ))}
          </div>

          {/* SLA */}
          <div className="fade-up d2" style={{
            background:"rgba(16,185,129,.04)", border:"1px solid rgba(16,185,129,.15)",
            borderRadius:16, padding:"24px 28px",
          }}>
            <h4 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", marginBottom:16, letterSpacing:".04em", textTransform:"uppercase" as const }}>
              SLA por plano
            </h4>
            {[
              { plan:"Experimental / Básico", time:"Até 24h úteis", color:"rgba(148,163,184,.6)" },
              { plan:"Pro",                   time:"Até 8h úteis",  color:"#10b981"             },
              { plan:"Premium",               time:"Até 2h úteis",  color:"#34d399"             },
            ].map((row, i) => (
              <div key={i} style={{
                display:"flex", justifyContent:"space-between", alignItems:"center",
                padding:"10px 0",
                borderBottom: i < 2 ? "1px solid rgba(255,255,255,.04)" : "none",
              }}>
                <span style={{ fontSize:13, color:"rgba(148,163,184,.7)" }}>{row.plan}</span>
                <span style={{ fontSize:13, fontWeight:600, color:row.color }}>{row.time}</span>
              </div>
            ))}
          </div>

          {/* quick links */}
          <div className="card fade-up d3" style={{ padding:"24px 28px" }}>
            <h4 style={{ fontSize:13, fontWeight:700, color:"#f1f5f9", marginBottom:16, letterSpacing:".04em", textTransform:"uppercase" as const }}>
              Links rápidos
            </h4>
            {[
              { label:"Central de Ajuda",       href:"/como-usar"   },
              { label:"Status do sistema",       href:"#"            },
              { label:"Política de Privacidade", href:"/privacidade" },
              { label:"Termos de Uso",           href:"/termos"      },
            ].map((lk, i) => (
              <a key={i} href={lk.href} style={{
                display:"flex", alignItems:"center", justifyContent:"space-between",
                padding:"10px 0",
                borderBottom: i < 3 ? "1px solid rgba(255,255,255,.04)" : "none",
                textDecoration:"none", color:"rgba(148,163,184,.65)", fontSize:13,
                transition:"color .2s",
              }}
                onMouseEnter={e => (e.currentTarget.style.color="#10b981")}
                onMouseLeave={e => (e.currentTarget.style.color="rgba(148,163,184,.65)")}
              >
                {lk.label} <IcoArrow />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────
   FAQ
───────────────────────────────────────────── */
const FAQS = [
  { q:"Como faço para cancelar minha assinatura?",
    a:"Você pode cancelar a qualquer momento pelo painel em Configurações → Assinatura → Cancelar. O acesso continua até o fim do período já pago, sem cobranças adicionais." },
  { q:"Meus dados ficam seguros na plataforma?",
    a:"Sim. Utilizamos criptografia TLS em trânsito e AES-256 em repouso. Backups são realizados diariamente e armazenados em múltiplas regiões geográficas." },
  { q:"Posso usar o GestPro em mais de um dispositivo?",
    a:"Sim, o GestPro é 100% web e funciona em qualquer navegador. Suas informações são sincronizadas em tempo real entre computador, tablet e celular." },
  { q:"Como migrar dados de outro sistema para o GestPro?",
    a:"Aceitamos importação via planilha CSV para produtos e clientes. Nossa equipe de suporte auxilia gratuitamente no processo de migração." },
  { q:"O plano Experimental é realmente grátis?",
    a:"Sim. São 30 dias com acesso completo a todos os recursos, sem necessidade de cartão de crédito. Ao final, você escolhe qual plano continuar ou cancela sem custo." },
  { q:"Como funciona o suporte do plano Premium?",
    a:"Assinantes Premium têm canal dedicado com SLA de 2 horas úteis, além de gerente de conta para onboarding personalizado e revisões periódicas." },
  { q:"É possível ter mais de uma empresa na mesma conta?",
    a:"Sim. O plano Pro suporta até 5 empresas e o Premium é ilimitado. Troque entre elas com um clique mantendo relatórios e caixas totalmente separados." },
  { q:"Como exporto relatórios para o contador?",
    a:"Exporte relatórios completos em PDF, CSV ou HTML diretamente do painel. Os arquivos incluem todas as vendas, formas de pagamento e histórico de caixa." },
];

const FaqItem = ({ faq, open: init=false }: { faq:typeof FAQS[0]; open?:boolean }) => {
  const [open, setOpen] = useState(init);
  return (
    <div className={`faq-item${open?" open":""}`}>
      <button onClick={() => setOpen(!open)} style={{
        width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"20px 22px", background:"none", border:"none",
        cursor:"pointer", textAlign:"left" as const, gap:14,
      }}>
        <span style={{ fontSize:14, fontWeight:600, color: open ? "#f1f5f9" : "rgba(241,245,249,.82)", lineHeight:1.45, flex:1 }}>
          {faq.q}
        </span>
        <span style={{ color: open ? "#10b981" : "rgba(148,163,184,.45)", flexShrink:0 }}>
          <IcoChevron open={open} />
        </span>
      </button>
      {open && (
        <div style={{ padding:"0 22px 20px", animation:"fadeUp .2s ease both" }}>
          <p style={{ fontSize:14, lineHeight:1.8, color:"rgba(148,163,184,.72)" }}>{faq.a}</p>
        </div>
      )}
    </div>
  );
};

const FAQ = () => (
  <section style={{ position:"relative", zIndex:10, padding:"0 24px 80px" }}>
    <div style={{ maxWidth:1100, margin:"0 auto" }}>
      <div style={{ textAlign:"center", marginBottom:52 }}>
        <span className="fade-up" style={{
          display:"inline-block", fontSize:12, fontWeight:600,
          color:"#10b981", letterSpacing:".1em", textTransform:"uppercase" as const, marginBottom:16,
        }}>Perguntas Frequentes</span>
        <h2 className="sec-h2 fade-up d1" style={{ fontSize:40, fontWeight:700, color:"#f1f5f9", letterSpacing:"-0.02em" }}>
          Dúvidas comuns,
          <br /><span style={{ color:"#10b981" }}>respostas rápidas.</span>
        </h2>
      </div>

      <div className="faq-grid" style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12 }}>
        {FAQS.map((faq, i) => <FaqItem key={i} faq={faq} open={i===0} />)}
      </div>

      <div style={{
        marginTop:36, textAlign:"center",
        padding:"28px 24px",
        background:"rgba(16,185,129,.04)", border:"1px solid rgba(16,185,129,.12)", borderRadius:16,
      }}>
        <p style={{ fontSize:14, color:"rgba(148,163,184,.65)", marginBottom:16 }}>
          Não encontrou o que procurava?
        </p>
        <a href="#formulario" className="btn-primary" style={{ padding:"12px 28px", fontSize:14 }}>
          Falar com o suporte <IcoArrow />
        </a>
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
const Footer = () => {
  const links = [
    { label:"Como usar",   href:"/como-usar"  },
    { label:"Termos",      href:"/termos"      },
    { label:"Privacidade", href:"/privacidade" },
    { label:"Contato",     href:"/contato", active:true },
  ];
  return (
    <footer style={{ position:"relative", zIndex:10, padding:"40px 24px", borderTop:"1px solid rgba(255,255,255,.05)" }}>
      <div style={{ maxWidth:1200, margin:"0 auto",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        flexWrap:"wrap" as const, gap:20 }}>
        <Logo size="small" />
        <span style={{ fontSize:12, color:"rgba(148,163,184,.4)" }}>
          © {new Date().getFullYear()} GestPro · Todos os direitos reservados
        </span>
        <div style={{ display:"flex", gap:24 }}>
          {links.map(l => (
            <a key={l.label} href={l.href} style={{
              fontSize:14, textDecoration:"none", transition:"color .2s",
              color: l.active ? "#10b981" : "rgba(148,163,184,.5)",
              fontWeight: l.active ? 600 : 400,
            }}
              onMouseEnter={e => (e.currentTarget.style.color="#10b981")}
              onMouseLeave={e => (e.currentTarget.style.color = l.active ? "#10b981" : "rgba(148,163,184,.5)")}
            >{l.label}</a>
          ))}
        </div>
      </div>
    </footer>
  );
};

/* ─────────────────────────────────────────────
   ROOT EXPORT
───────────────────────────────────────────── */
export default function ContatoPage() {
  const router = useRouter();
  const goLogin    = useCallback(() => router.push("/auth/login"),    [router]);
  const goRegister = useCallback(() => router.push("/auth/cadastro"), [router]);

  return (
    <main style={{ background:"#050608", minHeight:"100vh", color:"#f1f5f9", overflowX:"hidden" }}>
      <GlobalStyles />
      <Background />
      <Nav onLogin={goLogin} onRegister={goRegister} />
      <Hero />
      <Channels />
      <ContactSection />
      <FAQ />
      <Footer />
    </main>
  );
}