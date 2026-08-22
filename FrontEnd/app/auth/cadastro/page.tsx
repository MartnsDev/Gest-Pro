"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Camera, Check, Eye, EyeOff } from "lucide-react";
import { cadastrar, loginComGoogle } from "@/lib/api-v2";

const LEGAL_ACKNOWLEDGEMENTS_KEY = "gevyro-legal-acknowledgements";
const AFTER_LOGIN_KEY = "gevyro-request-cookie-consent-after-login";

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

export default function CadastroPage() {
  const router = useRouter();
  const fotoRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ nome: "", email: "", senha: "", confirmar: "" });
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [success, setSuccess] = useState(false);
  const [aceitouDocumentos, setAceitouDocumentos] = useState(false);

  const validarConsentimentos = () => {
    if (!aceitouDocumentos) {
      setErro("Confirme a leitura dos Termos de Uso e da Política de Privacidade.");
      return false;
    }
    return true;
  };

  const registrarCienciaLocal = (email: string) => {
    let atual: Record<string, object> = {};
    try {
      atual = JSON.parse(localStorage.getItem(LEGAL_ACKNOWLEDGEMENTS_KEY) ?? "{}");
    } catch {
      localStorage.removeItem(LEGAL_ACKNOWLEDGEMENTS_KEY);
    }
    atual[email.trim().toLowerCase()] = {
      termosVersao: "1.0",
      privacidadeVersao: "1.0",
      confirmadoEm: new Date().toISOString(),
    };
    localStorage.setItem(LEGAL_ACKNOWLEDGEMENTS_KEY, JSON.stringify(atual));
  };

  const set = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErro("");
  };

  const handleFoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFoto(file);
    const reader = new FileReader();
    reader.onload = () => setFotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.nome.trim()) return setErro("Nome é obrigatório");
    if (!form.email) return setErro("E-mail é obrigatório");
    if (form.senha.length < 6 || !/[A-Za-z]/.test(form.senha) || !/\d/.test(form.senha)) return setErro("A senha precisa ter ao menos 6 caracteres, com letras e números");
    if (form.senha !== form.confirmar) return setErro("As senhas não conferem");
    if (!validarConsentimentos()) return;
    setLoading(true);
    setErro("");
    try {
      await cadastrar(form.nome, form.email, form.senha, foto || undefined);
      registrarCienciaLocal(form.email);
      sessionStorage.setItem(AFTER_LOGIN_KEY, "true");
      setSuccess(true);
    } catch (error: unknown) {
      setErro(error instanceof Error ? error.message : "Erro ao cadastrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-[#343b37] lg:grid lg:grid-cols-[1.05fr_.95fr]">
      <section className="flex min-h-screen flex-col px-4 py-5 sm:px-10 sm:py-6 lg:px-16 xl:px-24">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center"><Image src="/images/gevyro-logo-400.webp" alt="Gevyro" width={400} height={145} priority className="h-auto w-[150px] object-contain sm:w-[200px]" /></Link>
          <Link href="/" className="flex items-center gap-2 text-xs text-[#718078] hover:text-[#258c53]"><ArrowLeft size={15} /> Início</Link>
        </header>

        <div className="mx-auto flex w-full max-w-[460px] flex-1 flex-col justify-center py-8 sm:py-10">
          {success ? (
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#258c53]/10 text-[#258c53]"><Check size={30} /></div>
              <h1 className="mt-7 text-4xl font-light tracking-[-.04em]">Conta <span className="italic text-[#258c53]">criada</span></h1>
              <p className="mt-4 text-sm leading-7 text-[#718078]">Enviamos a confirmação para <strong className="font-semibold text-[#343b37]">{form.email}</strong>. Confirme o e-mail para acessar sua conta.</p>
              <button type="button" onClick={() => router.push("/auth/login")} className="mt-8 flex h-[52px] w-full items-center justify-center gap-3 rounded-full bg-[#258c53] text-sm font-bold text-white hover:bg-[#1d7544]">Ir para o login <ArrowRight size={17} /></button>
            </div>
          ) : (
            <>
              <p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#258c53]">30 dias para testar</p>
              <h1 className="mt-4 text-3xl font-light tracking-[-.04em] sm:text-5xl">Crie sua <span className="italic text-[#258c53]">conta</span></h1>
              <p className="mt-4 text-sm leading-6 text-[#718078]">Comece sem cartão de crédito e conheça todos os recursos essenciais.</p>

              <button type="button" onClick={() => { if (validarConsentimentos()) { sessionStorage.setItem(AFTER_LOGIN_KEY, "true"); loginComGoogle(); } }} className="mt-7 flex h-[48px] w-full items-center justify-center gap-3 rounded-full border border-zinc-200 bg-white text-sm font-medium text-[#46514b] transition hover:border-[#258c53]/40 hover:bg-[#f7faf8]"><GoogleIcon /> Cadastrar com Google</button>
              <div className="my-6 flex items-center gap-4"><span className="h-px flex-1 bg-zinc-200" /><span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">ou</span><span className="h-px flex-1 bg-zinc-200" /></div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-4">
                  <button type="button" onClick={() => fotoRef.current?.click()} className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-dashed border-[#258c53]/50 bg-[#f3f7f4] text-[#258c53]">
                    {fotoPreview ? <Image src={fotoPreview} alt="Foto selecionada" fill className="object-cover" unoptimized /> : <Camera size={20} />}
                  </button>
                  <button type="button" onClick={() => fotoRef.current?.click()} className="text-left text-xs text-[#718078]"><strong className="block font-semibold text-[#258c53]">{foto ? "Trocar foto" : "Adicionar foto"}</strong><span className="mt-1 block">Opcional, até 5 MB</span></button>
                  <input ref={fotoRef} type="file" accept="image/*" onChange={handleFoto} className="hidden" />
                </div>

                <label className="block"><span className="mb-2 block text-xs font-semibold text-[#46514b]">Nome completo</span><input type="text" value={form.nome} onChange={(event) => set("nome", event.target.value)} autoComplete="name" placeholder="Seu nome" className="h-[50px] w-full rounded-xl border border-zinc-200 px-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-[#258c53] focus:ring-4 focus:ring-[#258c53]/10" /></label>
                <label className="block"><span className="mb-2 block text-xs font-semibold text-[#46514b]">E-mail</span><input type="email" value={form.email} onChange={(event) => set("email", event.target.value)} autoComplete="email" placeholder="seu@email.com" className="h-[50px] w-full rounded-xl border border-zinc-200 px-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-[#258c53] focus:ring-4 focus:ring-[#258c53]/10" /></label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block"><span className="mb-2 block text-xs font-semibold text-[#46514b]">Senha</span><span className="relative block"><input type={showPass ? "text" : "password"} value={form.senha} onChange={(event) => set("senha", event.target.value)} autoComplete="new-password" placeholder="Letras e números" className="h-[50px] w-full rounded-xl border border-zinc-200 px-4 pr-11 text-sm outline-none transition placeholder:text-zinc-400 focus:border-[#258c53] focus:ring-4 focus:ring-[#258c53]/10" /><button type="button" onClick={() => setShowPass((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}>{showPass ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>
                  <label className="block"><span className="mb-2 block text-xs font-semibold text-[#46514b]">Confirmar senha</span><input type={showPass ? "text" : "password"} value={form.confirmar} onChange={(event) => set("confirmar", event.target.value)} autoComplete="new-password" placeholder="Repita a senha" className="h-[50px] w-full rounded-xl border border-zinc-200 px-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-[#258c53] focus:ring-4 focus:ring-[#258c53]/10" /></label>
                </div>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-200 bg-[#f8faf9] p-4 text-xs leading-5 text-[#59665f]">
                  <input type="checkbox" checked={aceitouDocumentos} onChange={(event) => { setAceitouDocumentos(event.target.checked); setErro(""); }} className="mt-0.5 h-4 w-4 shrink-0 accent-[#258c53]" />
                  <span>Confirmo que li os <Link href="/termos" target="_blank" className="font-semibold text-[#258c53] underline">Termos de Uso</Link> e a <Link href="/privacidade" target="_blank" className="font-semibold text-[#258c53] underline">Política de Privacidade</Link>.</span>
                </label>
                {erro && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{erro}</p>}
                <button type="submit" disabled={loading} className="flex h-[52px] w-full items-center justify-center gap-3 rounded-full bg-[#258c53] text-sm font-bold text-white transition hover:bg-[#1d7544] disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Criando conta..." : <>Criar conta <ArrowRight size={17} /></>}</button>
                <p className="text-center text-[11px] leading-5 text-[#718078]">As preferências de cookies opcionais serão solicitadas depois do primeiro login e poderão ser recusadas.</p>
              </form>
              <p className="mt-6 text-center text-sm text-[#718078]">Já tem uma conta? <Link href="/auth/login" className="font-semibold text-[#258c53] hover:underline">Entrar</Link></p>
            </>
          )}
        </div>
      </section>

      <aside className="relative hidden overflow-hidden bg-[#303a35] p-16 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-[#78d6a3]/15" /><div className="absolute -right-8 -top-8 h-48 w-48 rounded-full border border-[#78d6a3]/20" />
        <p className="relative text-[11px] font-bold uppercase tracking-[.14em] text-[#78d6a3]">Comece sem custo</p>
        <div className="relative max-w-lg"><h2 className="text-5xl font-light leading-[1.08]">30 dias para conhecer o <span className="italic text-[#78d6a3]">Gevyro</span></h2><ul className="mt-9 space-y-5 text-sm text-zinc-300">{["Sem cartão de crédito", "Vendas, estoque e caixa", "Relatórios do negócio", "Acesso pelo computador ou celular"].map((item) => <li key={item} className="flex items-center gap-3"><Check size={16} className="text-[#78d6a3]" />{item}</li>)}</ul></div>
        <p className="relative text-xs leading-5 text-zinc-400">© 2026 Gevyro<br />CNPJ 68.259.534/0001-70</p>
      </aside>
    </main>
  );
}
