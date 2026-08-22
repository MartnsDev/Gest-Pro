// lib/auth-v2.ts
"use client";

import {
  getUsuario,
  removerTokenCookie,
  getToken,
  logout as logoutApi,
  type Usuario,
} from "./api-v2";


export function saveToken(token: string) {
  // Compatibilidade de assinatura: tokens nunca são persistidos pelo cliente.
  void token;
}

export function removeToken() {
  if (typeof globalThis.window === "undefined") return;
  removerTokenCookie();
  sessionStorage.removeItem("jwt_token");
}

// Re-export getToken para manter compatibilidade
export { getToken };


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
  await logoutApi();
}
