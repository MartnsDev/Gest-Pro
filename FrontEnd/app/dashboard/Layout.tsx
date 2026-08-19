"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
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
      // Nunca aceite credenciais pela URL. Remove parâmetros legados antes de
      // validar a sessão HttpOnly criada pelo backend.
      const params = new URLSearchParams(globalThis.window.location.search);
      if (params.has("token")) globalThis.window.history.replaceState({}, "", globalThis.window.location.pathname);

      // Valida a sessão diretamente no backend; cookies HttpOnly não podem e
      // não devem ser inspecionados pelo frontend.
      let user: Usuario | null = null;
      try {
        user = await checkAuth();
      } catch (error) {
        if (error instanceof Error && error.message === "PLANO_INATIVO") {
          router.replace(`/pagamento${globalThis.window.location.search}`);
          return;
        }
        throw error;
      }
      if (!user) {
        router.replace("/auth/login");
        return;
      }

      // 4. Plano inativo → pagamento
      if (user.statusAcesso === "INATIVO") {
        router.replace(`/pagamento${globalThis.window.location.search}`);
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
          background: "var(--background)",
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
            color: "var(--foreground-muted)",
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
