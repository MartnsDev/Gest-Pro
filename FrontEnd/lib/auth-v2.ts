// lib/auth-v2.ts
"use client";

import {
  getUsuario,
  salvarTokenCookie,
  removerTokenCookie,
  getToken,
  type Usuario,
} from "./api-v2";

// ─── Token helpers ────────────────────────────────────────────────────────────

export function saveToken(token: string) {
  if (typeof window === "undefined" || !token) return;
  salvarTokenCookie(token);
  localStorage.setItem("jwt_token", token);
}

export function removeToken() {
  if (typeof globalThis.window === "undefined") return;
  removerTokenCookie();
  localStorage.removeItem("jwt_token");
}

// Re-export getToken para manter compatibilidade
export { getToken };

// ─── Auth checks ──────────────────────────────────────────────────────────────

export async function checkAuth(): Promise<Usuario | null> {
  try {
    return await getUsuario();
  } catch {
    removeToken();
    return null;
  }
}

export async function requireAuth(): Promise<Usuario> {
  const usuario = await checkAuth();
  if (!usuario) {
    if (typeof globalThis.window !== "undefined") window.location.href = "/auth/login";
    throw new Error("Não autenticado");
  }
  return usuario;
}

export async function logout(): Promise<void> {
  try {
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "https://gestpro-backend-production.up.railway.app"}/auth/logout`,
      { method: "POST", credentials: "include" }
    );
  } catch {
    // ignora erro de rede
  } finally {
    removeToken();
  }
}
