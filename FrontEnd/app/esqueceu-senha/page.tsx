"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, KeyRound, Loader2, Mail } from "lucide-react";
import { API_BASE_URL, obterCsrfToken } from "@/lib/api-v2";

async function mensagemErro(response: Response, fallback: string) {
  const data = await response.json().catch(() => null);
  return data?.mensagem ?? data?.erro ?? fallback;
}

export default function EsqueceuSenhaPage() {
  const [etapa, setEtapa] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [contador, setContador] = useState(0);

  useEffect(() => {
    if (!contador) return;
    const timer = window.setInterval(() => setContador((valor) => Math.max(0, valor - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [contador]);

  async function enviarCodigo(event?: React.FormEvent) {
    event?.preventDefault();
    if (!email.trim()) return setErro("Informe o e-mail da sua conta.");
    setCarregando(true); setErro("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/esqueceu-senha`, { method: "POST", headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": await obterCsrfToken() }, credentials: "include", body: JSON.stringify({ email: email.trim().toLowerCase() }) });
      if (!response.ok) throw new Error(await mensagemErro(response, "Não foi possível enviar o código."));
      setEtapa(2); setContador(60);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível conectar ao servidor.");
    } finally { setCarregando(false); }
  }

  async function redefinirSenha(event: React.FormEvent) {
    event.preventDefault();
    if (!/^\d{6}$/.test(codigo)) return setErro("Digite o código de 6 dígitos recebido por e-mail.");
    if (novaSenha.length < 6 || !/[A-Za-z]/.test(novaSenha) || !/\d/.test(novaSenha)) return setErro("A senha precisa ter ao menos 6 caracteres, com letras e números.");
    if (novaSenha !== confirmacao) return setErro("As senhas não conferem.");
    setCarregando(true); setErro("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/redefinir-senha`, { method: "POST", headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": await obterCsrfToken() }, credentials: "include", body: JSON.stringify({ email: email.trim().toLowerCase(), codigo, novaSenha }) });
      if (!response.ok) throw new Error(await mensagemErro(response, "Código inválido ou expirado."));
      setEtapa(3);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível conectar ao servidor.");
    } finally { setCarregando(false); }
  }

  return (
    <main className="min-h-screen bg-white text-[#343b37] lg:grid lg:grid-cols-[1.05fr_.95fr]">
      <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-16 xl:px-24">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center"><Image src="/images/gevyro-logo.png" alt="Gevyro" width={200} height={72} priority className="h-auto w-[200px] object-contain" /></Link>
          <Link href="/auth/login" className="flex items-center gap-2 text-xs text-[#718078] hover:text-[#258c53]"><ArrowLeft size={15} /> Voltar ao login</Link>
        </header>

        <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center py-12">
          {etapa === 3 ? (
            <div className="text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#258c53]/10 text-[#258c53]"><Check size={30} /></span>
              <h1 className="mt-7 text-4xl font-light tracking-[-.04em]">Senha <span className="italic text-[#258c53]">redefinida</span></h1>
              <p className="mt-4 text-sm leading-7 text-[#718078]">Tudo certo. Você já pode entrar no Gevyro usando sua nova senha.</p>
              <Link href="/auth/login" className="mt-8 flex h-[52px] w-full items-center justify-center gap-3 rounded-full bg-[#258c53] text-sm font-bold text-white hover:bg-[#1d7544]">Ir para o login <ArrowRight size={17} /></Link>
            </div>
          ) : (
            <>
              <p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#258c53]">Recuperação de acesso</p>
              <h1 className="mt-4 text-4xl font-light tracking-[-.04em] sm:text-5xl">{etapa === 1 ? <>Esqueceu sua <span className="italic text-[#258c53]">senha?</span></> : <>Crie uma <span className="italic text-[#258c53]">nova senha</span></>}</h1>
              <p className="mt-4 text-sm leading-6 text-[#718078]">{etapa === 1 ? "Informe o e-mail cadastrado e enviaremos um código de verificação." : <>Enviamos um código para <strong className="font-semibold text-[#343b37]">{email}</strong>.</>}</p>

              <div className="my-8 flex items-center gap-3" aria-label={`Etapa ${etapa} de 2`}>
                {[1, 2].map((numero) => <div key={numero} className="flex flex-1 items-center gap-3"><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${etapa >= numero ? "bg-[#258c53] text-white" : "bg-zinc-100 text-zinc-400"}`}>{etapa > numero ? <Check size={14} /> : numero}</span><span className={`text-xs ${etapa >= numero ? "font-semibold text-[#46514b]" : "text-zinc-400"}`}>{numero === 1 ? "Confirmar e-mail" : "Nova senha"}</span></div>)}
              </div>

              {etapa === 1 ? (
                <form onSubmit={enviarCodigo} className="space-y-5">
                  <label className="block"><span className="mb-2 block text-xs font-semibold text-[#46514b]">E-mail</span><span className="relative block"><Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" /><input type="email" value={email} onChange={(event) => { setEmail(event.target.value); setErro(""); }} autoComplete="email" placeholder="seu@email.com" autoFocus className="h-[52px] w-full rounded-xl border border-zinc-200 bg-white pl-11 pr-4 text-sm outline-none placeholder:text-zinc-400 focus:border-[#258c53] focus:ring-4 focus:ring-[#258c53]/10" /></span></label>
                  {erro && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{erro}</p>}
                  <button disabled={carregando} className="flex h-[52px] w-full items-center justify-center gap-3 rounded-full bg-[#258c53] text-sm font-bold text-white hover:bg-[#1d7544] disabled:opacity-60">{carregando ? <><Loader2 size={17} className="animate-spin" /> Enviando...</> : <>Enviar código <ArrowRight size={17} /></>}</button>
                </form>
              ) : (
                <form onSubmit={redefinirSenha} className="space-y-4">
                  <label className="block"><span className="mb-2 block text-xs font-semibold text-[#46514b]">Código de verificação</span><span className="relative block"><KeyRound size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" /><input inputMode="numeric" maxLength={6} value={codigo} onChange={(event) => { setCodigo(event.target.value.replace(/\D/g, "")); setErro(""); }} autoComplete="one-time-code" placeholder="000000" autoFocus className="h-[52px] w-full rounded-xl border border-zinc-200 pl-11 pr-4 text-center text-base font-semibold tracking-[.35em] outline-none placeholder:text-zinc-300 focus:border-[#258c53] focus:ring-4 focus:ring-[#258c53]/10" /></span></label>
                  <label className="block"><span className="mb-2 block text-xs font-semibold text-[#46514b]">Nova senha</span><span className="relative block"><input type={mostrarSenha ? "text" : "password"} value={novaSenha} onChange={(event) => { setNovaSenha(event.target.value); setErro(""); }} autoComplete="new-password" placeholder="Letras e números" className="h-[52px] w-full rounded-xl border border-zinc-200 px-4 pr-12 text-sm outline-none placeholder:text-zinc-400 focus:border-[#258c53] focus:ring-4 focus:ring-[#258c53]/10" /><button type="button" onClick={() => setMostrarSenha((valor) => !valor)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[#258c53]" aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}>{mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
                  <label className="block"><span className="mb-2 block text-xs font-semibold text-[#46514b]">Confirmar senha</span><input type={mostrarSenha ? "text" : "password"} value={confirmacao} onChange={(event) => { setConfirmacao(event.target.value); setErro(""); }} autoComplete="new-password" placeholder="Repita a nova senha" className="h-[52px] w-full rounded-xl border border-zinc-200 px-4 text-sm outline-none placeholder:text-zinc-400 focus:border-[#258c53] focus:ring-4 focus:ring-[#258c53]/10" /></label>
                  <p className="text-xs text-[#8a958f]">Use ao menos 6 caracteres, incluindo letras e números.</p>
                  {erro && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{erro}</p>}
                  <button disabled={carregando} className="flex h-[52px] w-full items-center justify-center gap-3 rounded-full bg-[#258c53] text-sm font-bold text-white hover:bg-[#1d7544] disabled:opacity-60">{carregando ? <><Loader2 size={17} className="animate-spin" /> Salvando...</> : <>Redefinir senha <ArrowRight size={17} /></>}</button>
                  <button type="button" disabled={contador > 0 || carregando} onClick={() => enviarCodigo()} className="w-full py-2 text-xs text-[#718078] hover:text-[#258c53] disabled:cursor-not-allowed disabled:text-zinc-400">{contador > 0 ? `Reenviar código em ${contador}s` : "Reenviar código"}</button>
                </form>
              )}
            </>
          )}
        </div>
      </section>

      <aside className="relative hidden overflow-hidden bg-[#303a35] p-16 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-[#78d6a3]/15" /><div className="absolute -right-8 -top-8 h-48 w-48 rounded-full border border-[#78d6a3]/20" />
        <p className="relative text-[11px] font-bold uppercase tracking-[.14em] text-[#78d6a3]">Acesso protegido</p>
        <div className="relative max-w-lg"><h2 className="text-5xl font-light leading-[1.08]">Volte a cuidar do seu negócio com <span className="italic text-[#78d6a3]">segurança</span></h2><p className="mt-6 max-w-md text-sm leading-7 text-zinc-300">Confirme sua identidade por e-mail e escolha uma nova senha. Seus dados e sua operação continuam protegidos.</p></div>
        <p className="relative text-xs leading-5 text-zinc-400">© 2026 Gevyro<br />CNPJ 68.259.534/0001-70</p>
      </aside>
    </main>
  );
}
