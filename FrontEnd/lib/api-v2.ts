// lib/api.ts
"use client";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// ===================== Tipos =====================

export interface Usuario {
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

  const maxAge = 7 * 24 * 60 * 60;
  const isProducao = typeof window !== "undefined" && window.location.protocol === "https:";

  document.cookie = `jwt_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax${isProducao ? "; Secure" : ""}`;
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

// ===================== Fetch autenticado =====================

/**
 * Fetch com token JWT no header Authorization.
 * Necessário porque frontend e backend estão em domínios diferentes no Railway
 * — cookies cross-domain não funcionam, então enviamos via header.
 */
export async function fetchAuth(path: string, options: RequestInit = {}): Promise<Response> {
  const token = lerTokenCookie();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> ?? {}),
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include", // mantém para ambientes onde funciona
  });
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
  removerTokenCookie();
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  }).catch(() => {}); // ignora erro de rede no logout
}

/**
 * Obtém dados do usuário autenticado.
 * Envia o JWT via header Authorization (cross-domain) e credentials (same-domain).
 */
export async function getUsuario(): Promise<Usuario> {
  const response = await fetchAuth("/api/usuario");

  if (response.status === 401 || response.status === 403) {
    // Plano inativo — redireciona para pagamento
    if (response.status === 403 && typeof window !== "undefined") {
      window.location.href = "/pagamento";
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
  window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
}