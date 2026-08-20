"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

export function PwaInstallPrompt() {
  const [visivel, setVisivel] = useState(false);
  const [convite, setConvite] = useState<BeforeInstallPromptEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [instrucaoManual, setInstrucaoManual] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const instalado = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
    const celular = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth <= 768;
    if (instalado) return;

    setIos(/iPhone|iPad|iPod/i.test(navigator.userAgent));
    let podeMostrar = Boolean(localStorage.getItem("gevyro-cookie-preferences"));
    let timer: number | undefined;
    const agendar = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setVisivel(true), 1200);
    };
    if (podeMostrar && celular) agendar();

    const aposConsentimento = () => {
      podeMostrar = true;
      if (celular) agendar();
    };

    const guardarConvite = (event: Event) => {
      event.preventDefault();
      setConvite(event as BeforeInstallPromptEvent);
      if (podeMostrar && celular) setVisivel(true);
    };
    const ocultarAoInstalar = () => setVisivel(false);
    const abrirPeloSite = () => setVisivel(true);

    window.addEventListener("beforeinstallprompt", guardarConvite);
    window.addEventListener("appinstalled", ocultarAoInstalar);
    window.addEventListener("gevyro:install-request", abrirPeloSite);
    window.addEventListener("gevyro:cookie-consent", aposConsentimento);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", guardarConvite);
      window.removeEventListener("appinstalled", ocultarAoInstalar);
      window.removeEventListener("gevyro:install-request", abrirPeloSite);
      window.removeEventListener("gevyro:cookie-consent", aposConsentimento);
    };
  }, []);

  const instalar = async () => {
    if (!convite) {
      setInstrucaoManual(true);
      return;
    }
    await convite.prompt();
    const escolha = await convite.userChoice;
    setConvite(null);
    if (escolha.outcome === "accepted") setVisivel(false);
  };

  if (!visivel) return null;

  return (
    <aside
      role="dialog"
      aria-label="Instalar aplicativo Gevyro"
      style={{
        position: "fixed", left: 12, right: 12, bottom: 12, zIndex: 10000,
        margin: "0 auto", maxWidth: 430, padding: 14,
        background: "var(--surface-elevated, #fff)", color: "var(--foreground, #18201c)",
        border: "1px solid var(--border, #dce5df)", borderRadius: 16,
        boxShadow: "0 18px 50px rgba(15, 23, 42, .22)",
      }}
    >
      <button onClick={() => setVisivel(false)} aria-label="Fechar" style={{ position: "absolute", right: 10, top: 10, width: 28, height: 28, display: "grid", placeItems: "center", border: 0, borderRadius: 8, background: "var(--surface-overlay, #f1f5f3)", color: "var(--foreground-muted, #66736c)", cursor: "pointer" }}>
        <X size={15} />
      </button>

      <div style={{ display: "flex", gap: 11, paddingRight: 30 }}>
        <img src="/gevyro-fav.png" alt="" width={42} height={42} style={{ width: 42, height: 42, borderRadius: 10 }} />
        <div>
          <strong style={{ display: "block", fontSize: 14 }}>Instale o Gevyro</strong>
          <span style={{ display: "block", marginTop: 3, fontSize: 12, lineHeight: 1.4, color: "var(--foreground-muted, #66736c)" }}>
            Acesse vendas, estoque e caixa direto pela tela inicial do celular.
          </span>
        </div>
      </div>

      {ios ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, padding: "10px 12px", borderRadius: 10, background: "var(--primary-muted, #e5f5ec)", color: "var(--foreground, #18201c)", fontSize: 12 }}>
          <Share size={16} color="var(--primary, #258c53)" />
          Toque em <strong>Compartilhar</strong> e depois em <strong>Adicionar à Tela de Início</strong>.
        </div>
      ) : (
        <>
          <button onClick={instalar} style={{ width: "100%", marginTop: 12, padding: "11px 14px", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, border: 0, borderRadius: 10, background: "var(--primary, #258c53)", color: "#fff", fontSize: 13, fontWeight: 750, cursor: "pointer" }}>
            <Download size={16} /> Instalar aplicativo
          </button>
          {instrucaoManual && <p style={{ margin: "9px 2px 0", fontSize: 11, lineHeight: 1.4, color: "var(--foreground-muted, #66736c)" }}>Abra o menu ⋮ do navegador e escolha <strong>Instalar aplicativo</strong> ou <strong>Adicionar à tela inicial</strong>.</p>}
        </>
      )}
    </aside>
  );
}
