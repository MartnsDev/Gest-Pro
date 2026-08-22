"use client";

import { useEffect } from "react";
import { AUTH_EVENT_KEY, limparDadosSessaoCliente } from "@/lib/api-v2";

export function AuthSessionSync() {
  useEffect(() => {
    const sincronizarLogout = (event: StorageEvent) => {
      if (event.key !== AUTH_EVENT_KEY || !event.newValue) return;

      try {
        const payload = JSON.parse(event.newValue) as { type?: string };
        if (payload.type !== "logout") return;
      } catch {
        return;
      }

      limparDadosSessaoCliente();
      const rotaProtegida =
        window.location.pathname.startsWith("/dashboard") ||
        window.location.pathname.startsWith("/pagamento") ||
        window.location.pathname.startsWith("/payment");

      if (rotaProtegida) window.location.replace("/auth/login");
    };

    window.addEventListener("storage", sincronizarLogout);
    return () => window.removeEventListener("storage", sincronizarLogout);
  }, []);

  return null;
}
