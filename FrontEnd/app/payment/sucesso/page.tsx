"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { API_BASE_URL } from "@/lib/api-v2";
import { PLANOS_PAGOS } from "@/lib/billing";

function SucessoInner() {
  const sessionId = useSearchParams().get("session_id");
  const [planoId, setPlanoId] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!sessionId) { setErro("Sessão de pagamento não informada."); return; }
    const controller = new AbortController();
    fetch(`${API_BASE_URL}/api/payments/session-info?sessionId=${encodeURIComponent(sessionId)}`, { credentials: "include", signal: controller.signal })
      .then(async (response) => {
        const data = await response.json().catch(() => null);
        if (!response.ok) throw new Error(data?.error ?? "Não foi possível confirmar esta sessão.");
        setPlanoId(data.plano ?? "");
      })
      .catch((error) => { if (error?.name !== "AbortError") setErro(error instanceof Error ? error.message : "Não foi possível confirmar o pagamento."); });
    return () => controller.abort();
  }, [sessionId]);

  const plano = PLANOS_PAGOS.find((item) => item.id === planoId);
  const carregando = Boolean(sessionId && !plano && !erro);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f8f7] px-5 py-12 text-[#303a35]">
      <section className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-7 text-center shadow-[0_24px_70px_rgba(30,60,45,.08)] sm:p-10">
        <Link href="/" className="mx-auto inline-flex items-center"><Image src="/images/gevyro-logo-400.webp" alt="Gevyro" width={400} height={145} priority className="h-auto w-[200px] object-contain" /></Link>
        {carregando && <div className="py-16"><Loader2 size={34} className="mx-auto animate-spin text-[#258c53]" /><h1 className="mt-6 text-2xl font-semibold">Confirmando pagamento</h1><p className="mt-2 text-sm text-[#718078]">Aguarde enquanto validamos sua assinatura com a Stripe.</p></div>}
        {erro && <div className="py-12"><span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500"><AlertCircle size={30} /></span><h1 className="mt-6 text-2xl font-semibold">Não foi possível confirmar</h1><p className="mt-3 text-sm leading-6 text-[#718078]">{erro}</p><Link href="/pagamento" className="mt-7 flex h-[50px] items-center justify-center gap-2 rounded-full bg-[#258c53] text-sm font-bold text-white">Voltar aos planos <ArrowRight size={16} /></Link></div>}
        {plano && <div className="pt-10"><span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#258c53]/10 text-[#258c53]"><CheckCircle2 size={40} /></span><p className="mt-7 text-[10px] font-bold uppercase tracking-[.14em] text-[#258c53]">Pagamento confirmado</p><h1 className="mt-3 text-4xl font-light tracking-[-.04em]">Plano <span className="italic text-[#258c53]">{plano.nome}</span> ativado</h1><p className="mt-4 text-sm leading-7 text-[#718078]">Sua assinatura foi confirmada. O backend concluirá a ativação automaticamente pelo webhook da Stripe.</p><Link href="/dashboard?payment=success" className="mt-8 flex h-[52px] items-center justify-center gap-2 rounded-full bg-[#258c53] text-sm font-bold text-white hover:bg-[#1d7544]">Ir para o dashboard <ArrowRight size={17} /></Link><p className="mt-5 flex items-center justify-center gap-2 text-xs text-[#8a958f]"><ShieldCheck size={14} /> Transação processada com segurança</p></div>}
        <p className="mt-8 border-t border-zinc-100 pt-5 text-[10px] text-[#9aa49f]">Gevyro · CNPJ 68.259.534/0001-70</p>
      </section>
    </main>
  );
}

export default function PagamentoSucessoPage() {
  return <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-[#f6f8f7]"><Loader2 className="animate-spin text-[#258c53]" /></main>}><SucessoInner /></Suspense>;
}
