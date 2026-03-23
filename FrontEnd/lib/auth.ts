// lib/auth.tss
"use client";

import {
  getUsuario,
  salvarTokenCookie,
  removerTokenCookie,
  lerTokenCookie,
  type Usuario,
} from "./api";

// ─── Token helpers ────────────────────────────────────────────────────────────

export function saveToken(token: string) {
  if (typeof window === "undefined" || !token) return;
  salvarTokenCookie(token);
  localStorage.setItem("jwt_token", token);
}

export function removeToken() {
  if (typeof window === "undefined") return;
  removerTokenCookie();
  localStorage.removeItem("jwt_token");
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return lerTokenCookie() ?? localStorage.getItem("jwt_token");
}

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
    if (typeof window !== "undefined") window.location.href = "/auth/login";
    throw new Error("Não autenticado");
  }
  return usuario;
}

export async function logout(): Promise<void> {
  try {
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/auth/logout`,
      { method: "POST", credentials: "include" }
    );
  } catch {
    // ignora erro de rede
  } finally {
    removeToken();
  }
}