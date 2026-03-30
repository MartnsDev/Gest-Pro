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
  token?: string;
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

// ===================== Cookie helpers =====================

/**
 * Salva o JWT como cookie no domínio do próprio frontend.
 * Usado após login manual (backend retorna token no body)
 * e após Google OAuth (backend redireciona com ?token= na URL).
 */
export function salvarTokenCookie(token: string) {
  if (typeof document === "undefined") return;

  const maxAge = 7 * 24 * 60 * 60; // 7 dias
  const isProducao = globalThis.window.location.hostname !== "localhost";
  
  // No Railway, precisamos de SameSite=None e Secure para o cookie ser aceito
  // entre o redirecionamento do backend e o domínio do frontend.
  const cookieString = isProducao
    ? `jwt_token=${token}; path=/; max-age=${maxAge}; SameSite=None; Secure`
    : `jwt_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = cookieString;
  
  // Backup no LocalStorage (Caso o navegador bloqueie o cookie de vez)
  localStorage.setItem("jwt_token", token);
}

/**
 * Remove o cookie JWT do frontend.
 */
export function removerTokenCookie() {
  if (typeof document === "undefined") return;
  document.cookie = "jwt_token=; path=/; max-age=0; SameSite=Lax";
}

/**
 * Lê o token JWT do cookie do frontend.
 */
export function lerTokenCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)jwt_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

// ===================== Token helpers =====================

/**
 * Verifica se há um token disponível (localStorage ou cookie)
 */
export function hasToken(): boolean {
  if (typeof globalThis.window === "undefined") return false;
  const localStorageToken = localStorage.getItem("jwt_token");
  const cookieToken = lerTokenCookie();
  return !!(localStorageToken || cookieToken);
}

/**
 * Obtém o token JWT de qualquer fonte disponível
 */
export function getToken(): string | null {
  if (typeof globalThis.window === "undefined") return null;
  return localStorage.getItem("jwt_token") || lerTokenCookie();
}

// ===================== Fetch autenticado =====================

/**
 * Fetch com token JWT no header Authorization.
 * Retorna Response - use para quando precisar verificar status manualmente.
 */
export async function fetchAuth(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> ?? {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token.trim()}`;
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
 * Login com email e senha.
 * O backend retorna o token no body — salvamos como cookie no frontend.
 */
export async function login(email: string, senha: string): Promise<Usuario> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
    credentials: "include",
  });

  if (response.status === 403) throw new Error("PLANO_INATIVO");

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.erro || data?.mensagem || "Falha no login.");
  }

  // Salva token no cookie do frontend
  if (data?.token) {
    salvarTokenCookie(data.token);
  }

  return {
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
    credentials: "include",
  }).catch(() => {});

  // 2. Limpa tudo localmente
  removerTokenCookie();
  localStorage.clear();
  sessionStorage.clear();
}

/**
 * Obtém dados do usuário autenticado.
 * Envia o JWT via header Authorization (cross-domain) e credentials (same-domain).
 */
export async function getUsuario(): Promise<Usuario> {
  const response = await fetchAuth("/api/usuario");

  if (response.status === 401 || response.status === 403) {
    // Plano inativo — redireciona para pagamento
    if (response.status === 403 && typeof globalThis.window !== "undefined") {
      globalThis.window.location.href = "/pagamento";  
    }
    throw new Error(response.status === 403 ? "PLANO_INATIVO" : "NAO_AUTENTICADO");
  }

  const data = await response.json().catch(() => null);
  if (!response.ok || !data) {
    throw new Error(data?.erro || data?.mensagem || "Erro ao obter usuário");
  }

  return {
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
