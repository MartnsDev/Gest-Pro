"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";
import { login, loginComGoogle } from "@/lib/api-v2";

const AFTER_LOGIN_KEY = "gevyro-request-cookie-consent-after-login";
const LEGAL_AFTER_LOGIN_KEY = "gevyro-require-legal-ack-after-login";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", senha: "" });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleGoogle = () => {
    sessionStorage.setItem(AFTER_LOGIN_KEY, "true");
    sessionStorage.setItem(LEGAL_AFTER_LOGIN_KEY, "true");
    loginComGoogle();
  };

  const set = (key: "email" | "senha", value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErro("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.email || !form.senha) return setErro("Preencha todos os campos");
    setLoading(true);
    setErro("");
    try {
      const usuario = await login(form.email.trim().toLowerCase(), form.senha);
      router.push(usuario.statusAcesso === "INATIVO" ? "/pagamento" : "/dashboard");
      if (sessionStorage.getItem(AFTER_LOGIN_KEY) === "true") {
        sessionStorage.removeItem(AFTER_LOGIN_KEY);
        localStorage.removeItem("gevyro-cookie-preferences");
        window.setTimeout(() => window.dispatchEvent(new Event("gevyro:open-cookie-preferences")), 250);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Credenciais inválidas ou erro no servidor";
      setErro(message === "PLANO_INATIVO" ? "Não foi possível iniciar uma nova sessão. Tente novamente." : message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-[#343b37] lg:grid lg:grid-cols-[1.05fr_.95fr]">
      <section className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:px-16 xl:px-24">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/images/gevyro-logo-400.webp" alt="Gevyro" width={400} height={145} priority className="h-auto w-[200px] object-contain" />
          </Link>
          <Link href="/" className="flex items-center gap-2 text-xs text-[#718078] hover:text-[#258c53]"><ArrowLeft size={15} /> Início</Link>
        </header>

        <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col justify-center py-14">
          <p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#258c53]">Área do cliente</p>
          <h1 className="mt-4 text-4xl font-light tracking-[-.04em] text-[#343b37] sm:text-5xl">Bem-vindo <span className="italic text-[#258c53]">de volta</span></h1>
          <p className="mt-4 text-sm leading-6 text-[#718078]">Entre para acompanhar vendas, estoque, caixa e relatórios.</p>

          <button type="button" onClick={handleGoogle} className="mt-9 flex h-12 w-full items-center justify-center gap-3 rounded-full border border-zinc-200 bg-white text-sm font-medium text-[#46514b] transition hover:border-[#258c53]/40 hover:bg-[#f7faf8]">
            <GoogleIcon /> Continuar com Google
          </button>
          <div className="my-7 flex items-center gap-4"><span className="h-px flex-1 bg-zinc-200" /><span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">ou</span><span className="h-px flex-1 bg-zinc-200" /></div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block"><span className="mb-2 block text-xs font-semibold text-[#46514b]">E-mail</span><input type="email" value={form.email} onChange={(event) => set("email", event.target.value)} autoComplete="email" placeholder="seu@email.com" className="h-[52px] w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-[#258c53] focus:ring-4 focus:ring-[#258c53]/10" /></label>
            <label className="block">
              <span className="mb-2 flex items-center justify-between text-xs font-semibold text-[#46514b]">Senha <Link href="/esqueceu-senha" className="font-normal text-[#258c53] hover:underline">Esqueceu a senha?</Link></span>
              <span className="relative block"><input type={showPass ? "text" : "password"} value={form.senha} onChange={(event) => set("senha", event.target.value)} autoComplete="current-password" placeholder="Sua senha" className="h-[52px] w-full rounded-xl border border-zinc-200 bg-white px-4 pr-12 text-sm outline-none transition placeholder:text-zinc-400 focus:border-[#258c53] focus:ring-4 focus:ring-[#258c53]/10" /><button type="button" onClick={() => setShowPass((value) => !value)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[#258c53]" aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}>{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button></span>
            </label>
            {erro && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{erro}</p>}
            <button type="submit" disabled={loading} className="flex h-[52px] w-full items-center justify-center gap-3 rounded-full bg-[#258c53] text-sm font-bold text-white transition hover:bg-[#1d7544] disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Entrando..." : <>Entrar <ArrowRight size={17} /></>}</button>
          </form>

          <p className="mt-7 text-center text-sm text-[#718078]">Ainda não tem conta? <Link href="/auth/cadastro" className="font-semibold text-[#258c53] hover:underline">Teste por 30 dias</Link></p>
        </div>
      </section>

      <aside className="relative hidden overflow-hidden bg-[#303a35] p-16 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-[#78d6a3]/15" /><div className="absolute -right-8 -top-8 h-48 w-48 rounded-full border border-[#78d6a3]/20" />
        <p className="relative text-[11px] font-bold uppercase tracking-[.14em] text-[#78d6a3]">Gestão em evolução.</p>
        <div className="relative max-w-lg"><h2 className="text-5xl font-light leading-[1.08]">Sua operação continua <span className="italic text-[#78d6a3]">organizada</span></h2><p className="mt-6 max-w-md text-sm leading-7 text-zinc-300">Acesse seus dados e retome o trabalho exatamente de onde parou.</p></div>
        <p className="relative text-xs leading-5 text-zinc-400">© 2026 Gevyro<br />CNPJ 68.259.534/0001-70</p>
      </aside>
    </main>
  );
}
