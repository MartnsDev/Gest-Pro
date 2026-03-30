"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { salvarTokenCookie, lerTokenCookie } from "@/lib/api-v2";
import { checkAuth } from "@/lib/auth-v2";
import type { Usuario } from "@/lib/api-v2";

// Contexto para passar o usuário para qualquer filho do dashboard
const UsuarioContext = createContext<Usuario | null>(null);
export const useUsuarioDashboard = () => useContext(UsuarioContext);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    async function inicializar() {
      // 1. Captura token do redirect Google OAuth (?token=xyz)
      const params = new URLSearchParams(globalThis.window.location.search);
      const tokenUrl = params.get("token");

      if (tokenUrl) {
        // Remove da URL imediatamente para reduzir exposição em histórico/referrer.
        globalThis.window.history.replaceState(
          {},
          "",
          globalThis.window.location.pathname,
        );
        salvarTokenCookie(tokenUrl);
      }

      // 2. Se não há token nenhum, vai para login
      const tokenSalvo = lerTokenCookie();
      if (!tokenSalvo && !tokenUrl) {
        router.replace("/auth/login");
        return;
      }

      // 3. Valida com o backend
      const user = await checkAuth();
      if (!user) {
        router.replace("/auth/login");
        return;
      }

      // 4. Plano inativo → pagamento
      if (user.statusAcesso === "INATIVO") {
        router.replace("/pagamento");
        return;
      }

      setUsuario(user);
      setVerificando(false);
    }

    inicializar();
  }, []);

  if (verificando) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#030305",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          style={{ animation: "spin 1s linear infinite" }}
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="rgba(16,185,129,0.2)"
            strokeWidth="3"
          />
          <path
            d="M12 2a10 10 0 0 1 10 10"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        <span
          style={{
            fontSize: 13,
            color: "rgba(241,245,249,0.3)",
            fontFamily: "'DM Mono', monospace",
          }}
        >
          Verificando sessão...
        </span>
      </div>
    );
  }

  return (
    <UsuarioContext.Provider value={usuario}>
      {children}
    </UsuarioContext.Provider>
  );
}
