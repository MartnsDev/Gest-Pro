import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { LEGAL, LEGAL_LINKS } from "@/lib/legal";

export function LegalShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f6f8f7] text-[#303a35]">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex min-h-[74px] max-w-5xl items-center justify-between gap-4 px-5 py-3">
          <Link href="/" aria-label="Voltar à página inicial"><Image src="/images/gevyro-logo.png" alt="Gevyro" width={200} height={72} className="h-auto w-[180px] object-contain sm:w-[200px]" /></Link>
          <Link href="/contato" className="text-sm font-semibold text-[#258c53] hover:underline">Contato</Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
        <p className="text-xs font-bold uppercase tracking-[.14em] text-[#258c53]">GEVYRO · {LEGAL.slogan}</p>
        <h1 className="mt-4 text-4xl font-light tracking-[-.035em] sm:text-5xl">{title}</h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-[#66736c]">{description}</p>
        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-y border-zinc-200 py-4 text-xs text-[#718078]">
          <span>Versão {LEGAL.version}</span><span>Última atualização: {LEGAL.updatedAt}</span><span>CNPJ {LEGAL.cnpj}</span>
        </div>
        <article className="legal-content mt-10 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-10">{children}</article>
      </main>
      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-10">
          <nav aria-label="Documentos jurídicos" className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#59665f]">
            {LEGAL_LINKS.map(([href, label]) => <Link key={href} href={href} className="hover:text-[#258c53] hover:underline">{label}</Link>)}
          </nav>
          <p className="mt-7 text-xs leading-5 text-[#8a958f]">© 2026 Gevyro · CNPJ {LEGAL.cnpj}. {LEGAL.slogan}</p>
        </div>
      </footer>
    </div>
  );
}
