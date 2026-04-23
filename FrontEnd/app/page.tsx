"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Menu, X, Check, Lock, Shield, Database, Mail, Clock,
  ChevronDown, ArrowRight, PlayCircle, Plus, Star, Zap, Instagram, Github,
  BarChart3, Activity, Layers, Users, Building2
} from 'lucide-react';

/* ─────────────────────────────────────────────
   ⚙️ CONFIGURAÇÕES DE IMAGENS E FUNDO
───────────────────────────────────────────── */
const CONFIG = {
  navbarLogoUrl: "/images/logo.png", 
  footerLogoUrl: "/images/logo.png", 
  heroImageUrl: "/images/dashboard2.png", // A imagem que flutua no meio
  
  // NOVA CONFIGURAÇÃO DE FUNDO DO HERO
  heroBackground: {
    // Escolha entre: "video", "image" ou "color"
    type: "video", 
    
    // Se for vídeo, coloque o link do mp4 aqui. (Este é apenas um vídeo de exemplo livre de direitos)
    videoUrl: "https://cdn.pixabay.com/video/2020/08/20/47628-451299943_large.mp4", 
    
    // Se for imagem, coloque o caminho da foto aqui
    imageUrl: "/images/bg-hero.jpg", 
    
    // Overlay (Camada escura por cima para dar leitura ao texto)
    overlayOpacity: 0.75, // 0 a 1
  }
};

/* ─────────────────────────────────────────────
   ESTILOS GLOBAIS
───────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@800,500,700,900&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300..600;1,9..40,400&family=JetBrains+Mono:wght@400;500;700&family=Syne:wght@600;700;800&display=swap');

    html { scroll-behavior: smooth; }

    body {
      background-color: #080808;
      color: #FFFFFF;
      font-family: 'DM Sans', sans-serif;
      overflow-x: hidden;
    }

    .font-display { font-family: 'Cabinet Grotesk', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }

    @keyframes slideUpFade {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-reveal { animation: slideUpFade 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

    @keyframes float3D {
      0%, 100% { transform: translateY(0px) rotateX(10deg); }
      50% { transform: translateY(-20px) rotateX(15deg); }
    }
    .animate-float-3d { animation: float3D 8s ease-in-out infinite; }

    .strikethrough-anim { position: relative; display: inline-block; color: #FF3B30; }
    .strikethrough-anim::after {
      content: ''; position: absolute; left: 0; top: 50%; width: 0; height: 4px;
      background-color: #00C853; animation: strike 0.5s ease forwards 1s; transform: rotate(-2deg);
    }
    @keyframes strike { to { width: 100%; } }

    /* Nova animação para o carrossel infinito */
    @keyframes scroll-left {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .animate-carousel {
      animation: scroll-left 20s linear infinite;
    }

    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `}</style>
);

/* ─────────────────────────────────────────────
   COMPONENTES CORE E UTILITÁRIOS
───────────────────────────────────────────── */
const Reveal = ({ children, delay = 0, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const currentRef = ref.current;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(currentRef);
      }
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    if (currentRef) observer.observe(currentRef);
    return () => { if (currentRef) observer.unobserve(currentRef); };
  }, []);

  return (
    <div ref={ref} className={`${className} ${isVisible ? 'animate-reveal opacity-100' : 'opacity-0'}`} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

const ButtonPrimary = ({ children, onClick, href, className = "", icon: Icon }) => {
  const classes = `relative group bg-[#00C853] text-[#080808] font-display font-bold rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.03] shadow-[0_0_20px_rgba(0,200,83,0.3)] hover:shadow-[0_0_30px_rgba(0,200,83,0.5)] active:scale-95 flex items-center justify-center gap-2 ${className}`;
  
  const innerContent = (
    <>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out"></div>
      <span className="relative z-10 flex items-center gap-2">
        {children}
        {Icon && <Icon size={18} className="transition-transform group-hover:translate-x-1" />}
      </span>
    </>
  );

  if (href) return <Link href={href} className={classes}>{innerContent}</Link>;
  return <button onClick={onClick} className={classes}>{innerContent}</button>;
};

/* ─────────────────────────────────────────────
   SEÇÕES PRINCIPAIS
───────────────────────────────────────────── */
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Funcionalidades', id: '#funcionalidades' },
    { label: 'Preços', id: '#precos' },
    { label: 'Segurança', id: '#seguranca' },
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? 'bg-[#080808]/80 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <div className="w-10 h-10 relative flex items-center justify-center">
              <img src={CONFIG.navbarLogoUrl} alt="GestPro Logo" className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(0,200,83,0.4)]" onError={(e) => { e.target.onerror = null; e.target.src = 'https://ui-avatars.com/api/?name=G&background=10b981&color=fff&rounded=lg' }}/>
            </div>
            <span className="font-display font-bold text-2xl text-white tracking-tight">GestPro</span>
          </div>

          <ul className="hidden md:flex items-center gap-8 bg-white/5 px-8 py-3 rounded-full backdrop-blur-md border border-white/10">
            {navLinks.map(link => (
              <li key={link.label}>
                <a href={link.id} className="font-body text-[14px] font-medium text-gray-300 hover:text-white transition-colors relative group">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/auth/login" className="font-body text-[15px] font-medium text-gray-300 px-4 py-2 hover:text-white transition-colors">
              Entrar
            </Link>
            <ButtonPrimary href="/auth/cadastro" className="px-5 py-2.5 text-[14px]">
              Começar Grátis
            </ButtonPrimary>
          </div>

          <button className="md:hidden text-white" onClick={() => setMenuOpen(true)}><Menu size={32} /></button>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 bg-[#080808]/95 backdrop-blur-lg z-[200] transition-opacity duration-300 flex flex-col items-center justify-center ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <button className="absolute top-6 right-6 text-white p-2" onClick={() => setMenuOpen(false)}>
          <X size={36} />
        </button>
        <ul className="flex flex-col gap-8 text-center mb-12">
          {navLinks.map(link => (
            <li key={link.label}>
              <a href={link.id} onClick={() => setMenuOpen(false)} className="font-display font-black text-4xl text-white hover:text-[#00C853] transition-colors">{link.label}</a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

const Hero = () => {
  const [typingText, setTypingText] = useState("");
  const phrases = [
    "Você sabe quanto vendeu hoje?",
    "Você sabe qual produto mais lucra?",
    "Você sabe quando o estoque vai acabar?",
    "Agora você vai saber. Com GestPro."
  ];

  useEffect(() => {
    let currentPhrase = 0; let currentChar = 0; let isDeleting = false; let timer;
    const type = () => {
      const phrase = phrases[currentPhrase];
      const isLast = currentPhrase === phrases.length - 1;
      if (isDeleting) { setTypingText(phrase.substring(0, currentChar - 1)); currentChar--; }
      else { setTypingText(phrase.substring(0, currentChar + 1)); currentChar++; }
      let speed = isDeleting ? 25 : 50;
      if (!isDeleting && currentChar === phrase.length) { if (isLast) return; isDeleting = true; speed = 2000; }
      else if (isDeleting && currentChar === 0) { isDeleting = false; currentPhrase = (currentPhrase + 1) % phrases.length; speed = 500; }
      timer = setTimeout(type, speed);
    };
    timer = setTimeout(type, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-[110dvh] pt-32 pb-20 flex flex-col items-center justify-start overflow-hidden">
      
      {/* BACKGROUND CONFIGURÁVEL */}
      <div className="absolute inset-0 z-0 bg-[#080808]">
        {CONFIG.heroBackground.type === 'video' && (
          <video 
            autoPlay loop muted playsInline 
            className="w-full h-full object-cover"
            src={CONFIG.heroBackground.videoUrl}
          />
        )}
        {CONFIG.heroBackground.type === 'image' && (
          <img 
            className="w-full h-full object-cover"
            src={CONFIG.heroBackground.imageUrl}
            alt="Background"
          />
        )}
        {/* Overlay Escuro / Gradiente para dar leitura ao texto */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-[#080808]/90 via-[#080808]/60 to-[#080808]"
          style={{ opacity: CONFIG.heroBackground.type === 'color' ? 1 : CONFIG.heroBackground.overlayOpacity || 0.8 }}
        ></div>
      </div>

      <div className="w-full max-w-5xl mx-auto px-4 relative z-10 flex flex-col items-center text-center mt-10">
        
        <Reveal delay={0}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8 shadow-2xl">
            <Zap size={14} className="text-[#39FF14]" />
            <span className="font-body font-bold text-[12px] text-white uppercase tracking-wider">
              O sistema definitivo para o seu negócio
            </span>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <h1 className="font-display font-black text-5xl sm:text-6xl md:text-[80px] leading-[1.05] text-white mb-6 tracking-tight">
            Gestão feita para <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00C853] to-[#39FF14]">quem trabalha de verdade.</span>
          </h1>
        </Reveal>

        <Reveal delay={300}>
          <p className="font-body text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mb-6">
            GestPro é o sistema de gestão que dá visibilidade real ao seu pequeno negócio. 
            PDV funcional, estoque inteligente, relatórios que revelam o que você nunca viu.
          </p>
          <div className="h-6 mb-10 font-mono text-[16px] text-[#00C853]">
            {typingText}<span className="inline-block w-2 h-4 bg-[#00C853] ml-1 animate-[pulse_1s_infinite] align-middle"></span>
          </div>
        </Reveal>

        <Reveal delay={400} className="flex flex-col sm:flex-row items-center gap-4 justify-center w-full sm:w-auto mb-16">
          <ButtonPrimary href="/auth/cadastro" className="w-full sm:w-auto px-10 py-4 text-[18px]">
            🚀 Começar Grátis — 30 dias
          </ButtonPrimary>
          <a href="#como-funciona" className="w-full sm:w-auto px-10 py-4 font-body font-bold text-white border border-white/20 hover:border-white/50 bg-white/5 backdrop-blur-md rounded-xl flex items-center justify-center gap-2 transition-all">
            Ver como funciona <ChevronDown size={18} />
          </a>
        </Reveal>

        {/* MOCKUP FLUTUANTE CENTRALIZADO */}
        <Reveal delay={500} className="w-full max-w-6xl mx-auto relative perspective-[2000px] mt-4">
          <div className="absolute inset-0 bg-[#00C853]/20 blur-[100px] rounded-full scale-75 animate-pulse"></div>
          <div className="relative z-10 w-full transform rotate-x-[12deg] transition-transform duration-1000 hover:rotate-x-0 animate-float-3d">
            <img 
              src={CONFIG.heroImageUrl} 
              alt="Dashboard GestPro" 
              className="w-full h-auto rounded-2xl md:rounded-[2rem] border-2 border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.9),_0_0_0_1px_rgba(0,200,83,0.2)] object-cover bg-[#111]"
            />
          </div>
        </Reveal>

      </div>
    </section>
  );
};

const RotatingCarousel = () => {
  const segments = ["Loja de Roupas", "Barbearia", "Padaria", "Restaurante", "Salão de Beleza", "Depósito", "Açaíteria", "Eletrônicos"];
  // Dobrando a lista para criar o loop perfeito
  const items = [...segments, ...segments, ...segments, ...segments];

  return (
    <div className="bg-[#050505] py-8 overflow-hidden relative z-20 border-y border-white/5">
      {/* Máscaras de gradiente para esfumar as bordas */}
      <div className="absolute left-0 top-0 bottom-0 w-32 md:w-64 bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-32 md:w-64 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none"></div>
      
      {/* Efeito de perspectiva 3D */}
      <div className="flex items-center w-full" style={{ perspective: '1000px' }}>
        <div 
          className="flex w-[200%] md:w-[200%] animate-carousel items-center gap-8 md:gap-16" 
          style={{ transformStyle: 'preserve-3d', transform: 'rotateX(5deg)' }}
        >
          {items.map((name, i) => (
            <div key={i} className="flex items-center gap-3 text-gray-500 font-display font-bold text-xl md:text-2xl whitespace-nowrap hover:text-white transition-colors cursor-default">
              <div className="w-2 h-2 rounded-full bg-[#00C853]/50"></div>
              {name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PainSection = () => {
  const pains = [
    { icon: "📓", title: "Anotação no caderno", text: "Registra à mão e no fim do dia não tem certeza do total. Cada erro custa dinheiro." },
    { icon: "💔", title: "Planilha quebrada", text: "Cinco abas, fórmulas com erro, dados desatualizados. A informação está sempre errada." },
    { icon: "📦", title: "Estoque misterioso", text: "Não sabe exatamente o que tem. Descobre que acabou quando o cliente já pediu." },
    { icon: "🕳️", title: "Caixa que some", text: "O dia foi bom, mas o dinheiro não está lá. Sem controle de entrada e saída, sobra dúvida." },
    { icon: "🎲", title: "Decisões no escuro", text: "Qual produto lucra mais? Sem dados, você chuta. E chute no negócio custa caro." },
    { icon: "🔁", title: "Tempo desperdiçado", text: "Horas somando cupons e notas. Tempo que deveria ser investido em vender mais." }
  ];

  return (
    <section id="dor" className="py-24 lg:py-32 bg-[#080808] relative z-10">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Reveal>
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="font-body font-bold text-xs text-[#FF3B30] bg-[#FF3B30]/10 px-3 py-1 rounded-full uppercase tracking-wider">O problema atual</span>
            </div>
            <h2 className="font-display font-black text-4xl sm:text-5xl text-white mb-6 leading-tight">
              A realidade da maioria dos pequenos negócios
            </h2>
            <p className="font-body text-lg text-gray-400">
              Não é falta de esforço. É falta da ferramenta certa para escalar.
            </p>
          </Reveal>
        </div>
        
        {/* Layout Bento Grid (3 colunas) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pains.map((pain, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="bg-[#111]/50 backdrop-blur-sm p-8 rounded-3xl border border-white/5 hover:border-[#FF3B30]/30 hover:bg-[#150a0a] transition-all duration-300 group h-full">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/5">
                  {pain.icon}
                </div>
                <h3 className="font-display font-bold text-xl text-white mb-3">{pain.title}</h3>
                <p className="font-body text-gray-400 text-[15px] leading-relaxed">{pain.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
};

const SolutionSection = () => {
  const pillars = [
    { icon: <Activity size={32}/>, title: "Frente de Caixa Rápida", text: "Venda em 30 segundos. Busca, pagamento misto, troco.", colSpan: "md:col-span-2 lg:col-span-2" },
    { icon: <Layers size={32}/>, title: "Estoque Claro", text: "Saiba o que tem e receba alertas.", colSpan: "md:col-span-1 lg:col-span-1" },
    { icon: <BarChart3 size={32}/>, title: "Relatórios Honestos", text: "Receita e lucro real em gráficos.", colSpan: "md:col-span-1 lg:col-span-1" },
    { icon: <Check size={32}/>, title: "Fluxo Completo", text: "Controle entradas, saídas e notas.", colSpan: "md:col-span-2 lg:col-span-2" },
  ];

  return (
    <section id="solucao" className="py-24 lg:py-32 bg-[#050505] relative z-10 border-t border-white/5">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(ellipse_at_top_right,rgba(0,200,83,0.05)_0%,transparent_70%)] pointer-events-none"></div>
      
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_1.5fr] gap-16 items-center">
          
          <div>
            <Reveal>
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="font-body font-bold text-xs text-[#00C853] bg-[#00C853]/10 px-3 py-1 rounded-full uppercase tracking-wider">A Solução Definitiva</span>
              </div>
              <h2 className="font-display font-black text-4xl sm:text-5xl md:text-6xl text-white mb-6 leading-tight">
                Construído pra <br/>
                <span className="text-[#00C853]">quem faz acontecer.</span>
              </h2>
              <p className="font-body text-lg text-gray-400 mb-8">
                Esqueça sistemas pesados e interfaces datadas. O GestPro é performance no caixa, inteligência no estoque e clareza absoluta nos relatórios. Onde o design encontra a função.
              </p>
              <ButtonPrimary href="/auth/cadastro" className="px-8 py-4">
                Testar na Prática
              </ButtonPrimary>
            </Reveal>
          </div>

          {/* Bento Box para Soluções */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pillars.map((pillar, i) => (
              <Reveal key={i} delay={i * 150} className={`${pillar.colSpan}`}>
                <div className="bg-[#111] h-full p-8 rounded-3xl border border-white/5 hover:border-[#00C853]/40 hover:bg-[#111811] transition-all duration-300 flex flex-col justify-between group overflow-hidden relative">
                  <div className="absolute -right-6 -top-6 text-white/5 transform group-hover:scale-150 transition-transform duration-700">
                    {React.cloneElement(pillar.icon, { size: 120 })}
                  </div>
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-[#00C853]/10 text-[#00C853] rounded-2xl flex items-center justify-center mb-6">
                      {pillar.icon}
                    </div>
                    <h3 className="font-display font-bold text-2xl text-white mb-2">{pillar.title}</h3>
                    <p className="font-body text-gray-400">{pillar.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

const FeaturesTabs = () => {
  const [activeTab, setActiveTab] = useState(0);
  
  const tabs = [
    { id: "pdv",        icon: <Activity size={18}/>,  label: "Frente de Caixa" },
    { id: "estoque",    icon: <Layers size={18}/>,    label: "Estoque" },
    { id: "relatorios", icon: <BarChart3 size={18}/>, label: "Relatórios" },
    { id: "clientes",   icon: <Users size={18}/>,     label: "Clientes" },
    { id: "seguranca",  icon: <Shield size={18}/>,    label: "Segurança" },
    { id: "empresas",   icon: <Building2 size={18}/>, label: "Multi-empresa" },
  ];

  const content = [
    {
      title: "Frente de caixa que funciona de verdade",
      features: [
        "Busca rápida de produtos (nome ou código de barras)",
        "Pagamento misto — Ex: R$ 10 no Pix + R$ 30 em dinheiro",
        "Cálculo automático de troco e alertas",
        "Cupom não fiscal nativo (Pronto para impressora térmica)"
      ]
    },
    {
      title: "Estoque que avisa antes de faltar",
      features: [
        "Preços de custo e venda separados = lucro real visível",
        "Alertas automáticos de estoque mínimo configurável",
        "Dedução instantânea a cada venda concluída",
        "Reposição automática se a venda for cancelada"
      ]
    },
    {
      title: "Dados reais que revelam seu negócio",
      features: [
        "Filtros por dia, semana, mês ou período personalizado",
        "Receita, lucro estimado, ticket médio sempre visíveis",
        "Gráficos visuais de vendas por hora e forma de pagamento",
        "Exportação limpa em PDF, CSV e HTML"
      ]
    },
    {
      title: "Saiba com quem você faz negócios",
      features: [
        "Cadastro rápido de Clientes (CPF) e Fornecedores (CNPJ)",
        "Vínculo do cliente diretamente na tela de venda",
        "Histórico de compras simplificado",
        "Agenda de contatos e endereços centralizada"
      ]
    },
    {
      title: "Segurança sem concessões",
      features: [
        "Autenticação JWT com tokens de refresh",
        "Login social com Google OAuth2",
        "Senhas criptografadas com BCrypt",
        "Código de verificação de 6 dígitos — expira em 10 minutos",
        "Proteção CSRF e Rate Limiting"
      ]
    },
    {
      title: "Uma conta, múltiplas empresas",
      features: [
        "Gerencie várias empresas com um único login",
        "Caixas e estoques completamente isolados por empresa",
        "Troca de empresa ativa direto no header",
        "Dados isolados e sem contaminação"
      ]
    },
  ];

  return (
    <section id="funcionalidades" className="py-24 lg:py-32 bg-[#080808] relative z-10">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <Reveal>
            <h2 className="font-display font-black text-4xl sm:text-5xl text-white mb-6">
              Tudo que você precisa, <span className="text-[#00C853]">num só lugar.</span>
            </h2>
          </Reveal>
        </div>

        {/* Abas no topo - Centralizadas */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {tabs.map((tab, idx) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(idx)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-body font-bold text-[15px] transition-all duration-300
                ${activeTab === idx 
                  ? 'bg-[#00C853] text-[#080808] shadow-[0_0_20px_rgba(0,200,83,0.3)]' 
                  : 'bg-[#111] border border-white/10 text-gray-400 hover:bg-[#1A1A1A] hover:text-white'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Área de Conteúdo */}
        <div className="bg-[#111]/80 backdrop-blur-md border border-white/10 rounded-[2rem] p-8 sm:p-14 min-h-[350px] flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00C853]/10 rounded-full blur-[100px] pointer-events-none"></div>
          
          {content.map((data, idx) => (
            activeTab === idx && (
              <div key={idx} className="animate-reveal relative z-10 text-center sm:text-left">
                <h3 className="font-display font-black text-3xl sm:text-4xl text-white mb-10 leading-tight">
                  {data.title}
                </h3>
                <div className="grid sm:grid-cols-2 gap-6 sm:gap-x-12 sm:gap-y-8">
                  {data.features.map((feat, fidx) => (
                    <div key={fidx} className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-[#00C853]/20 flex items-center justify-center shrink-0 mt-1 border border-[#00C853]/30">
                        <Check size={16} className="text-[#00C853]" />
                      </div>
                      <span className="font-body text-gray-300 text-[16px] leading-relaxed">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>

      </div>
    </section>
  );
};

const HowItWorks = () => {
  const steps = [
    { n: "1", title: "Crie sua conta", text: "Cadastre ou entre com o Google." },
    { n: "2", title: "Configure a loja", text: "Dê um nome e inicie." },
    { n: "3", title: "Cadastre produtos", text: "Veja o lucro na hora." },
    { n: "4", title: "Abra o caixa", text: "Registre o valor inicial." },
    { n: "5", title: "Venda rápido", text: "Monitore estoque real." },
    { n: "6", title: "Veja os dados", text: "Exporte relatórios bonitos." },
  ];

  return (
    <section id="como-funciona" className="py-24 lg:py-32 bg-[#050505] relative z-10 border-y border-white/5">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        <Reveal>
          <div className="inline-flex items-center gap-2 mb-4">
             <span className="font-body font-bold text-xs text-[#00C853] bg-[#00C853]/10 px-3 py-1 rounded-full uppercase tracking-wider">Passo a Passo</span>
          </div>
          <h2 className="font-display font-black text-4xl sm:text-5xl text-white mb-20">Da primeira venda ao relatório</h2>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 relative">
          <div className="hidden lg:block absolute top-10 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-[#00C853]/20 to-transparent z-0 border-t border-dashed border-[#00C853]/50"></div>

          {steps.map((step, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="relative z-10 flex flex-col items-center group">
                <div className="w-20 h-20 bg-[#0A0A0A] border-2 border-white/10 group-hover:border-[#00C853] rounded-full flex items-center justify-center font-display font-black text-3xl text-white group-hover:text-[#00C853] mb-6 transition-all duration-300 shadow-xl relative overflow-hidden">
                  <span className="relative z-10">{step.n}</span>
                  <div className="absolute inset-0 bg-[#00C853] opacity-0 group-hover:opacity-10 transition-opacity"></div>
                </div>
                <h3 className="font-display font-bold text-lg text-white mb-2">{step.title}</h3>
                <p className="font-body text-sm text-gray-500 px-2">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={400} className="mt-20">
          <ButtonPrimary href="/auth/cadastro" className="px-10 py-5 text-lg mx-auto w-full sm:w-auto">
            Criar conta grátis agora <ArrowRight size={20} />
          </ButtonPrimary>
        </Reveal>
      </div>
    </section>
  );
};

const SecuritySection = () => {
  const cards = [
    { icon: <Lock className="text-[#39FF14]" size={28}/>, title: "Cookies HttpOnly", text: "Proteção máxima contra ataques e scripts." },
    { icon: <Shield className="text-[#39FF14]" size={28}/>, title: "Senhas Encriptadas", text: "BCrypt. Nenhuma senha em texto puro." },
    { icon: <Database className="text-[#39FF14]" size={28}/>, title: "Dados Isolados", text: "Arquitetura multi-empresa nativa e segura." },
    { icon: <Mail className="text-[#39FF14]" size={28}/>, title: "Verificação Segura", text: "OAuth2 Google ou e-mail verificado." },
  ];

  return (
    <section id="seguranca" className="py-24 lg:py-32 bg-[#080808] relative z-10">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/3 text-center lg:text-left">
            <Reveal>
              <div className="w-16 h-16 bg-[#00C853]/10 border border-[#00C853]/30 rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-6">
                <Shield size={32} className="text-[#00C853] animate-[pulse_3s_infinite]"/>
              </div>
              <h2 className="font-display font-black text-4xl sm:text-5xl text-white mb-6">Segurança Nível Bancário</h2>
              <p className="font-body text-lg text-gray-400">
                Construímos o GestPro com as mesmas tecnologias que protegem grandes empresas. Seus dados nunca estiveram tão seguros.
              </p>
            </Reveal>
          </div>

          <div className="w-full lg:w-2/3 grid sm:grid-cols-2 gap-6">
            {cards.map((card, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="bg-[#111] border border-white/5 p-8 rounded-3xl hover:border-[#00C853]/30 hover:bg-[#151515] transition-colors duration-300">
                  <div className="mb-6">{card.icon}</div>
                  <h3 className="font-display font-bold text-xl text-white mb-2">{card.title}</h3>
                  <p className="font-body text-gray-400 text-sm">{card.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const PricingSection = () => {
  const plans = [
    { 
      name: "Experimental", badge: "30 Dias Grátis", price: "Grátis", 
      features: ["1 empresa / loja", "1 caixa", "Até 300 produtos", "Histórico de 2 meses"], 
      cta: "Começar Grátis", isPro: false 
    },
    { 
      name: "Básico", badge: "", price: "R$ 29,90", 
      features: ["1 empresa / loja", "1 caixa", "Até 500 produtos", "Histórico de 6 meses"], 
      cta: "Assinar Básico", isPro: false 
    },
    { 
      name: "Pro", badge: "⭐ Mais Popular", price: "R$ 49,90", 
      features: ["5 empresas / lojas", "5 caixas", "Produtos ilimitados", "Histórico de 1 ano"], 
      cta: "Quero o Plano Pro", isPro: true 
    },
    { 
      name: "Premium", badge: "Redes e Franquias", price: "R$ 99,90", 
      features: ["Empresas ilimitadas", "Caixas ilimitados", "Produtos ilimitados", "Gestão completa"],
      cta: "Falar sobre Premium", isPro: false 
    }
  ];

  return (
    <section id="precos" className="py-24 lg:py-32 bg-[#050505] relative z-10 border-y border-white/5">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <Reveal>
            <h2 className="font-display font-black text-4xl sm:text-5xl text-white mb-4">Planos simples e diretos</h2>
            <p className="font-body text-lg text-gray-400">Cancele quando quiser. Sem taxas escondidas.</p>
          </Reveal>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {plans.map((plan, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className={`h-full bg-[#0A0A0A] rounded-[2rem] p-8 relative flex flex-col transition-all duration-300 hover:-translate-y-2
                ${plan.isPro ? 'border-2 border-[#00C853] shadow-[0_0_30px_rgba(0,200,83,0.1)] scale-105 z-10' : 'border border-white/10 mt-0 lg:mt-4'}`}
              >
                {plan.badge && (
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap ${plan.isPro ? 'bg-[#00C853] text-[#080808]' : 'bg-[#222] text-gray-300 border border-white/10'}`}>
                    {plan.badge}
                  </div>
                )}

                <h3 className="font-display font-bold text-2xl text-white mb-2 text-center">{plan.name}</h3>
                <div className="flex flex-col items-center justify-center gap-1 mb-8 pb-8 border-b border-white/5">
                  <span className="font-display font-black text-4xl text-white mt-4">{plan.price}</span>
                  {plan.price !== "Grátis" && <span className="font-body text-gray-500 text-sm">/mês</span>}
                </div>

                <ul className="space-y-4 flex-1 mb-8">
                  {plan.features.map((feat, fi) => (
                    <li key={fi} className="flex items-center gap-3 font-body text-gray-300 text-sm">
                      <div className="bg-[#00C853]/10 p-1 rounded-full"><Check size={14} className="text-[#00C853]" /></div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/auth/cadastro" className={`block text-center w-full py-4 rounded-xl font-display font-bold text-lg transition-all ${plan.isPro ? 'bg-[#00C853] text-[#080808] hover:bg-[#39FF14]' : 'bg-[#111] text-white border border-white/10 hover:bg-[#222]'}`}>
                  {plan.cta}
                </Link>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
};

const FaqSection = () => {
  const faqs = [
    { q: "Preciso instalar alguma coisa?", a: "Não. GestPro é 100% web. Funciona no computador, tablet e celular direto no navegador, sem download." },
    { q: "Posso acessar pelo celular?", a: "Sim. Interface responsiva — acompanhe vendas e estoque de qualquer lugar, a qualquer hora." },
    { q: "O período de teste precisa de cartão?", a: "Não. 30 dias grátis sem cartão de crédito. Só assine se gostar." },
    { q: "Consigo exportar relatórios?", a: "Sim. Exportação em CSV, PDF, HTML com gráficos e cupom não fiscal — tudo gerado direto no navegador." },
  ];
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="py-24 lg:py-32 bg-[#080808] relative z-10">
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-center text-white mb-12">Perguntas Frequentes</h2>
        </Reveal>

        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <Reveal key={i} delay={i * 100}>
                <div className={`bg-[#111] rounded-2xl border transition-colors duration-300 overflow-hidden ${isOpen ? 'border-[#00C853]' : 'border-white/5'}`}>
                  <button onClick={() => setOpenIndex(isOpen ? null : i)} className="w-full px-6 py-6 flex justify-between items-center text-left">
                    <span className="font-display font-bold text-lg text-white pr-4">{faq.q}</span>
                    <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-45 bg-[#00C853]/20 text-[#00C853]' : 'text-gray-400'}`}>
                       <Plus size={18} />
                    </div>
                  </button>
                  <div className={`px-6 transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <p className="font-body text-gray-400">{faq.a}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-[#050505] border-t border-white/5 pt-20 pb-8 relative z-10">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-6 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              <div className="w-10 h-10 relative flex items-center justify-center">
                 <img src={CONFIG.footerLogoUrl} alt="GestPro Logo" className="w-full h-full object-contain" onError={(e) => { e.target.onerror = null; e.target.src = 'https://ui-avatars.com/api/?name=G&background=10b981&color=fff&rounded=lg' }}/>
              </div>
              <span className="font-display font-bold text-2xl text-white">GestPro</span>
            </div>
            <p className="font-body text-gray-500 mb-6 max-w-xs">Controle real para negócios reais. O fim das planilhas quebradas.</p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/gestpro.app/" target='_blank' rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#111] border border-white/10 flex items-center justify-center text-white hover:border-[#00C853] hover:text-[#00C853] hover:bg-[#00C853]/10 transition-all"><Instagram size={18}/></a>
              <a href="https://github.com/MartnsDev/Gest-Pro" target='_blank' rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#111] border border-white/10 flex items-center justify-center text-white hover:border-[#00C853] hover:text-[#00C853] hover:bg-[#00C853]/10 transition-all"><Github size={18}/></a>
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold text-white text-lg mb-6">Produto</h4>
            <ul className="space-y-3 font-body text-gray-500">
              <li><a href="#funcionalidades" className="hover:text-white transition-colors">Funcionalidades</a></li>
              <li><a href="#precos" className="hover:text-white transition-colors">Preços</a></li>
              <li><Link href="/como-usar" className="hover:text-white transition-colors">Como Usar</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-white text-lg mb-6">Suporte</h4>
            <ul className="space-y-3 font-body text-gray-500">
              <li><Link href="/contato" className="hover:text-white transition-colors">Contatos / WhatsApp</Link></li>
              <li><Link href="/termos" className="hover:text-white transition-colors">Termos de Uso</Link></li>
              <li><Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-display font-bold text-white text-lg mb-6">Dúvidas?</h4>
            <Link href="/contato" className="flex w-full bg-[#111] border border-white/10 hover:border-[#00C853] text-white px-6 py-4 rounded-xl items-center justify-center gap-2 font-display font-bold transition-all">
              Falar no WhatsApp
            </Link>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 font-body text-xs text-gray-600">
          <p>© {new Date().getFullYear()} GestPro. Desenvolvido para pequenos negócios.</p>
        </div>

      </div>
    </footer>
  );
};

/* ─────────────────────────────────────────────
   APP ROOT
───────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <>
      <GlobalStyles />
      <div className="relative flex flex-col min-h-screen bg-[#080808]">
        <Navbar />
        
        <main className="flex-grow">
          <Hero />
          <RotatingCarousel />
          <PainSection />
          <SolutionSection />
          <FeaturesTabs />
          <HowItWorks />
          <SecuritySection />
          <PricingSection />
          <FaqSection />
          
          {/* CTA Final */}
          <section className="py-32 bg-[#080808] relative z-10 overflow-hidden text-center border-t border-white/5">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(0,200,83,0.1)_0%,transparent_60%)] pointer-events-none"></div>
            <div className="w-full max-w-4xl mx-auto px-4 relative z-10">
              <Reveal>
                <h2 className="font-display font-black text-5xl sm:text-6xl md:text-7xl text-white mb-6">
                  Seu negócio nas <span className="text-[#00C853]">suas mãos.</span>
                </h2>
                <p className="font-body text-lg sm:text-xl text-gray-400 mb-10">Comece agora. 30 dias grátis. Sem cartão.</p>
                <ButtonPrimary href="/auth/cadastro" className="px-10 py-5 text-xl mx-auto w-full sm:w-auto">
                  🚀 Criar conta grátis agora
                </ButtonPrimary>
              </Reveal>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
}