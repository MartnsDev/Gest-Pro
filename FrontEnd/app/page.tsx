"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Menu,
  X,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Boxes,
  ShoppingCart,
  Building2,
  FileBarChart,
  Store,
  Wallet,
  Users,
  PlayCircle,
  ReceiptText,
  ScanLine,
} from "lucide-react";

const CONFIG = {
  brand: "GestPro",
  logoSrc: "/images/logo.png", // <- sua logo
  heroBackgroundSrc: "/images/landing/gestpro-hero-regional-market-v2.webp",
  heroMobileBackgroundSrc: "/images/landing/gestpro-hero-regional-market-mobile-v1.webp",
};

const navLinks = [
  { label: "Conheça", href: "#visao-geral" },
  { label: "Recursos", href: "#funcionalidades" },
  { label: "Planos", href: "#planos" },
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
    period: "7 dias para testar",
    companies: "1 empresa",
    cashiers: "1 caixa",
    features: ["Frente de caixa", "Controle de produtos e estoque", "Resumo do negócio"],
    cta: "Testar gratuitamente",
  },
  {
    name: "Básico",
    period: "Acesso mensal",
    companies: "1 empresa",
    cashiers: "1 caixa",
    features: ["Todos os recursos essenciais", "Relatórios de vendas", "Clientes e fornecedores"],
    cta: "Escolher Básico",
  },
  {
    name: "Pro",
    period: "Acesso mensal",
    companies: "Até 2 empresas",
    cashiers: "Até 3 caixas",
    features: ["Vendas, estoque e caixa", "Operação multiempresa", "Mais caixas por empresa", "Relatórios com exportação"],
    cta: "Quero o plano Pro",
    featured: true,
  },
  {
    name: "Premium",
    period: "Acesso mensal",
    companies: "Empresas ilimitadas",
    cashiers: "Caixas ilimitados",
    features: ["Todos os recursos do GestPro", "Empresas sem limite", "Caixas sem limite", "Cadastro de novas unidades"],
    cta: "Escolher Premium",
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
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#060807]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-white/10 bg-white/5 sm:h-10 sm:w-10">
              <Image src={CONFIG.logoSrc} alt="Logo GestPro" fill className="object-contain p-1.5" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-[20px] font-extrabold tracking-tight text-white">
                {CONFIG.brand}
              </div>
              <div className="hidden text-[11px] text-zinc-500 min-[390px]:block">Controle real para negócios reais</div>
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
    <section className="relative isolate min-h-[calc(100svh-64px)] overflow-hidden bg-[#080907] sm:min-h-[calc(100svh-80px)]">
      <Image
        src={CONFIG.heroMobileBackgroundSrc}
        alt="Loja organizada com frente de caixa e estoque ao fundo"
        fill
        priority
        quality={92}
        className="-z-20 object-cover object-[67%_center] sm:hidden"
        sizes="(max-width: 639px) 100vw, 1px"
      />
      <Image
        src={CONFIG.heroBackgroundSrc}
        alt=""
        fill
        priority
        quality={92}
        className="-z-20 hidden object-cover object-center sm:block"
        sizes="(min-width: 640px) 100vw, 1px"
        aria-hidden="true"
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(5,7,6,.72)_0%,rgba(5,7,6,.56)_48%,rgba(5,7,6,.16)_76%,rgba(5,7,6,.32)_100%)] sm:hidden" aria-hidden="true" />

      <div className="mx-auto flex min-h-[calc(100svh-64px)] w-full max-w-7xl items-start px-4 pb-16 pt-10 sm:min-h-[calc(100svh-80px)] sm:items-center sm:px-6 sm:py-16 md:py-20 lg:px-8">
        <div className="w-full max-w-[720px]">
          <div className="[&>span]:px-3 [&>span]:py-1.5 [&>span]:text-[9px] sm:[&>span]:px-4 sm:[&>span]:py-2 sm:[&>span]:text-[11px]">
            <SectionTag>Gestão para pequenos negócios</SectionTag>
          </div>

          <h1 className="mt-5 max-w-[560px] font-display text-[44px] font-black leading-[0.9] tracking-[-0.055em] text-white drop-shadow-[0_3px_24px_rgba(0,0,0,.8)] min-[390px]:text-[48px] sm:mt-6 sm:text-[58px] md:text-[72px] xl:text-[82px]">
            Controle real
            <span className="block text-zinc-200">sem ERP pesado</span>
            <span className="block text-[#78d6a3]">e sem planilha frágil</span>
          </h1>

          <p className="mt-5 max-w-xl text-[15px] leading-6 text-zinc-200 drop-shadow-[0_2px_12px_rgba(0,0,0,.9)] sm:mt-6 sm:text-[18px] sm:leading-8">
            <span className="sm:hidden">Caixa, estoque, vendas e relatórios reunidos para você acompanhar a loja sem depender de planilhas.</span>
            <span className="hidden sm:inline">Caixa, estoque, vendas e relatórios em um único lugar. O GestPro foi criado para pequenos negócios que precisam enxergar o que vendem, o que lucram e o que falta fazer. Sem perder tempo procurando informações em lugares diferentes.</span>
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 min-[390px]:grid-cols-2 sm:mt-8 sm:flex sm:flex-row">
            <Link
              href="/auth/cadastro"
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-[#78d6a3] px-5 py-3.5 text-[14px] font-bold text-[#0a1710] shadow-[0_12px_35px_rgba(120,214,163,.18)] transition-all hover:bg-[#95e3b7] sm:px-6 sm:py-4 sm:text-[15px]"
            >
              Testar o GestPro
              <ArrowRight size={17} />
            </Link>

            <a
              href="#visao-geral"
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-white/20 bg-black/55 px-5 py-3.5 text-[14px] font-semibold text-white backdrop-blur-md transition-all hover:border-white/35 hover:bg-black/70 sm:px-6 sm:py-4 sm:text-[15px]"
            >
              <PlayCircle size={17} />
              Entender como funciona
            </a>
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
            tag="GestPro na rotina"
            title={
              <>
                Venda e acompanhe sua loja
                <span className="block text-[#78d6a3]">no mesmo lugar.</span>
              </>
            }
            text="Registre vendas, controle o estoque e consulte os resultados sem alternar entre planilhas e sistemas diferentes."
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
          </div>
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

              <div className="flex min-h-7 items-center justify-end">
                {plan.featured && (
                  <span className="rounded-full bg-[#78d6a3] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.13em] text-[#0a1710]">
                    recomendado
                  </span>
                )}
              </div>

              <h3 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white">
                {plan.name}
              </h3>

              <div className="mt-5 rounded-2xl border border-white/7 bg-black/20 p-4">
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
                <ul className="space-y-3">
                  {plan.features.slice(0, 3).map((feature) => (
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
        <PlansSection />
      </main>
      <Footer />
    </div>
  );
}
