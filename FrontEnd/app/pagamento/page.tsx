"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Check, CreditCard, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { criarCheckout, PLANOS_PAGOS, type PlanoPagoId } from "@/lib/billing";
import { getUsuario } from "@/lib/api-v2";

function PagamentoInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planoUrl = searchParams.get("plano")?.toUpperCase();
  const planoInicial = PLANOS_PAGOS.some((plano) => plano.id === planoUrl) ? planoUrl as PlanoPagoId : "PRO";
  const [selecionado, setSelecionado] = useState<PlanoPagoId>(planoInicial);
  const [email, setEmail] = useState("");
  const [verificandoSessao, setVerificandoSessao] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState("");
  const cancelado = searchParams.get("canceled") === "true";

  useEffect(() => {
    if (searchParams.has("token")) globalThis.window.history.replaceState({}, "", "/pagamento");
    getUsuario()
      .then((usuario) => setEmail(usuario.email))
      .catch(() => router.replace("/auth/login"))
      .finally(() => setVerificandoSessao(false));
  }, [router, searchParams]);
  const plano = PLANOS_PAGOS.find((item) => item.id === selecionado)!;

  async function assinar() {
    setErro("");
    setProcessando(true);
    try {
      const url = await criarCheckout(selecionado);
      window.location.assign(url);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível iniciar o pagamento.");
      setProcessando(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f8f7] text-[#303a35]">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-[74px] max-w-6xl items-center justify-between px-5 lg:px-0">
          <Link href="/" className="flex items-center"><Image src="/images/gevyro-logo-400.webp" alt="Gevyro" width={400} height={145} priority className="h-auto w-[200px] object-contain" /></Link>
          <span className="flex items-center gap-2 text-xs text-[#718078]"><LockKeyhole size={14} className="text-[#258c53]" /> Ambiente seguro</span>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[1fr_380px] lg:px-0 lg:py-14">
        <section>
          <p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#258c53]">Continue usando o Gevyro</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-light tracking-[-.04em] sm:text-5xl">Escolha o plano ideal para a <span className="italic text-[#258c53]">sua operação</span></h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-[#718078]">Seu acesso está aguardando a renovação. Selecione um plano e conclua a assinatura com segurança.</p>
          {cancelado && <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">Pagamento cancelado. Nenhuma cobrança foi realizada; escolha um plano quando estiver pronto.</p>}
          {erro && <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{erro}</p>}

          <div className="mt-9 grid gap-4 sm:grid-cols-3">
            {PLANOS_PAGOS.map((item) => {
              const ativo = item.id === selecionado;
              return (
                <button key={item.id} type="button" onClick={() => { setSelecionado(item.id); setErro(""); }} className={`relative min-h-48 rounded-2xl border bg-white p-5 text-left transition ${ativo ? "border-[#258c53] ring-4 ring-[#258c53]/10" : "border-zinc-200 hover:border-[#258c53]/40"}`}>
                  {item.destaque && <span className="absolute right-4 top-4 rounded-full bg-[#e7f6ed] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#258c53]">Mais escolhido</span>}
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${ativo ? "border-[#258c53] bg-[#258c53]" : "border-zinc-300"}`}>{ativo && <Check size={12} className="text-white" />}</span>
                  <h2 className="mt-7 text-xl font-semibold">{item.nome}</h2><p className="mt-1 text-xs text-[#718078]">{item.descricao}</p>
                  <p className="mt-5 text-2xl font-bold text-[#258c53]">R$ {item.preco}<span className="text-xs font-normal text-[#718078]">/mês</span></p>
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6">
            <h2 className="text-sm font-semibold">Incluído no plano {plano.nome}</h2>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">{plano.recursos.map((recurso) => <li key={recurso} className="flex items-center gap-3 text-sm text-[#59665f]"><Check size={16} className="shrink-0 text-[#258c53]" />{recurso}</li>)}</ul>
          </div>
        </section>

        <aside className="h-fit rounded-2xl bg-[#303a35] p-7 text-white lg:sticky lg:top-8">
          <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#78d6a3]">Resumo da assinatura</p>
          <div className="mt-6 flex items-start justify-between border-b border-white/10 pb-6"><div><h2 className="text-xl font-semibold">Plano {plano.nome}</h2><p className="mt-1 text-xs text-zinc-400">Cobrança mensal recorrente</p></div><p className="text-xl font-bold">R$ {plano.preco}</p></div>
          <div className="flex items-center justify-between py-6"><span className="text-sm text-zinc-300">Total hoje</span><span className="text-2xl font-bold text-[#78d6a3]">R$ {plano.preco}</span></div>
          {!email && <div className="mb-5 rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-xs leading-5 text-amber-100">Sua sessão não contém um e-mail válido. Entre novamente para continuar.</div>}
          {email && <p className="mb-5 truncate rounded-xl bg-white/5 px-3 py-2.5 text-xs text-zinc-300" title={email}>Assinatura para <strong className="text-white">{email}</strong></p>}
          <button type="button" onClick={assinar} disabled={processando || verificandoSessao || !email} className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#78d6a3] text-sm font-bold text-[#173323] hover:bg-[#8be0b1] disabled:cursor-not-allowed disabled:opacity-60">
            {processando ? <><Loader2 size={17} className="animate-spin" /> Abrindo checkout...</> : verificandoSessao ? <><Loader2 size={17} className="animate-spin" /> Verificando sessão...</> : <><CreditCard size={17} /> Assinar agora <ArrowRight size={16} /></>}
          </button>
          <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-zinc-400"><ShieldCheck size={14} className="text-[#78d6a3]" /> Pagamento protegido pela Stripe</div>
          <p className="mt-3 text-center text-[10px] leading-4 text-zinc-400">Assinatura mensal recorrente de R$ {plano.preco}. A primeira cobrança ocorre ao concluir o checkout da Stripe. A renovação continua até o cancelamento, conforme as condições exibidas antes da confirmação.</p>
          <p className="mt-3 text-center text-[10px] leading-4 text-zinc-500">Ao continuar, você concorda com os <Link href="/termos" className="underline hover:text-zinc-300">Termos de Uso</Link>, a <Link href="/privacidade" className="underline hover:text-zinc-300">Política de Privacidade</Link> e as <Link href="/cancelamento-reembolsos" className="underline hover:text-zinc-300">condições de cancelamento</Link>.</p>
        </aside>
      </div>
      <footer className="border-t border-zinc-200 bg-white px-5 py-6 text-center text-[11px] leading-5 text-[#8a958f]">
        © 2026 Gevyro · CNPJ 68.259.534/0001-70 · <Link href="/termos" className="underline">Termos</Link> · <Link href="/privacidade" className="underline">Privacidade</Link> · <Link href="/cancelamento-reembolsos" className="underline">Cancelamento</Link>
      </footer>
    </main>
  );
}

export default function PagamentoPage() {
  return <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-[#f6f8f7] text-sm text-[#718078]"><Loader2 className="mr-2 animate-spin" size={18} /> Carregando planos...</main>}><PagamentoInner /></Suspense>;
}
