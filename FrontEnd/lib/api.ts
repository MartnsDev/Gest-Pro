// lib/api.ts
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// ===================== Tipos =====================

export interface Usuario {
  nome: string;
  email: string;
  foto?: string;        // foto do Google (URL completa)
  fotoUpload?: string;  // foto de upload (path relativo: /uploads/fotos/uuid.jpg)
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

// ===================== Funções =====================

/**
 * Login com email e senha
 */
export async function login(email: string, senha: string): Promise<Usuario> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
    credentials: "include",
  });

  if (response.status === 403) {
    throw new Error("PLANO_INATIVO");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.erro || data?.mensagem || "Falha no login.";
    throw new Error(errorMsg);
  }

  return {
    nome:          data.nome,
    email:         data.email,
    foto:          data.foto || undefined,
    fotoUpload:    data.fotoUpload || undefined,
    tipoPlano:     data.tipoPlano,
    statusAcesso:  data.statusAcesso,
    expiracaoPlano:data.expiracaoPlano,
  };
}

/**
 * Cadastro de novo usuário
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

  const data: ErrorResponse | null = await response.json().catch(() => null);
  const dataSafe = (data && typeof data === "object" ? data : {}) as ErrorResponse;

  if (!response.ok) {
    throw new Error(dataSafe.erro || dataSafe.mensagem || "Erro ao cadastrar usuário");
  }
}

/**
 * Logout
 */
export async function logout(): Promise<void> {
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

/**
 * Obter dados do usuário logado via cookie JWT
 */
export async function getUsuario(): Promise<Usuario> {
  const response = await fetch(`${API_BASE_URL}/api/usuario`, {
    credentials: "include",
  });

  if (response.status === 403) {
    window.location.href = "/pagamento";
    throw new Error("Plano inativo");
  }

  const data: any = await response.json().catch(() => null);
  const dataSafe = (data && typeof data === "object" ? data : {}) as ErrorResponse;

  if (!response.ok) {
    throw new Error(dataSafe.erro || dataSafe.mensagem || "Erro ao obter usuário");
  }

  return {
    nome:          data.nome,
    email:         data.email,
    foto:          data.foto || undefined,        // foto Google (URL completa)
    fotoUpload:    data.fotoUpload || undefined,  // foto de upload (path relativo)
    tipoPlano:     data.tipoPlano,
    statusAcesso:  data.statusAcesso,
    expiracaoPlano:data.expiracaoPlano,
  };
}

/**
 * Login com Google
 */
export function loginComGoogle() {
  window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
}