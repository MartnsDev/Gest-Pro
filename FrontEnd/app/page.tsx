"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, Boxes, Building2, Check, ChevronDown, Menu, ReceiptText, ShoppingCart, Wallet, X } from "lucide-react";

const benefits = [
  { icon: ShoppingCart, title: "Vendas mais rápidas", text: "Registre produtos, pagamentos, descontos e troco no mesmo fluxo." },
  { icon: Boxes, title: "Estoque atualizado", text: "Cada venda dá baixa nos produtos e mantém as quantidades organizadas." },
  { icon: Wallet, title: "Caixa sob controle", text: "Acompanhe abertura, movimentações e fechamento sem controles paralelos." },
  { icon: BarChart3, title: "Números mais claros", text: "Consulte receita, lucro, ticket médio e formas de pagamento." },
  { icon: Building2, title: "Uma ou várias lojas", text: "Separe empresas, caixas e estoques usando uma única conta." },
];

const areas = [
  { label: "Vendas", icon: ReceiptText, title: "Venda e receba sem interromper o atendimento", text: "O caixa reúne produtos, descontos, pagamentos e emissão de cupom em uma tela direta." },
  { label: "Estoque", icon: Boxes, title: "Saiba o que entrou, saiu e precisa ser reposto", text: "Cadastre produtos, acompanhe quantidades e receba alertas antes que um item acabe." },
  { label: "Relatórios", icon: BarChart3, title: "Entenda o resultado sem montar planilhas", text: "Visualize vendas, lucro, ticket médio, produtos e pagamentos por período." },
];

const plans = [
  { name: "Experimental", period: "30 dias", limits: "1 empresa e 1 caixa", features: ["Frente de caixa", "Estoque", "Resumo do negócio"] },
  { name: "Básico", period: "Mensal", limits: "1 empresa e 1 caixa", features: ["Recursos essenciais", "Relatórios", "Clientes e fornecedores"] },
  { name: "Pro", period: "Mensal", limits: "Até 5 empresas e 5 caixas", features: ["Operação multiempresa", "Mais caixas", "Exportação de relatórios"], featured: true },
  { name: "Premium", period: "Mensal", limits: "Empresas e caixas ilimitados", features: ["Todos os recursos", "Unidades sem limite", "Integrações com Shopee e Mercado Livre"] },
];

const faqs = [
  { q: "Preciso entender de sistemas para usar o GestPro?", a: "Não. As telas foram organizadas para a rotina de pequenos negócios e podem ser usadas desde o primeiro acesso." },
  { q: "Posso gerenciar mais de uma empresa?", a: "Sim. Os planos compatíveis permitem separar empresas, caixas, estoques e resultados na mesma conta." },
  { q: "O estoque muda quando uma venda é registrada?", a: "Sim. Os itens vendidos são descontados automaticamente e voltam ao estoque quando uma venda é cancelada." },
  { q: "Consigo acessar pelo celular?", a: "Sim. O GestPro funciona pela internet e pode ser acessado pelo computador, tablet ou celular." },
];

function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[74px] max-w-6xl items-center justify-between px-5 lg:px-0">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-9 w-9"><Image src="/images/logo.png" alt="GestPro" fill className="object-contain" /></div>
          <span className="text-xl font-extrabold tracking-tight text-[#202723]">GestPro</span>
        </Link>
        <nav className="hidden items-center gap-8 text-[13px] text-[#27302b] md:flex">
          <a href="#sobre" className="hover:text-[#238a52]">Sobre</a><a href="#recursos" className="hover:text-[#238a52]">Recursos</a><a href="#planos" className="hover:text-[#238a52]">Planos</a><a href="#faq" className="hover:text-[#238a52]">FAQ</a><Link href="/auth/login" className="hover:text-[#238a52]">Entrar</Link>
          <Link href="/auth/cadastro" className="rounded-full bg-[#258c53] px-6 py-3 text-[11px] font-bold uppercase tracking-[.1em] text-white hover:bg-[#1d7544]">Começar agora</Link>
        </nav>
        <button type="button" onClick={() => setOpen(!open)} className="text-[#27302b] md:hidden" aria-label="Abrir menu">{open ? <X /> : <Menu />}</button>
      </div>
      {open && <nav className="border-t border-zinc-100 bg-white px-5 py-6 md:hidden"><div className="mx-auto flex max-w-6xl flex-col gap-5 text-sm text-[#27302b]"><a href="#sobre" onClick={() => setOpen(false)}>Sobre</a><a href="#recursos" onClick={() => setOpen(false)}>Recursos</a><a href="#planos" onClick={() => setOpen(false)}>Planos</a><a href="#faq" onClick={() => setOpen(false)}>FAQ</a><Link href="/auth/cadastro" className="mt-2 rounded-full bg-[#258c53] px-6 py-3 text-center font-bold text-white">Começar agora</Link></div></nav>}
    </header>
  );
}

function Hero() {
  return (
    <section className="bg-white">
      <div className="mx-auto grid min-h-[calc(100svh-74px)] max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-[.9fr_1.1fr] lg:px-0 lg:py-20">
        <div className="max-w-xl">
          <p className="mb-5 text-[11px] font-bold uppercase tracking-[.14em] text-[#258c53]">Gestão para pequenos negócios</p>
          <h1 className="text-[46px] font-light leading-[1.08] tracking-[-.04em] text-[#343b37] sm:text-[60px]">Controle sua loja sem depender de<span className="block font-normal italic text-[#258c53]">planilhas e processos manuais</span></h1>
          <p className="mt-7 max-w-lg text-[16px] leading-7 text-[#3e4842]">O GestPro reúne vendas, caixa, estoque e relatórios para você acompanhar a operação em um único lugar.</p>
          <p className="mt-4 max-w-lg text-[13px] italic leading-6 text-[#718078]">Feito para mercados, lojas e comércios que precisam trabalhar com mais organização.</p>
          <Link href="/auth/cadastro" className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#258c53] px-7 py-4 text-[12px] font-bold uppercase tracking-[.1em] text-white hover:bg-[#1d7544]">Testar gratuitamente <ArrowRight size={16} /></Link>
        </div>
        <div className="relative mx-auto w-full max-w-[620px] overflow-hidden rounded-md bg-[#eef4f0]"><div className="relative aspect-[4/3]"><Image src="/images/landing/gestpro-sales-checkout.webp" alt="GestPro sendo usado no caixa de uma loja" fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 55vw" /></div></div>
      </div>
    </section>
  );
}

function About() {
  const points = ["Vendas e pagamentos registrados", "Estoque atualizado automaticamente", "Informações centralizadas", "Resultados por período", "Controle de várias empresas"];
  return (
    <section id="sobre" className="bg-white py-24 sm:py-32"><div className="mx-auto max-w-6xl px-5 lg:px-0">
      <p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#258c53]">Um sistema para sua rotina</p><h2 className="mt-4 max-w-xl text-4xl font-light leading-tight text-[#343b37] sm:text-5xl">Por que usar o <span className="italic text-[#258c53]">GestPro?</span></h2>
      <div className="mt-16 grid gap-14 lg:grid-cols-2"><div className="max-w-lg space-y-6 text-[16px] leading-8 text-[#46514b]"><p>Controles separados dificultam a conferência do caixa, escondem perdas de estoque e atrasam decisões.</p><p>O GestPro organiza a operação para que cada venda gere informação útil para o negócio.</p></div><ul className="space-y-5">{points.map((point) => <li key={point} className="flex items-center gap-4 text-[15px] text-[#46514b]"><Check size={18} className="text-[#258c53]" />{point}</li>)}</ul></div>
      <p className="mt-16 max-w-2xl border-t border-zinc-200 pt-8 text-[16px] leading-7 text-[#343b37]">Menos tempo conferindo controles. Mais clareza para cuidar da loja.</p>
    </div></section>
  );
}

function ValueSection() {
  return (
    <section className="bg-[#303a35] py-24 text-white sm:py-32"><div className="mx-auto max-w-6xl px-5 lg:px-0">
      <p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#78d6a3]">Resultado na rotina</p><h2 className="mt-4 max-w-2xl text-4xl font-light leading-tight sm:text-5xl">Como o GestPro ajuda <span className="italic text-[#78d6a3]">seu negócio</span></h2>
      <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{benefits.map((item) => <article key={item.title} className="min-h-48 rounded-2xl border border-white/15 p-7"><item.icon size={25} strokeWidth={1.6} className="text-[#78d6a3]" /><h3 className="mt-6 text-[16px] font-semibold">{item.title}</h3><p className="mt-3 text-[13px] leading-6 text-zinc-300">{item.text}</p></article>)}</div>
    </div></section>
  );
}

function Resources() {
  const [active, setActive] = useState(0); const area = areas[active];
  return (
    <section id="recursos" className="bg-white py-24 sm:py-32"><div className="mx-auto max-w-6xl px-5 lg:px-0">
      <h2 className="max-w-md text-4xl font-light leading-tight text-[#343b37] sm:text-5xl">O essencial para a operação <span className="italic text-[#258c53]">não parar</span></h2>
      <div className="mt-14 grid items-center gap-12 lg:grid-cols-[.7fr_1.3fr]"><div className="space-y-1 border-y border-zinc-200 py-2">{areas.map((item, index) => <button key={item.label} type="button" onClick={() => setActive(index)} className={`flex w-full items-center justify-between border-b border-zinc-100 px-2 py-5 text-left text-[15px] last:border-0 ${active === index ? "font-semibold text-[#258c53]" : "text-[#4b5650]"}`}>{item.label}<span className="text-xl font-light">{active === index ? "−" : "+"}</span></button>)}</div>
        <div className="bg-[#f3f6f4] p-6 sm:p-10"><div className="relative aspect-[16/10] overflow-hidden bg-[#edf2ef]"><Image src="/images/landing/gestpro-resources-market-v1.webp" alt="Computador com o GestPro no caixa de um mercado regional" fill className="object-cover object-center" sizes="(max-width: 1024px) 100vw, 60vw" /></div><div className="mx-auto max-w-xl pt-8 text-center"><area.icon className="mx-auto text-[#258c53]" /><h3 className="mt-4 text-xl font-semibold text-[#2f3833]">{area.title}</h3><p className="mt-3 text-sm leading-6 text-[#6a7770]">{area.text}</p></div></div>
      </div>
    </div></section>
  );
}

function Plans() {
  return (
    <section id="planos" className="bg-[#303a35] py-24 text-white sm:py-32"><div className="mx-auto max-w-6xl px-5 lg:px-0">
      <div className="text-center"><p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#78d6a3]">Planos</p><h2 className="mt-4 text-4xl font-light sm:text-5xl">Escolha o plano da <span className="italic text-[#78d6a3]">sua operação</span></h2></div>
      <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">{plans.map((plan) => <article key={plan.name} className={`flex min-h-[380px] flex-col rounded-2xl border p-7 ${plan.featured ? "border-[#78d6a3] bg-white text-[#2f3833]" : "border-white/15"}`}><div className="flex items-center justify-between"><h3 className="text-2xl font-semibold">{plan.name}</h3>{plan.featured && <span className="text-[9px] font-bold uppercase tracking-wider text-[#258c53]">Recomendado</span>}</div><p className={`mt-4 text-sm ${plan.featured ? "text-[#66736c]" : "text-zinc-300"}`}>{plan.period}</p><p className={`mt-2 text-[13px] ${plan.featured ? "text-[#66736c]" : "text-zinc-400"}`}>{plan.limits}</p><ul className="mt-8 flex-1 space-y-4">{plan.features.map((feature) => <li key={feature} className="flex gap-3 text-[13px]"><Check size={16} className="shrink-0 text-[#78d6a3]" />{feature}</li>)}</ul><Link href="/auth/cadastro" className={`mt-8 rounded-full px-5 py-3 text-center text-[11px] font-bold uppercase tracking-wider ${plan.featured ? "bg-[#258c53] text-white" : "border border-white/30 hover:border-[#78d6a3]"}`}>Escolher plano</Link></article>)}</div>
    </div></section>
  );
}

function FAQ() {
  const [open, setOpen] = useState(-1);
  return (
    <section id="faq" className="bg-white py-24 sm:py-32"><div className="mx-auto max-w-6xl px-5 lg:px-0"><h2 className="text-4xl font-light text-[#343b37] sm:text-5xl">Perguntas <span className="italic text-[#258c53]">frequentes</span></h2><div className="mt-16">{faqs.map((item, index) => <div key={item.q} className="border-b border-zinc-200"><button type="button" onClick={() => setOpen(open === index ? -1 : index)} className="flex w-full items-center justify-between gap-6 py-6 text-left text-[15px] font-semibold text-[#343b37]">{item.q}<ChevronDown size={18} className={`shrink-0 text-[#258c53] transition-transform ${open === index ? "rotate-180" : ""}`} /></button>{open === index && <p className="max-w-3xl pb-6 text-sm leading-7 text-[#66736c]">{item.a}</p>}</div>)}</div></div></section>
  );
}

function Footer() {
  return <><section className="bg-[#303a35] py-20 text-white"><div className="mx-auto flex max-w-6xl flex-col justify-between gap-8 px-5 md:flex-row md:items-center lg:px-0"><div><h2 className="text-4xl font-light">Comece a organizar <span className="italic text-[#78d6a3]">sua loja</span></h2><p className="mt-4 text-sm text-zinc-300">Teste o GestPro e conheça a rotina do sistema.</p></div><Link href="/auth/cadastro" className="inline-flex items-center justify-center gap-3 rounded-full bg-[#78d6a3] px-7 py-4 text-[11px] font-bold uppercase tracking-wider text-[#173323]">Criar minha conta <ArrowRight size={16} /></Link></div></section><footer className="bg-white py-14 text-[#3f4944]"><div className="mx-auto grid max-w-6xl gap-10 px-5 sm:grid-cols-3 lg:px-0"><div><div className="flex items-center gap-3"><div className="relative h-9 w-9"><Image src="/images/logo.png" alt="GestPro" fill className="object-contain" /></div><span className="text-xl font-extrabold">GestPro</span></div><p className="mt-4 text-sm text-[#718078]">Controle real para negócios reais.</p></div><div><h3 className="font-semibold">Ajuda</h3><div className="mt-4 flex flex-col gap-3 text-sm text-[#718078]"><Link href="/como-usar">Como usar</Link><Link href="/contato">Contato</Link><Link href="/auth/login">Entrar</Link></div></div><div><h3 className="font-semibold">Legal</h3><div className="mt-4 flex flex-col gap-3 text-sm text-[#718078]"><Link href="/termos">Termos de uso</Link><Link href="/privacidade">Privacidade</Link></div></div></div><div className="mx-auto mt-12 max-w-6xl border-t border-zinc-200 px-5 pt-6 text-center text-xs text-[#8a958f] lg:px-0">© 2026 GestPro. Todos os direitos reservados.</div></footer></>;
}

export default function Home() {
  return <div className="min-h-screen bg-white font-sans"><Header /><main><Hero /><About /><ValueSection /><Resources /><Plans /><FAQ /></main><Footer /></div>;
}
