"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, Boxes, Building2, Check, ChevronDown, Menu, ReceiptText, ShoppingCart, Wallet, X } from "lucide-react";
import { LanguageSelector } from "@/components/language-selector";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { useLanguage } from "@/components/language-provider";

const landingCopy = {
  pt: { about: "Sobre", resources: "Recursos", plans: "Planos", login: "Entrar", start: "Começar agora", eyebrow: "Gestão para pequenos negócios", title: "Controle sua loja sem depender de", accent: "planilhas e processos manuais", intro: "O Gevyro reúne vendas, caixa, estoque e relatórios para você acompanhar a operação em um único lugar.", note: "Feito para mercados, lojas e comércios que precisam trabalhar com mais organização.", trial: "Testar gratuitamente", routine: "Um sistema para sua rotina", why: "Por que usar o", problem: "Controles separados dificultam a conferência do caixa, escondem perdas de estoque e atrasam decisões.", solution: "O Gevyro organiza a operação para que cada venda gere informação útil para o negócio.", conclusion: "Menos tempo conferindo controles. Mais clareza para cuidar da loja.", results: "Resultado na rotina", helps: "Como o Gevyro ajuda", business: "seu negócio", essential: "O essencial para a operação", nonstop: "não parar", choose: "Escolha o plano da", operation: "sua operação", recommended: "Recomendado", choosePlan: "Escolher plano", questions: "Perguntas", frequent: "frequentes", organize: "Comece a organizar", store: "sua loja", test: "Teste o Gevyro e conheça a rotina do sistema.", create: "Criar minha conta", service: "Atendimento", how: "Como usar", contact: "Fale conosco", client: "Área do cliente", transparency: "Transparência", terms: "Termos de uso", privacy: "Política de privacidade", support: "Suporte", rights: "Todos os direitos reservados.", made: "Plataforma de gestão desenvolvida no Brasil.", points: ["Vendas e pagamentos registrados", "Estoque atualizado automaticamente", "Informações centralizadas", "Resultados por período", "Controle de várias empresas"] },
  en: { about: "About", resources: "Features", plans: "Plans", login: "Sign in", start: "Get started", eyebrow: "Management for small businesses", title: "Run your store without relying on", accent: "spreadsheets and manual processes", intro: "Gevyro brings sales, cash register, inventory and reports together so you can manage your operation in one place.", note: "Built for markets, stores and retailers that need a more organized routine.", trial: "Try it free", routine: "A system built for your routine", why: "Why choose", problem: "Separate controls make cash reconciliation harder, hide inventory losses and delay decisions.", solution: "Gevyro organizes the operation so every sale produces useful business information.", conclusion: "Less time checking controls. More clarity to run your store.", results: "Everyday results", helps: "How Gevyro helps", business: "your business", essential: "Everything your operation needs to", nonstop: "keep moving", choose: "Choose the right plan for", operation: "your operation", recommended: "Recommended", choosePlan: "Choose plan", questions: "Frequently asked", frequent: "questions", organize: "Start organizing", store: "your store", test: "Try Gevyro and discover a simpler operating routine.", create: "Create my account", service: "Support", how: "How to use", contact: "Contact us", client: "Customer area", transparency: "Transparency", terms: "Terms of use", privacy: "Privacy policy", support: "Support", rights: "All rights reserved.", made: "Business management platform developed in Brazil.", points: ["Sales and payments recorded", "Inventory updated automatically", "Information in one place", "Results by period", "Multi-company control"] },
  es: { about: "Nosotros", resources: "Recursos", plans: "Planes", login: "Ingresar", start: "Comenzar ahora", eyebrow: "Gestión para pequeños negocios", title: "Controla tu tienda sin depender de", accent: "hojas de cálculo y procesos manuales", intro: "Gevyro reúne ventas, caja, inventario e informes para administrar tu operación en un solo lugar.", note: "Creado para mercados, tiendas y comercios que necesitan trabajar con más organización.", trial: "Probar gratis", routine: "Un sistema para tu rutina", why: "¿Por qué usar", problem: "Los controles separados dificultan la conciliación de caja, esconden pérdidas de inventario y retrasan decisiones.", solution: "Gevyro organiza la operación para que cada venta genere información útil para el negocio.", conclusion: "Menos tiempo revisando controles. Más claridad para cuidar tu tienda.", results: "Resultados diarios", helps: "Cómo Gevyro ayuda a", business: "tu negocio", essential: "Lo esencial para que la operación", nonstop: "no se detenga", choose: "Elige el plan para", operation: "tu operación", recommended: "Recomendado", choosePlan: "Elegir plan", questions: "Preguntas", frequent: "frecuentes", organize: "Comienza a organizar", store: "tu tienda", test: "Prueba Gevyro y descubre la rutina del sistema.", create: "Crear mi cuenta", service: "Atención", how: "Cómo usar", contact: "Contáctanos", client: "Área del cliente", transparency: "Transparencia", terms: "Términos de uso", privacy: "Política de privacidad", support: "Soporte", rights: "Todos los derechos reservados.", made: "Plataforma de gestión desarrollada en Brasil.", points: ["Ventas y pagos registrados", "Inventario actualizado automáticamente", "Información centralizada", "Resultados por período", "Control de varias empresas"] },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.gevyro.com.br/#organization",
      name: "Gevyro",
      url: "https://www.gevyro.com.br/",
      logo: "https://www.gevyro.com.br/images/gevyro-logo-400.webp",
      description: "Software de gestão empresarial para vendas, estoque, clientes, caixa e resultados.",
      slogan: "Gestão em evolução.",
    },
    {
      "@type": "WebSite",
      "@id": "https://www.gevyro.com.br/#website",
      url: "https://www.gevyro.com.br/",
      name: "Gevyro",
      description: "Software de gestão empresarial para organizar a operação de pequenos negócios.",
      inLanguage: "pt-BR",
      publisher: { "@id": "https://www.gevyro.com.br/#organization" },
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://www.gevyro.com.br/#software",
      name: "Gevyro",
      url: "https://www.gevyro.com.br/",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: "Plataforma de gestão empresarial para vendas, produtos, estoque, clientes, caixa e relatórios.",
      provider: { "@id": "https://www.gevyro.com.br/#organization" },
      inLanguage: "pt-BR",
    },
  ],
};

const benefits = [
  { icon: ShoppingCart, title: "Vendas mais rápidas", text: "Registre produtos, pagamentos, descontos e troco no mesmo fluxo." },
  { icon: Boxes, title: "Estoque atualizado", text: "Cada venda dá baixa nos produtos e mantém as quantidades organizadas." },
  { icon: Wallet, title: "Caixa sob controle", text: "Acompanhe abertura, movimentações e fechamento sem controles paralelos." },
  { icon: BarChart3, title: "Números mais claros", text: "Consulte receita, lucro, ticket médio e formas de pagamento." },
  { icon: Building2, title: "Uma ou várias lojas", text: "Separe empresas, caixas e estoques usando uma única conta." },
  { icon: ReceiptText, title: "Tudo em um só lugar", text: "Centralize vendas, produtos, clientes e fornecedores sem controles separados." },
];

const areas = [
  { label: "Vendas", icon: ReceiptText, title: "Venda e receba sem interromper o atendimento", text: "O caixa reúne produtos, descontos, pagamentos e emissão de cupom em uma tela direta.", image: "/images/landing/gevyro-feature-vendas.avif", imageAlt: "Visão geral de vendas e indicadores no painel da Gevyro" },
  { label: "Estoque", icon: Boxes, title: "Saiba o que entrou, saiu e precisa ser reposto", text: "Cadastre produtos, acompanhe quantidades e receba alertas antes que um item acabe.", image: "/images/landing/gevyro-feature-estoque.avif", imageAlt: "Tela de movimentações e vendas da operação no sistema Gevyro" },
  { label: "Relatórios", icon: BarChart3, title: "Entenda o resultado sem montar planilhas", text: "Visualize vendas, lucro, ticket médio, produtos e pagamentos por período.", image: "/images/landing/gevyro-feature-relatorios.avif", imageAlt: "Relatórios de vendas, pagamentos e desempenho no sistema Gevyro" },
];

const plans = [
  { name: "Experimental", period: "30 dias", limits: "1 empresa e 1 caixa", features: ["Frente de caixa", "Estoque", "Resumo do negócio"] },
  { name: "Básico", period: "Mensal", limits: "1 empresa e 1 caixa", features: ["Recursos essenciais", "Relatórios", "Clientes e fornecedores"] },
  { name: "Pro", period: "Mensal", limits: "Até 5 empresas e 5 caixas", features: ["Operação multiempresa", "Mais caixas", "Exportação de relatórios"], featured: true },
  { name: "Premium", period: "Mensal", limits: "Empresas e caixas ilimitados", features: ["Todos os recursos", "Unidades sem limite", "Integrações com Shopee e Mercado Livre"] },
];

const faqs = [
  { q: "Preciso entender de sistemas para usar o Gevyro?", a: "Não. As telas foram organizadas para a rotina de pequenos negócios e podem ser usadas desde o primeiro acesso." },
  { q: "Posso gerenciar mais de uma empresa?", a: "Sim. Os planos compatíveis permitem separar empresas, caixas, estoques e resultados na mesma conta." },
  { q: "O estoque muda quando uma venda é registrada?", a: "Sim. Os itens vendidos são descontados automaticamente e voltam ao estoque quando uma venda é cancelada." },
  { q: "Consigo acessar pelo celular?", a: "Sim. O Gevyro funciona pela internet e pode ser acessado pelo computador, tablet ou celular." },
];

const translatedData = {
  en: {
    benefits: [
      { icon: ShoppingCart, title: "Faster sales", text: "Record products, payments, discounts and change in one flow." }, { icon: Boxes, title: "Updated inventory", text: "Every sale deducts items and keeps quantities organized." }, { icon: Wallet, title: "Cash under control", text: "Track opening, movements and closing without parallel controls." }, { icon: BarChart3, title: "Clearer numbers", text: "Review revenue, profit, average ticket and payment methods." }, { icon: Building2, title: "One or multiple stores", text: "Separate companies, registers and inventory under one account." }, { icon: ReceiptText, title: "Everything in one place", text: "Centralize sales, products, customers and suppliers." },
    ],
    areas: [
      { ...areas[0], label: "Sales", title: "Sell and collect without interrupting service", text: "The register combines products, discounts, payments and receipts in one direct screen." }, { ...areas[1], label: "Inventory", title: "Know what came in, went out and needs restocking", text: "Register products, track quantities and receive alerts before an item runs out." }, { ...areas[2], label: "Reports", title: "Understand results without building spreadsheets", text: "Review sales, profit, average ticket, products and payments by period." },
    ],
    plans: [
      { ...plans[0], period: "30 days", limits: "1 company and 1 register", features: ["Point of sale", "Inventory", "Business overview"] }, { ...plans[1], name: "Basic", period: "Monthly", limits: "1 company and 1 register", features: ["Essential features", "Reports", "Customers and suppliers"] }, { ...plans[2], period: "Monthly", limits: "Up to 5 companies and 5 registers", features: ["Multi-company operation", "More registers", "Report exports"] }, { ...plans[3], period: "Monthly", limits: "Unlimited companies and registers", features: ["All features", "Unlimited locations", "Shopee and Mercado Livre integrations"] },
    ],
    faqs: [
      { q: "Do I need technical knowledge to use Gevyro?", a: "No. The screens follow the routine of small businesses and can be used from the first access." }, { q: "Can I manage more than one company?", a: "Yes. Compatible plans keep companies, registers, inventory and results separate in one account." }, { q: "Does inventory change after a sale?", a: "Yes. Sold items are deducted automatically and returned when a sale is cancelled." }, { q: "Can I access it on mobile?", a: "Yes. Gevyro works online on computers, tablets and mobile phones." },
    ],
  },
  es: {
    benefits: [
      { icon: ShoppingCart, title: "Ventas más rápidas", text: "Registra productos, pagos, descuentos y cambio en un solo flujo." }, { icon: Boxes, title: "Inventario actualizado", text: "Cada venta descuenta artículos y mantiene las cantidades organizadas." }, { icon: Wallet, title: "Caja bajo control", text: "Controla apertura, movimientos y cierre sin controles paralelos." }, { icon: BarChart3, title: "Números más claros", text: "Consulta ingresos, ganancia, ticket medio y formas de pago." }, { icon: Building2, title: "Una o varias tiendas", text: "Separa empresas, cajas e inventarios con una sola cuenta." }, { icon: ReceiptText, title: "Todo en un solo lugar", text: "Centraliza ventas, productos, clientes y proveedores." },
    ],
    areas: [
      { ...areas[0], label: "Ventas", title: "Vende y cobra sin interrumpir la atención", text: "La caja reúne productos, descuentos, pagos y recibos en una pantalla directa." }, { ...areas[1], label: "Inventario", title: "Conoce qué entró, salió y necesita reposición", text: "Registra productos, controla cantidades y recibe alertas antes de que se agoten." }, { ...areas[2], label: "Informes", title: "Entiende los resultados sin crear hojas de cálculo", text: "Consulta ventas, ganancia, ticket medio, productos y pagos por período." },
    ],
    plans: [
      { ...plans[0], period: "30 días", limits: "1 empresa y 1 caja", features: ["Punto de venta", "Inventario", "Resumen del negocio"] }, { ...plans[1], name: "Básico", period: "Mensual", limits: "1 empresa y 1 caja", features: ["Recursos esenciales", "Informes", "Clientes y proveedores"] }, { ...plans[2], period: "Mensual", limits: "Hasta 5 empresas y 5 cajas", features: ["Operación multiempresa", "Más cajas", "Exportación de informes"] }, { ...plans[3], period: "Mensual", limits: "Empresas y cajas ilimitadas", features: ["Todos los recursos", "Sucursales ilimitadas", "Integraciones con Shopee y Mercado Livre"] },
    ],
    faqs: [
      { q: "¿Necesito conocimientos técnicos para usar Gevyro?", a: "No. Las pantallas siguen la rutina de pequeños negocios y pueden usarse desde el primer acceso." }, { q: "¿Puedo administrar más de una empresa?", a: "Sí. Los planes compatibles separan empresas, cajas, inventarios y resultados en una cuenta." }, { q: "¿El inventario cambia al registrar una venta?", a: "Sí. Los artículos se descuentan automáticamente y regresan cuando se cancela la venta." }, { q: "¿Puedo acceder desde el móvil?", a: "Sí. Gevyro funciona por internet en computadoras, tabletas y móviles." },
    ],
  },
};

function Header() {
  const [open, setOpen] = useState(false);
  const { language } = useLanguage();
  const c = landingCopy[language];
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[74px] max-w-6xl items-center justify-between px-5 lg:px-0">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/images/gevyro-logo-400.webp" alt="Gevyro" width={400} height={145} priority className="h-auto w-[200px] object-contain" />
        </Link>
        <nav className="hidden items-center gap-8 text-[13px] text-[#27302b] md:flex">
          <a href="#sobre" className="hover:text-[#238a52]">{c.about}</a><a href="#recursos" className="hover:text-[#238a52]">{c.resources}</a><a href="#planos" className="hover:text-[#238a52]">{c.plans}</a><a href="#faq" className="hover:text-[#238a52]">FAQ</a><Link href="/auth/login" className="hover:text-[#238a52]">{c.login}</Link>
          <LanguageSelector />
          <Link href="/auth/cadastro" className="rounded-full bg-[#258c53] px-6 py-3 text-[11px] font-bold uppercase tracking-[.1em] text-white hover:bg-[#1d7544]">{c.start}</Link>
        </nav>
        <button type="button" onClick={() => setOpen(!open)} className="text-[#27302b] md:hidden" aria-label="Abrir menu">{open ? <X /> : <Menu />}</button>
      </div>
      {open && <nav className="border-t border-zinc-100 bg-white px-5 py-6 md:hidden"><div className="mx-auto flex max-w-6xl flex-col gap-5 text-sm text-[#27302b]"><a href="#sobre" onClick={() => setOpen(false)}>{c.about}</a><a href="#recursos" onClick={() => setOpen(false)}>{c.resources}</a><a href="#planos" onClick={() => setOpen(false)}>{c.plans}</a><a href="#faq" onClick={() => setOpen(false)}>FAQ</a><LanguageSelector /><Link href="/auth/cadastro" className="mt-2 rounded-full bg-[#258c53] px-6 py-3 text-center font-bold text-white">{c.start}</Link></div></nav>}
    </header>
  );
}

function Hero() {
  const { language } = useLanguage();
  const c = landingCopy[language];
  return (
    <section className="bg-white">
      <div className="mx-auto grid min-h-[calc(100svh-74px)] max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-[.9fr_1.1fr] lg:px-0 lg:py-20">
        <div className="max-w-xl">
          <p className="mb-5 text-[11px] font-bold uppercase tracking-[.14em] text-[#258c53]">{c.eyebrow}</p>
          <h1 className="text-[46px] font-light leading-[1.08] tracking-[-.04em] text-[#343b37] sm:text-[60px]">{c.title}<span className="block font-normal italic text-[#258c53]">{c.accent}</span></h1>
          <p className="mt-7 max-w-lg text-[16px] leading-7 text-[#3e4842]">{c.intro}</p>
          <p className="mt-4 max-w-lg text-[13px] italic leading-6 text-[#718078]">{c.note}</p>
          <Link href="/auth/cadastro" className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#258c53] px-7 py-4 text-[12px] font-bold uppercase tracking-[.1em] text-white hover:bg-[#1d7544]">{c.trial} <ArrowRight size={16} /></Link>
        </div>
        <div className="relative mx-auto w-full max-w-[620px] overflow-hidden rounded-md bg-[#eef4f0]"><div className="relative aspect-[4/3]"><Image src="/images/landing/gestpro-sales-checkout.avif" alt="Gevyro sendo usado no caixa de uma loja" fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 55vw" /></div></div>
      </div>
    </section>
  );
}

function About() {
  const { language } = useLanguage(); const c = landingCopy[language]; const points = c.points;
  return (
    <section id="sobre" className="bg-white py-24 sm:py-32"><div className="mx-auto max-w-6xl px-5 lg:px-0">
      <p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#258c53]">{c.routine}</p><h2 className="mt-4 max-w-xl text-4xl font-light leading-tight text-[#343b37] sm:text-5xl">{c.why} <span className="italic text-[#258c53]">Gevyro?</span></h2>
      <div className="mt-16 grid gap-14 lg:grid-cols-2"><div className="max-w-lg space-y-6 text-[16px] leading-8 text-[#46514b]"><p>{c.problem}</p><p>{c.solution}</p></div><ul className="space-y-5">{points.map((point) => <li key={point} className="flex items-center gap-4 text-[15px] text-[#46514b]"><Check size={18} className="text-[#258c53]" />{point}</li>)}</ul></div>
      <p className="mt-16 max-w-2xl border-t border-zinc-200 pt-8 text-[16px] leading-7 text-[#343b37]">{c.conclusion}</p>
    </div></section>
  );
}

function ValueSection() {
  const { language } = useLanguage(); const c = landingCopy[language]; const items = language === "pt" ? benefits : translatedData[language].benefits;
  return (
    <section className="bg-[#303a35] py-24 text-white sm:py-32"><div className="mx-auto max-w-6xl px-5 lg:px-0">
      <p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#78d6a3]">{c.results}</p><h2 className="mt-4 max-w-2xl text-4xl font-light leading-tight sm:text-5xl">{c.helps} <span className="italic text-[#78d6a3]">{c.business}</span></h2>
      <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{items.map((item) => <article key={item.title} className="min-h-48 rounded-2xl border border-white/15 p-7"><item.icon size={25} strokeWidth={1.6} className="text-[#78d6a3]" /><h3 className="mt-6 text-[16px] font-semibold">{item.title}</h3><p className="mt-3 text-[13px] leading-6 text-zinc-300">{item.text}</p></article>)}</div>
    </div></section>
  );
}

function Resources() {
  const { language } = useLanguage(); const c = landingCopy[language]; const items = language === "pt" ? areas : translatedData[language].areas; const [active, setActive] = useState(0); const area = items[active];
  return (
    <section id="recursos" className="bg-white py-24 sm:py-32"><div className="mx-auto max-w-6xl px-5 lg:px-0">
      <h2 className="max-w-md text-4xl font-light leading-tight text-[#343b37] sm:text-5xl">{c.essential} <span className="italic text-[#258c53]">{c.nonstop}</span></h2>
      <div className="mt-14 grid items-center gap-12 lg:grid-cols-[.7fr_1.3fr]"><div className="space-y-1 border-y border-zinc-200 py-2">{items.map((item, index) => <button key={item.label} type="button" onClick={() => setActive(index)} className={`flex w-full items-center justify-between border-b border-zinc-100 px-2 py-5 text-left text-[15px] last:border-0 ${active === index ? "font-semibold text-[#258c53]" : "text-[#4b5650]"}`}>{item.label}<span className="text-xl font-light">{active === index ? "−" : "+"}</span></button>)}</div>
        <div className="bg-[#f3f6f4] p-6 sm:p-10"><div className="relative aspect-[16/10] overflow-hidden bg-white"><Image key={area.image} src={area.image} alt={area.imageAlt} fill className="object-contain object-center" sizes="(max-width: 1024px) 100vw, 60vw" /></div><div className="mx-auto max-w-xl pt-8 text-center"><area.icon className="mx-auto text-[#258c53]" /><h3 className="mt-4 text-xl font-semibold text-[#2f3833]">{area.title}</h3><p className="mt-3 text-sm leading-6 text-[#6a7770]">{area.text}</p></div></div>
      </div>
    </div></section>
  );
}

function PlansLegacy() {
  const { language } = useLanguage(); const c = landingCopy[language]; const items = language === "pt" ? plans : translatedData[language].plans;
  return (
    <section id="planos" className="bg-[#303a35] py-24 text-white sm:py-32"><div className="mx-auto max-w-6xl px-5 lg:px-0">
      <div className="text-center"><p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#78d6a3]">{c.plans}</p><h2 className="mt-4 text-4xl font-light sm:text-5xl">{c.choose} <span className="italic text-[#78d6a3]">{c.operation}</span></h2></div>
      <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">{plans.map((plan) => <article key={plan.name} className={`flex min-h-[380px] flex-col rounded-2xl border p-7 ${plan.featured ? "border-[#78d6a3] bg-white text-[#2f3833]" : "border-white/15"}`}><div className="flex items-center justify-between"><h3 className="text-2xl font-semibold">{plan.name}</h3>{plan.featured && <span className="text-[9px] font-bold uppercase tracking-wider text-[#258c53]">Recomendado</span>}</div><p className={`mt-4 text-sm ${plan.featured ? "text-[#66736c]" : "text-zinc-300"}`}>{plan.period}</p><p className={`mt-2 text-[13px] ${plan.featured ? "text-[#66736c]" : "text-zinc-400"}`}>{plan.limits}</p><ul className="mt-8 flex-1 space-y-4">{plan.features.map((feature) => <li key={feature} className="flex gap-3 text-[13px]"><Check size={16} className="shrink-0 text-[#78d6a3]" />{feature}</li>)}</ul><Link href="/auth/cadastro" className={`mt-8 rounded-full px-5 py-3 text-center text-[11px] font-bold uppercase tracking-wider ${plan.featured ? "bg-[#258c53] text-white" : "border border-white/30 hover:border-[#78d6a3]"}`}>Escolher plano</Link></article>)}</div>
    </div></section>
  );
}

function FAQLegacy() {
  const [open, setOpen] = useState(-1);
  return (
    <section id="faq" className="bg-white py-24 sm:py-32"><div className="mx-auto max-w-6xl px-5 lg:px-0"><h2 className="text-4xl font-light text-[#343b37] sm:text-5xl">Perguntas <span className="italic text-[#258c53]">frequentes</span></h2><div className="mt-16">{faqs.map((item, index) => <div key={item.q} className="border-b border-zinc-200"><button type="button" onClick={() => setOpen(open === index ? -1 : index)} className="flex w-full items-center justify-between gap-6 py-6 text-left text-[15px] font-semibold text-[#343b37]">{item.q}<ChevronDown size={18} className={`shrink-0 text-[#258c53] transition-transform ${open === index ? "rotate-180" : ""}`} /></button>{open === index && <p className="max-w-3xl pb-6 text-sm leading-7 text-[#66736c]">{item.a}</p>}</div>)}</div></div></section>
  );
}

function FooterLegacy() {
  return <><section className="bg-[#303a35] py-20 text-white"><div className="mx-auto flex max-w-6xl flex-col justify-between gap-8 px-5 md:flex-row md:items-center lg:px-0"><div><h2 className="text-4xl font-light">Comece a organizar <span className="italic text-[#78d6a3]">sua loja</span></h2><p className="mt-4 text-sm text-zinc-300">Teste o Gevyro e conheça a rotina do sistema.</p></div><Link href="/auth/cadastro" className="inline-flex items-center justify-center gap-3 rounded-full bg-[#78d6a3] px-7 py-4 text-[11px] font-bold uppercase tracking-wider text-[#173323]">Criar minha conta <ArrowRight size={16} /></Link></div></section><footer className="bg-white py-14 text-[#3f4944]"><div className="mx-auto grid max-w-6xl gap-10 px-5 sm:grid-cols-3 lg:px-0"><div><Image src="/images/gevyro-logo-400.webp" alt="Gevyro" width={400} height={145} className="h-auto w-[200px] object-contain" /><p className="mt-4 text-sm text-[#718078]">Gestão em evolução.</p><p className="mt-3 text-xs text-[#8a958f]">CNPJ 68.259.534/0001-70</p></div><div><h3 className="font-semibold">Atendimento</h3><div className="mt-4 flex flex-col gap-3 text-sm text-[#718078]"><Link href="/como-usar">Como usar</Link><Link href="/contato">Fale conosco</Link><Link href="/auth/login">Área do cliente</Link></div></div><div><h3 className="font-semibold">Transparência</h3><div className="mt-4 flex flex-col gap-3 text-sm text-[#718078]"><Link href="/termos">Termos de uso</Link><Link href="/privacidade">Política de privacidade</Link><Link href="/contato">Suporte</Link></div></div></div><div className="mx-auto mt-12 flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-zinc-200 px-5 pt-6 text-xs text-[#8a958f] sm:flex-row lg:px-0"><span>© 2026 Gevyro. Todos os direitos reservados.</span><span>Plataforma de gestão desenvolvida no Brasil.</span></div></footer></>;
}

function PlansSection() {
  const { language } = useLanguage(); const c = landingCopy[language]; const items = language === "pt" ? plans : translatedData[language].plans;
  return <section id="planos" className="bg-[#303a35] py-24 text-white sm:py-32"><div className="mx-auto max-w-6xl px-5 lg:px-0"><div className="text-center"><p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#78d6a3]">{c.plans}</p><h2 className="mt-4 text-4xl font-light sm:text-5xl">{c.choose} <span className="italic text-[#78d6a3]">{c.operation}</span></h2></div><div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">{items.map(plan=><article key={plan.name} className={`flex min-h-[380px] flex-col rounded-2xl border p-7 ${plan.featured?"border-[#78d6a3] bg-white text-[#2f3833]":"border-white/15"}`}><div className="flex items-center justify-between"><h3 className="text-2xl font-semibold">{plan.name}</h3>{plan.featured&&<span className="text-[9px] font-bold uppercase tracking-wider text-[#258c53]">{c.recommended}</span>}</div><p className="mt-4 text-sm opacity-75">{plan.period}</p><p className="mt-2 text-[13px] opacity-70">{plan.limits}</p><ul className="mt-8 flex-1 space-y-4">{plan.features.map(feature=><li key={feature} className="flex gap-3 text-[13px]"><Check size={16} className="shrink-0 text-[#78d6a3]"/>{feature}</li>)}</ul><Link href="/auth/cadastro" className={`mt-8 rounded-full px-5 py-3 text-center text-[11px] font-bold uppercase tracking-wider ${plan.featured?"bg-[#258c53] text-white":"border border-white/30"}`}>{c.choosePlan}</Link></article>)}</div></div></section>;
}

function FAQSection() {
  const { language } = useLanguage(); const c = landingCopy[language]; const items = language === "pt" ? faqs : translatedData[language].faqs; const [open,setOpen]=useState(-1);
  return <section id="faq" className="bg-white py-24 sm:py-32"><div className="mx-auto max-w-6xl px-5 lg:px-0"><h2 className="text-4xl font-light text-[#343b37] sm:text-5xl">{c.questions} <span className="italic text-[#258c53]">{c.frequent}</span></h2><div className="mt-16">{items.map((item,index)=><div key={item.q} className="border-b border-zinc-200"><button type="button" onClick={()=>setOpen(open===index?-1:index)} className="flex w-full items-center justify-between gap-6 py-6 text-left text-[15px] font-semibold text-[#343b37]">{item.q}<ChevronDown size={18} className={`shrink-0 text-[#258c53] transition-transform ${open===index?"rotate-180":""}`}/></button>{open===index&&<p className="max-w-3xl pb-6 text-sm leading-7 text-[#66736c]">{item.a}</p>}</div>)}</div></div></section>;
}

function LocalizedFooter() {
  const { language } = useLanguage(); const c=landingCopy[language];
  return <><section className="bg-[#303a35] py-20 text-white"><div className="mx-auto flex max-w-6xl flex-col justify-between gap-8 px-5 md:flex-row md:items-center lg:px-0"><div><h2 className="text-4xl font-light">{c.organize} <span className="italic text-[#78d6a3]">{c.store}</span></h2><p className="mt-4 text-sm text-zinc-300">{c.test}</p></div><Link href="/auth/cadastro" className="rounded-full bg-[#78d6a3] px-7 py-4 text-[11px] font-bold uppercase text-[#173323]">{c.create}</Link></div></section><footer className="bg-white py-14 text-[#3f4944]"><div className="mx-auto grid max-w-6xl gap-10 px-5 sm:grid-cols-3 lg:px-0"><div><Image src="/images/gevyro-logo-400.webp" alt="Gevyro" width={400} height={145} className="h-auto w-[200px]"/><p className="mt-4 text-sm text-[#718078]">Gestão em evolução.</p><p className="mt-3 text-xs text-[#8a958f]">CNPJ 68.259.534/0001-70</p></div><div><h3 className="font-semibold">{c.service}</h3><div className="mt-4 flex flex-col gap-3 text-sm text-[#718078]"><Link href="/como-usar">{c.how}</Link><Link href="/contato">{c.contact}</Link><Link href="/auth/login">{c.client}</Link></div></div><div><h3 className="font-semibold">{c.transparency}</h3><div className="mt-4 flex flex-col gap-3 text-sm text-[#718078]"><Link href="/termos">{c.terms}</Link><Link href="/privacidade">{c.privacy}</Link><Link href="/contato">{c.support}</Link></div></div></div><div className="mx-auto mt-12 flex max-w-6xl flex-col justify-between gap-3 border-t border-zinc-200 px-5 pt-6 text-xs text-[#8a958f] sm:flex-row lg:px-0"><span>© 2026 Gevyro. {c.rights}</span><span>{c.made}</span></div></footer></>;
}

export default function Home() {
  return <div className="min-h-screen bg-white font-sans"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} /><Header /><main><Hero /><About /><ValueSection /><Resources /><PlansSection /><FAQSection /></main><LocalizedFooter /><WhatsAppFloat /></div>;
}
