"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Menu,
  X,
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Boxes,
  ShoppingCart,
  BarChart3,
  Building2,
  FileBarChart,
  Store,
  Wallet,
  Users,
  RefreshCw,
  PlayCircle,
  BadgeCheck,
  ReceiptText,
  ScanLine,
} from "lucide-react";

const CONFIG = {
  brand: "GestPro",
  logoSrc: "/images/logo.png", // <- sua logo
  heroBackgroundSrc: "/images/landing/gestpro-hero-regional-market-v2.webp",
  siteUrl: "www.gestpro.site",
};

const navLinks = [
  { label: "Conheça", href: "#visao-geral" },
  { label: "Recursos", href: "#funcionalidades" },
  { label: "Benefícios", href: "#beneficios" },
  { label: "Planos", href: "#planos" },
];

const highlights = [
  "Saiba quanto entrou, quanto saiu e quanto o seu negócio realmente lucrou",
  "Evite perdas com estoque baixo, produtos parados e reposições atrasadas",
  "Venda com agilidade e mantenha cada movimentação registrada automaticamente",
  "Acompanhe uma ou várias lojas em um só lugar, com informações sempre organizadas",
];

const featureGroups = [
  {
    label: "Operação",
    title: "Venda rápida no balcão",
    text: "Sua equipe atende, recebe e confere o caixa sem interromper a rotina da loja.",
    items: [
      { icon: ReceiptText, title: "Frente de caixa", text: "Pagamento misto, desconto, troco e cupom." },
      { icon: Wallet, title: "Controle de caixa", text: "Abertura, movimentações e fechamento." },
      { icon: ShoppingCart, title: "Vendas e pedidos", text: "Consulte cada operação pelo histórico." },
    ],
  },
  {
    label: "Controle",
    title: "Rotina sempre em ordem",
    text: "Produtos, estoque e relacionamentos centralizados para você encontrar tudo com rapidez.",
    items: [
      { icon: Boxes, title: "Estoque automático", text: "Baixas por venda e alertas de reposição." },
      { icon: ScanLine, title: "Cadastro de produtos", text: "Custos, preços, margens e categorias." },
      { icon: Users, title: "Clientes e fornecedores", text: "Contatos e informações em um só lugar." },
    ],
  },
  {
    label: "Crescimento",
    title: "Decida com visão de negócio",
    text: "Acompanhe resultados e amplie a operação sem perder o controle de cada empresa.",
    items: [
      { icon: FileBarChart, title: "Relatórios claros", text: "Receita, lucro, ticket médio e exportações." },
      { icon: Building2, title: "Várias empresas", text: "Lojas, caixas e estoques independentes." },
      { icon: Store, title: "Acesso onde estiver", text: "Gestão pelo computador, tablet ou celular." },
    ],
  },
];

const plans = [
  {
    name: "Experimental",
    eyebrow: "Conheça sem compromisso",
    period: "7 dias para testar",
    companies: "1 empresa",
    cashiers: "1 caixa",
    description: "Explore a rotina do GestPro e descubra como ele pode organizar o seu negócio.",
    features: ["Frente de caixa", "Controle de produtos e estoque", "Resumo do negócio"],
    cta: "Testar gratuitamente",
  },
  {
    name: "Básico",
    eyebrow: "Para começar organizado",
    period: "Acesso mensal",
    companies: "1 empresa",
    cashiers: "1 caixa",
    description: "O essencial para centralizar a operação de uma pequena loja e abandonar as planilhas.",
    features: ["Todos os recursos essenciais", "Relatórios de vendas", "Clientes e fornecedores"],
    cta: "Escolher Básico",
  },
  {
    name: "Pro",
    eyebrow: "Melhor custo-benefício",
    period: "Acesso mensal",
    companies: "Até 2 empresas",
    cashiers: "Até 3 caixas",
    description: "Mais capacidade para quem já vende todos os dias e precisa acompanhar uma operação em crescimento.",
    features: ["Vendas, estoque e caixa", "Operação multiempresa", "Mais caixas por empresa", "Relatórios com exportação"],
    cta: "Quero o plano Pro",
    featured: true,
  },
  {
    name: "Premium",
    eyebrow: "Para operações maiores",
    period: "Acesso mensal",
    companies: "Empresas ilimitadas",
    cashiers: "Caixas ilimitados",
    description: "Liberdade para administrar redes, novas unidades e equipes sem limitar o crescimento.",
    features: ["Todos os recursos do GestPro", "Empresas sem limite", "Caixas sem limite", "Cadastro de novas unidades"],
    cta: "Escolher Premium",
  },
];

const faqs = [
  {
    q: "Preciso entender de sistemas para usar o GestPro?",
    a: "Não. O GestPro foi pensado para a rotina de pequenos negócios, com telas claras e processos diretos desde o primeiro acesso.",
  },
  {
    q: "Ele funciona para mais de uma empresa?",
    a: "Sim. Você pode gerenciar várias empresas em uma única conta, mantendo vendas, caixas, estoques e resultados organizados separadamente.",
  },
  {
    q: "Consigo controlar a venda completa pelo GestPro?",
    a: "Sim. Você registra produtos, pagamentos, descontos e troco, emite cupom e pode cancelar uma venda com a devolução automática dos itens ao estoque.",
  },
  {
    q: "Posso acessar de qualquer lugar?",
    a: "Sim. Como o GestPro funciona pela internet, você pode acompanhar o negócio pelo computador, tablet ou celular usando sua conta.",
  },
];

function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#78d6a3]/15 bg-[#78d6a3]/[0.06] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#95e3b7]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#78d6a3]" />
      {children}
    </span>
  );
}

function SectionTitle({
  tag,
  title,
  text,
}: {
  tag: string;
  title: React.ReactNode;
  text: string;
}) {
  return (
    <div className="max-w-3xl">
      <SectionTag>{tag}</SectionTag>
      <h2 className="mt-5 font-display text-4xl font-extrabold leading-[0.98] tracking-[-0.04em] text-white sm:text-5xl">
        {title}
      </h2>
      <p className="mt-5 text-[16px] leading-8 text-zinc-400 sm:text-[17px]">
        {text}
      </p>
    </div>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#060807]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-white/5">
              <Image src={CONFIG.logoSrc} alt="Logo GestPro" fill className="object-contain p-1.5" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-[20px] font-extrabold tracking-tight text-white">
                {CONFIG.brand}
              </div>
              <div className="text-[11px] text-zinc-500">Controle real para negócios reais</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-[15px] text-zinc-300 transition-colors hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/auth/login"
              className="rounded-full px-4 py-2 text-[15px] font-medium text-zinc-300 transition-colors hover:text-white"
            >
              Entrar
            </Link>
            <Link
              href="/auth/cadastro"
              className="inline-flex items-center gap-2 rounded-full bg-[#78d6a3] px-5 py-3 text-[14px] font-semibold text-[#0a1710] transition-all hover:bg-[#95e3b7]"
            >
              Começar agora
              <ArrowRight size={16} />
            </Link>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white lg:hidden"
            aria-label="Abrir menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[70] bg-[#060807] transition-all duration-300 lg:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <div className="mx-auto flex h-full max-w-7xl flex-col px-4 sm:px-6">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                <Image src={CONFIG.logoSrc} alt="Logo GestPro" fill className="object-contain p-1.5" />
              </div>
              <span className="font-display text-xl font-extrabold text-white">{CONFIG.brand}</span>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white"
              aria-label="Fechar menu"
            >
              <X size={22} />
            </button>
          </div>

          <div className="flex flex-1 flex-col justify-center gap-6">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="font-display text-3xl font-bold tracking-tight text-white"
              >
                {item.label}
              </a>
            ))}

            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/auth/cadastro"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center rounded-2xl bg-[#78d6a3] px-5 py-4 text-[15px] font-semibold text-[#0a1710]"
              >
                Começar agora
              </Link>
              <Link
                href="/auth/login"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-[15px] font-semibold text-white"
              >
                Entrar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Hero() {
  return (
    <section className="relative isolate min-h-[calc(100svh-80px)] overflow-hidden bg-[#080907]">
      <Image
        src={CONFIG.heroBackgroundSrc}
        alt="Loja organizada com frente de caixa e estoque ao fundo"
        fill
        priority
        quality={92}
        className="-z-20 object-cover object-[62%_center] sm:object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 -z-10 bg-black/30" aria-hidden="true" />

      <div className="mx-auto flex min-h-[calc(100svh-80px)] w-full max-w-7xl items-center px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <div className="max-w-[720px]">
          <SectionTag>Sistema de gestão para pequenos negócios</SectionTag>

          <h1 className="mt-6 font-display text-[42px] font-black leading-[0.92] tracking-[-0.05em] text-white drop-shadow-[0_3px_24px_rgba(0,0,0,.8)] sm:text-[58px] md:text-[72px] xl:text-[82px]">
            Controle real
            <span className="block text-zinc-200">sem ERP pesado</span>
            <span className="block text-[#78d6a3]">e sem planilha frágil</span>
          </h1>

          <p className="mt-6 max-w-xl text-[17px] leading-8 text-zinc-200 drop-shadow-[0_2px_12px_rgba(0,0,0,.9)] sm:text-[18px]">
            Caixa, estoque, vendas e relatórios em um único lugar. O GestPro foi criado para
            pequenos negócios que precisam enxergar o que vendem, o que lucram e o que falta
            fazer. Sem perder tempo procurando informações em lugares diferentes.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/auth/cadastro"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#78d6a3] px-6 py-4 text-[15px] font-semibold text-[#0a1710] transition-all hover:bg-[#95e3b7]"
            >
              Testar o GestPro
              <ArrowRight size={17} />
            </Link>

            <a
              href="#visao-geral"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-black/45 px-6 py-4 text-[15px] font-semibold text-white backdrop-blur-md transition-all hover:border-white/35 hover:bg-black/60"
            >
              <PlayCircle size={17} />
              Entender como funciona
            </a>
          </div>

          <div className="mt-8 flex max-w-2xl flex-wrap gap-x-6 gap-y-3 text-[13px] text-zinc-200">
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 size={15} className="text-[#78d6a3]" />
              PDV funcional
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 size={15} className="text-[#78d6a3]" />
              Estoque automático
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 size={15} className="text-[#78d6a3]" />
              Relatórios completos
            </span>
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 size={15} className="text-[#78d6a3]" />
              Acesso de qualquer lugar
            </span>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Venda ágil", "Frente de caixa"],
              ["Menos perdas", "Estoque"],
              ["Decisões melhores", "Relatórios"],
              ["Dados reunidos", "Visão do negócio"],
            ].map(([value, label]) => (
              <div
                key={value}
                className="rounded-2xl border border-white/15 bg-black/45 px-4 py-4 backdrop-blur-md"
              >
                <div className="font-display text-[18px] font-extrabold tracking-tight text-white">
                  {value}
                </div>
                <div className="mt-1 text-[12px] uppercase tracking-[0.18em] text-zinc-300">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function OverviewSection() {
  return (
    <section id="visao-geral" className="section-reveal border-t border-white/5 bg-[#0b0e0c] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[.86fr_1.14fr]">
          <SectionTitle
            tag="feito para o seu negócio"
            title={
              <>
                Seu negócio não precisa de mais trabalho.
                <span className="block text-[#78d6a3]">Precisa de mais clareza.</span>
              </>
            }
            text="O GestPro reúne a operação da sua empresa em um único lugar para você vender, organizar e decidir com confiança. Menos tempo procurando informações, mais tempo cuidando do crescimento."
          />

          <div className="group relative overflow-hidden rounded-[34px] border border-white/10 bg-[#0c0f0d] shadow-[0_30px_90px_rgba(0,0,0,.3)]">
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src="/images/landing/gestpro-sales-checkout.webp"
                alt="Atendimento no caixa com o painel de vendas do GestPro"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.035]"
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
            </div>
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/15 bg-[#0b110e]/90 p-4 backdrop-blur-md sm:left-auto sm:max-w-xs">
              <div className="text-[10px] font-bold uppercase tracking-[.16em] text-[#78d6a3]">A venda acontece aqui</div>
              <p className="mt-1 text-sm leading-5 text-zinc-200">Do pagamento ao controle do caixa, cada venda fica registrada no GestPro.</p>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item) => (
            <div
              key={item}
              className="group rounded-3xl border border-white/8 bg-[#111512] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#78d6a3]/25"
            >
              <div className="mb-4 inline-flex rounded-2xl bg-[#78d6a3]/10 p-3 text-[#78d6a3] transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                <BadgeCheck size={18} />
              </div>
              <p className="text-[16px] leading-7 text-zinc-300">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const [activeGroup, setActiveGroup] = useState(0);
  const group = featureGroups[activeGroup];
  const showGroup = (direction: number) => {
    setActiveGroup((current) => (current + direction + featureGroups.length) % featureGroups.length);
  };

  return (
    <section id="funcionalidades" className="section-reveal border-t border-white/5 bg-[#080b09] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          tag="recursos do GestPro"
          title={<>Encontre cada recurso sem se perder.</>}
          text="Escolha uma área para conhecer o que o GestPro oferece no caixa, no controle e nos relatórios."
        />

        <div className="mt-10 overflow-hidden rounded-[30px] border border-white/8 bg-[#111512]">
          <div className="flex flex-col gap-4 border-b border-white/7 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex rounded-2xl border border-white/8 bg-black/20 p-1" role="tablist" aria-label="Áreas do GestPro">
              {featureGroups.map((item, index) => (
                <button
                  key={item.label}
                  type="button"
                  role="tab"
                  aria-selected={activeGroup === index}
                  onClick={() => setActiveGroup(index)}
                  className={`flex-1 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all sm:flex-none ${
                    activeGroup === index
                      ? "bg-[#78d6a3] text-[#0a1710]"
                      : "text-zinc-500 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <button type="button" onClick={() => showGroup(-1)} aria-label="Área anterior" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-zinc-400 hover:border-[#78d6a3]/30 hover:text-white">
                <ChevronLeft size={18} />
              </button>
              <button type="button" onClick={() => showGroup(1)} aria-label="Próxima área" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-zinc-400 hover:border-[#78d6a3]/30 hover:text-white">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div key={activeGroup} className="animate-feature-change grid gap-8 p-6 sm:p-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center lg:p-10">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[.16em] text-[#78d6a3]">
                {String(activeGroup + 1).padStart(2, "0")} | {group.label}
              </div>
              <h3 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                {group.title}
              </h3>
              <p className="mt-4 max-w-md text-[15px] leading-7 text-zinc-400">{group.text}</p>
            </div>

            <div className="grid gap-3">
              {group.items.map((item) => (
                <div key={item.title} className="group flex items-center gap-4 rounded-2xl border border-white/7 bg-black/15 p-4 transition-colors hover:border-[#78d6a3]/20">
                  <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#78d6a3]/10 text-[#78d6a3] transition-transform group-hover:scale-110">
                    <item.icon size={19} />
                  </div>
                  <div>
                    <div className="font-display text-[16px] font-bold text-white">{item.title}</div>
                    <div className="mt-0.5 text-[13px] leading-5 text-zinc-500">{item.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  return (
    <section id="beneficios" className="section-reveal border-t border-white/5 bg-[#0b0e0c] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_.98fr]">
          <div>
            <SectionTitle
              tag="resultado na prática"
              title={<>Mais controle para você trabalhar com tranquilidade e crescer com segurança.</>}
              text="Quando vendas, estoque, caixa e relatórios conversam entre si, você reduz erros, ganha tempo e passa a decidir com base no que realmente acontece no negócio."
            />

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {[
                { icon: RefreshCw, title: "Menos retrabalho", text: "Venda, estoque e resultados atualizados juntos." },
                { icon: BarChart3, title: "Decisões com dados", text: "Informações claras sem fórmulas ou planilhas." },
                { icon: Wallet, title: "Caixa protegido", text: "Movimentações fáceis de acompanhar e conferir." },
                { icon: Building2, title: "Controle entre lojas", text: "Acompanhe novas unidades na mesma conta." },
              ].map((benefit) => (
                <div key={benefit.title} className="group rounded-[24px] border border-white/8 bg-[#111512] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#78d6a3]/25">
                  <div className="mb-4 inline-flex rounded-xl bg-[#78d6a3]/10 p-2.5 text-[#78d6a3] transition-transform duration-300 group-hover:scale-110">
                    <benefit.icon size={18} />
                  </div>
                  <h3 className="font-display text-lg font-bold text-white">{benefit.title}</h3>
                  <p className="mt-2 text-[13px] leading-6 text-zinc-400">{benefit.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-[34px] border border-white/10 bg-[#0c0f0d] shadow-[0_30px_90px_rgba(0,0,0,.3)]">
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src="/images/landing/commerce-products.webp"
                alt="Cliente escolhendo produtos frescos em um mercado"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.035]"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/15 bg-[#0b110e]/90 p-4 backdrop-blur-md sm:right-auto sm:max-w-xs">
              <div className="text-[10px] font-bold uppercase tracking-[.16em] text-[#78d6a3]">Produto disponível, venda garantida</div>
              <p className="mt-1 text-sm leading-5 text-zinc-200">Controle melhor o estoque para o cliente encontrar o que procura.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PlansSection() {
  return (
    <section id="planos" className="section-reveal border-t border-white/5 bg-[#080b09] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          tag="um plano para cada momento"
          title={<>Escolha o plano que atende sua operação hoje.</>}
          text="Compare a quantidade de empresas, caixas e recursos. Se a operação mudar, você pode trocar de plano."
        />

        <div className="mt-14 grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              style={{ animationDelay: `${index * 100}ms` }}
              className={`group relative flex min-h-full flex-col overflow-hidden rounded-[30px] border p-7 opacity-0 [animation:plan-reveal_.65s_ease-out_forwards] transition-all duration-300 hover:-translate-y-2 ${
                plan.featured
                  ? "border-[#78d6a3]/45 bg-[#102019] shadow-[0_24px_70px_rgba(61,139,95,.14)]"
                  : "border-white/8 bg-[#0c0f0d] hover:border-[#78d6a3]/25 hover:shadow-[0_24px_60px_rgba(0,0,0,.32)]"
              }`}
            >
              {plan.featured && (
                <div className="absolute inset-x-0 top-0 h-1 bg-[#78d6a3]" aria-hidden="true" />
              )}

              <div className="flex min-h-7 items-center justify-between gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#78d6a3]">
                  {plan.eyebrow}
                </span>
                {plan.featured && (
                  <span className="rounded-full bg-[#78d6a3] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.13em] text-[#0a1710]">
                    recomendado
                  </span>
                )}
              </div>

              <h3 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-white">
                {plan.name}
              </h3>
              <p className="mt-3 min-h-[84px] text-[14px] leading-6 text-zinc-400">
                {plan.description}
              </p>

              <div className="mt-6 rounded-2xl border border-white/7 bg-black/20 p-4">
                <div className="text-[12px] font-semibold text-zinc-300">{plan.period}</div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.14em] text-zinc-600">Empresas</div>
                    <div className="mt-1 text-[13px] font-semibold text-white">{plan.companies}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.14em] text-zinc-600">Caixas</div>
                    <div className="mt-1 text-[13px] font-semibold text-white">{plan.cashiers}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex-1">
                <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-500">
                  Incluído no plano
                </div>
                <ul className="mt-4 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-[13px] leading-5 text-zinc-300">
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#78d6a3]" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/auth/cadastro"
                className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-[14px] font-bold transition-all duration-300 group-hover:gap-3 ${
                  plan.featured
                    ? "bg-[#78d6a3] text-[#0a1710] hover:bg-[#95e3b7]"
                    : "border border-white/12 bg-white/[0.04] text-white hover:border-[#78d6a3]/35 hover:bg-[#78d6a3]/10"
                }`}
              >
                {plan.cta}
                <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-7 text-center text-[13px] text-zinc-500">
          Todos os planos foram pensados para uma gestão simples, segura e acessível. Você pode evoluir quando precisar.
        </p>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="section-reveal border-t border-white/5 bg-[#0b0e0c] py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[36px] border border-[#78d6a3]/20 bg-[#111512] px-6 py-10 shadow-[0_30px_90px_rgba(0,0,0,.25)] sm:px-10 sm:py-14 lg:px-14 lg:py-16">
          <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-3xl">
              <SectionTag>gestão com clareza</SectionTag>
              <h2 className="mt-5 font-display text-4xl font-extrabold leading-[0.98] tracking-[-0.04em] text-white sm:text-5xl">
                Troque a incerteza por controle.
                <span className="block text-[#78d6a3]">Acompanhe a operação em um único sistema.</span>
              </h2>
              <p className="mt-5 text-[16px] leading-8 text-zinc-400 sm:text-[17px]">
                Centralize sua operação, acompanhe os números com clareza e tenha mais confiança
                para vender, organizar e crescer todos os dias.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href="/auth/cadastro"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#78d6a3] px-6 py-4 text-[15px] font-semibold text-[#0a1710] hover:bg-[#95e3b7]"
              >
                Começar agora
                <ArrowRight size={16} />
              </Link>

              <a
                href={`https://${CONFIG.siteUrl}`}
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-[15px] font-semibold text-white hover:bg-white/[0.08]"
              >
                Conhecer o GestPro
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [open, setOpen] = useState(0);

  return (
    <section className="section-reveal border-t border-white/5 bg-[#080b09] py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          tag="dúvidas frequentes"
          title={<>Respostas rápidas sobre o GestPro.</>}
          text="Veja como funciona o acesso, o controle das vendas e a gestão de mais de uma empresa."
        />

        <div className="mt-14 space-y-4">
          {faqs.map((item, index) => {
            const active = open === index;
            return (
              <div
                key={item.q}
                className="overflow-hidden rounded-[24px] border border-white/8 bg-[#111512] transition-colors duration-300 hover:border-[#78d6a3]/20"
              >
                <button
                  onClick={() => setOpen(active ? -1 : index)}
                  className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
                >
                  <span className="font-display text-2xl font-bold tracking-tight text-white">
                    {item.q}
                  </span>
                  <ChevronDown
                    size={20}
                    className={`shrink-0 text-zinc-400 transition-transform ${
                      active ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`grid transition-all duration-300 ${
                    active ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-6 text-[15px] leading-8 text-zinc-400">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/7 bg-[#050706]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-3" aria-label="Página inicial do GestPro">
              <div className="relative h-11 w-11 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                <Image src={CONFIG.logoSrc} alt="Logo GestPro" fill className="object-contain p-1.5" />
              </div>
              <div>
                <div className="font-display text-xl font-extrabold text-white">GestPro</div>
                <div className="text-xs text-zinc-500">Controle real para negócios reais.</div>
              </div>
            </Link>
            <p className="mt-5 text-sm leading-6 text-zinc-500">
              Caixa, estoque, vendas e relatórios reunidos no mesmo sistema.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-300">Produto</h3>
            <nav className="mt-5 flex flex-col items-start gap-3 text-sm text-zinc-500" aria-label="Produto">
              <Link href="/#visao-geral" className="hover:text-[#78d6a3]">Conheça o GestPro</Link>
              <Link href="/#funcionalidades" className="hover:text-[#78d6a3]">Recursos</Link>
              <Link href="/#planos" className="hover:text-[#78d6a3]">Planos</Link>
              <Link href="/como-usar" className="hover:text-[#78d6a3]">Como usar</Link>
            </nav>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-300">Ajuda</h3>
            <nav className="mt-5 flex flex-col items-start gap-3 text-sm text-zinc-500" aria-label="Ajuda">
              <Link href="/contato" className="hover:text-[#78d6a3]">Fale conosco</Link>
              <Link href="/como-usar" className="hover:text-[#78d6a3]">Central de ajuda</Link>
              <Link href="/auth/login" className="hover:text-[#78d6a3]">Entrar na conta</Link>
              <Link href="/auth/cadastro" className="hover:text-[#78d6a3]">Criar conta</Link>
            </nav>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-300">Legal</h3>
            <nav className="mt-5 flex flex-col items-start gap-3 text-sm text-zinc-500" aria-label="Informações legais">
              <Link href="/termos" className="hover:text-[#78d6a3]">Termos de uso</Link>
              <Link href="/privacidade" className="hover:text-[#78d6a3]">Política de privacidade</Link>
            </nav>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/7 pt-6 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 GestPro. Todos os direitos reservados.</span>
          <span>Gestão simples, decisões melhores.</span>
        </div>
      </div>
    </footer>
  );
}

export default function GestProLandingPage() {
  return (
    <div className="min-h-screen bg-[#060807] text-white [font-family:Inter,sans-serif]">
      <style jsx global>{`
        .font-display {
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
            sans-serif;
        }

        @keyframes plan-reveal {
          from {
            opacity: 0;
            transform: translateY(22px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes section-reveal {
          from {
            opacity: 0;
            transform: translateY(38px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes feature-change {
          from {
            opacity: 0;
            transform: translateX(14px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-feature-change {
          animation: feature-change 0.35s ease-out both;
        }

        @supports (animation-timeline: view()) {
          .section-reveal {
            animation: section-reveal linear both;
            animation-timeline: view();
            animation-range: entry 5% cover 25%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          [class*="plan-reveal"],
          .section-reveal,
          .animate-feature-change {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      <Navbar />
      <main>
        <Hero />
        <OverviewSection />
        <FeaturesSection />
        <BenefitsSection />
        <PlansSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
