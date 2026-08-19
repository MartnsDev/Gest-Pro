// lib/api-v2.ts

"use client";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://gestpro-backend-production.up.railway.app";

// ===================== Tipos =====================

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  foto?: string;         // foto do Google (URL completa)
  fotoUpload?: string;   // foto de upload (path relativo: /uploads/fotos/uuid.jpg)
  tipoPlano: string;
  statusAcesso?: "ATIVO" | "INATIVO";
  expiracaoPlano?: string;
}

export interface LoginResponse {
  nome: string;
  email: string;
  tipoPlano: string;
  foto?: string;
  fotoUpload?: string;
  statusAcesso?: "ATIVO" | "INATIVO";
  expiracaoPlano?: string;
}

interface ErrorResponse {
  erro?: string;
  mensagem?: string;
}

// O JWT é mantido exclusivamente pelo backend em cookie HttpOnly. Estes
// aliases permanecem temporariamente para componentes legados compilarem sem
// voltar a expor a credencial ao JavaScript.
export function salvarTokenCookie(_token: string) {}
export function removerTokenCookie() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("jwt_token");
  localStorage.removeItem("token");
  localStorage.removeItem("access_token");
}
export function lerTokenCookie(): null { return null; }
export function getToken(): null { return null; }
export function hasToken(): boolean { return false; }

let csrfToken: string | null = null;

export async function obterCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;
  const response = await fetch(`${API_BASE_URL}/auth/csrf`, { credentials: "include", cache: "no-store" });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.token) throw new Error("Não foi possível iniciar uma sessão segura.");
  const token = String(data.token);
  csrfToken = token;
  return token;
}

// ===================== Fetch autenticado =====================

/**
 * Fetch autenticado por cookie HttpOnly, com proteção CSRF em mutações.
 * Retorna Response - use para quando precisar verificar status manualmente.
 */
export async function fetchAuth(path: string, options: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> ?? {}),
  };

  const method = (options.method ?? "GET").toUpperCase();
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    headers["X-CSRF-TOKEN"] = await obterCsrfToken();
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${API_BASE_URL}${cleanPath}`;

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", 
  });

  return response;
}

/**
 * Fetch autenticado que já parseia o JSON e lança erro se não for ok.
 * Use esta função nas páginas para simplificar o código.
 */
export async function fetchAuthJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetchAuth(path, options);
  
  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.mensagem ?? err?.erro ?? `Erro ${response.status}`);
  }
  
  return response.json();
}

// ===================== Funções de Auth =====================

/**
 * Login com e-mail e senha. A credencial permanece apenas no cookie HttpOnly.
 */
export async function login(email: string, senha: string): Promise<Usuario> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": await obterCsrfToken() },
    body: JSON.stringify({ email, senha }),
    credentials: "include",
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.erro || data?.mensagem || "Falha no login.");
  }

  // O Spring rotaciona/invalida o CSRF token ao autenticar.
  csrfToken = null;

  return {
    id:             data.id ?? 0,
    nome:           data.nome,
    email:          data.email,
    foto:           data.foto || undefined,
    fotoUpload:     data.fotoUpload || undefined,
    tipoPlano:      data.tipoPlano,
    statusAcesso:   data.statusAcesso,
    expiracaoPlano: data.expiracaoPlano,
  };
}

/**
 * Cadastro de novo usuário (multipart/form-data).
 */
export async function cadastrar(
  nome: string,
  email: string,
  senha: string,
  foto?: File,
): Promise<void> {
  const formData = new FormData();
  formData.append("nome", nome);
  formData.append("email", email);
  formData.append("senha", senha);
  if (foto) formData.append("foto", foto);

  const response = await fetch(`${API_BASE_URL}/auth/cadastro`, {
    method: "POST",
    headers: { "X-CSRF-TOKEN": await obterCsrfToken() },
    body: formData,
    credentials: "include",
  });

  const data = await response.json().catch(() => null) as ErrorResponse | null;
  if (!response.ok) {
    throw new Error(data?.erro || data?.mensagem || "Erro ao cadastrar usuário");
  }
}

/**
 * Logout — remove cookie local e invalida sessão no backend.
 */
export async function logout(): Promise<void> {
  // 1. Chama o backend primeiro (enquanto ainda tem o token)
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    headers: { "X-CSRF-TOKEN": await obterCsrfToken() },
    credentials: "include",
  }).catch(() => {});

  // 2. Limpa tudo localmente
  removerTokenCookie();
  localStorage.removeItem("token");
  localStorage.removeItem("access_token");
  csrfToken = null;
}

/**
 * Obtém dados do usuário autenticado.
 * O navegador envia somente o cookie HttpOnly definido pelo backend.
 */
export async function getUsuario(): Promise<Usuario> {
  const response = await fetchAuth("/api/usuario");

  if (response.status === 401 || response.status === 403) {
    throw new Error(response.status === 403 ? "PLANO_INATIVO" : "NAO_AUTENTICADO");
  }

  const data = await response.json().catch(() => null);
  if (!response.ok || !data) {
    throw new Error(data?.erro || data?.mensagem || "Erro ao obter usuário");
  }

  return {
    id:             data.id,
    nome:           data.nome,
    email:          data.email,
    foto:           data.foto || undefined,
    fotoUpload:     data.fotoUpload || undefined,
    tipoPlano:      data.tipoPlano,
    statusAcesso:   data.statusAcesso,
    expiracaoPlano: data.expiracaoPlano,
  };
}

/**
 * Login com Google — redireciona para o backend iniciar o fluxo OAuth2.
 */
export function loginComGoogle() {
  globalThis.window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
}
