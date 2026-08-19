import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageCircle, ShieldCheck, CreditCard, LifeBuoy, ArrowUpRight } from "lucide-react";
import { LegalShell } from "@/components/legal/legal-shell";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Contato",
  description: "Canais oficiais de contato, suporte e privacidade da Gevyro.",
};

const assuntos = [
  { icon: LifeBuoy, title: "Suporte técnico", text: "Dúvidas de acesso, configuração ou uso da plataforma.", subject: "Suporte técnico — Gevyro" },
  { icon: CreditCard, title: "Assinatura e cobrança", text: "Planos, checkout, cobrança, cancelamento ou reembolso.", subject: "Assinatura e cobrança — Gevyro" },
  { icon: ShieldCheck, title: "Privacidade e dados", text: "Solicitações de titulares e assuntos relacionados à LGPD.", subject: "Solicitação de privacidade — Gevyro" },
] as const;

export default function ContatoPage() {
  return (
    <LegalShell title="Contato" description="Fale com a Gevyro pelos canais oficiais abaixo. Escolha o assunto adequado para facilitar o atendimento.">
      <section aria-labelledby="canais">
        <h2 id="canais">Canais oficiais</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <a href={`mailto:${LEGAL.supportEmail}`} className="group !no-underline rounded-2xl border border-zinc-200 p-5 transition hover:border-[#258c53] hover:shadow-sm">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f5ed] text-[#258c53]"><Mail size={21} /></span>
            <strong className="mt-4 block text-base">E-mail</strong>
            <span className="mt-1 block break-all text-sm text-[#66736c]">{LEGAL.supportEmail}</span>
            <span className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#258c53]">Enviar e-mail <ArrowUpRight size={14} /></span>
          </a>
          <a href="https://wa.me/5511932649629?text=Ol%C3%A1%21%20Preciso%20de%20ajuda%20com%20a%20Gevyro." target="_blank" rel="noopener noreferrer" className="group !no-underline rounded-2xl border border-zinc-200 p-5 transition hover:border-[#258c53] hover:shadow-sm">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f5ed] text-[#258c53]"><MessageCircle size={21} /></span>
            <strong className="mt-4 block text-base">WhatsApp</strong>
            <span className="mt-1 block text-sm text-[#66736c]">+55 (11) 93264-9629</span>
            <span className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#258c53]">Abrir conversa <ArrowUpRight size={14} /></span>
          </a>
        </div>
        <p className="mt-4 rounded-xl bg-[#f6f8f7] px-4 py-3 text-xs text-[#718078]">Não envie senha, token, código de recuperação ou dados completos de cartão. Ainda não há prazo formal de atendimento publicado.</p>
      </section>

      <section aria-labelledby="assuntos">
        <h2 id="assuntos">Como podemos ajudar?</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {assuntos.map(({ icon: Icon, title, text, subject }) => (
            <a key={title} href={`mailto:${LEGAL.supportEmail}?subject=${encodeURIComponent(subject)}`} className="!no-underline rounded-2xl border border-zinc-200 p-5 transition hover:border-[#258c53]">
              <Icon size={20} className="text-[#258c53]" />
              <strong className="mt-4 block text-sm">{title}</strong>
              <span className="mt-2 block text-xs leading-5 text-[#718078]">{text}</span>
            </a>
          ))}
        </div>
      </section>

      <section aria-labelledby="orientacoes">
        <h2 id="orientacoes">Antes de entrar em contato</h2>
        <ul>
          <li>Informe o e-mail vinculado à conta, mas nunca a senha.</li>
          <li>Descreva o que aconteceu e, quando possível, a tela e o horário aproximado.</li>
          <li>Em cobrança, informe somente o plano e o identificador da transação; não envie dados completos do cartão.</li>
          <li>Para privacidade, indique qual direito deseja exercer. Poderemos confirmar sua identidade para proteger seus dados.</li>
        </ul>
      </section>

      <section aria-labelledby="empresa">
        <h2 id="empresa">Identificação</h2>
        <p><strong>GEVYRO</strong><br />{LEGAL.slogan}<br />CNPJ {LEGAL.cnpj}</p>
        <p><strong>{LEGAL.pending.legalName}</strong><br /><strong>{LEGAL.pending.address}</strong><br /><strong>{LEGAL.pending.privacyEmail}</strong></p>
      </section>

      <section aria-labelledby="documentos">
        <h2 id="documentos">Informações úteis</h2>
        <p>Consulte também os <Link href="/termos">Termos de Uso</Link>, a <Link href="/privacidade">Política de Privacidade</Link>, as <Link href="/cancelamento-reembolsos">condições de cancelamento</Link> e a página de <Link href="/seguranca">Segurança</Link>.</p>
      </section>
    </LegalShell>
  );
}
