// lib/api.ts
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// ===================== Tipos =====================

export interface Usuario {
  nome: string;
  email: string;
  foto?: string;
  tipoPlano: string;
  statusAcesso?: "ATIVO" | "INATIVO";
  expiracaoPlano?: string; // 👈 adiciona aqui
}

export interface LoginResponse {
  token?: string;
  nome: string;
  email: string;
  tipoPlano: string;
  foto?: string;
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
 * Salva cookie JWT HTTP-only no backend
 */
export async function login(email: string, senha: string): Promise<Usuario> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
    credentials: "include",
  });

  const data:
    | (LoginResponse & { expiracaoPlano?: string; statusAcesso?: string })
    | ErrorResponse
    | null = await response.json().catch(() => null);

  const dataSafe = (
    data && typeof data === "object" ? data : {}
  ) as ErrorResponse;

  if (!response.ok) {
    const errorMsg = dataSafe.erro || dataSafe.mensagem || "Falha no login.";
    throw new Error(errorMsg);
  }

  const loginData = data as LoginResponse & {
    expiracaoPlano?: string;
    statusAcesso?: string;
  };

  return {
    nome: usuarioData.nome,
    email: usuarioData.email,
    foto: usuarioData.foto || "/placeholder-user.jpg",
    tipoPlano: usuarioData.tipoPlano,
    statusAcesso: usuarioData.statusAcesso,
    expiracaoPlano: usuarioData.expiracaoPlano,
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
    credentials: "include", // mantém cookie se backend enviar
  });

  const data: ErrorResponse | null = await response.json().catch(() => null);
  const dataSafe = (
    data && typeof data === "object" ? data : {}
  ) as ErrorResponse;

  if (!response.ok) {
    const errorMsg =
      dataSafe.erro || dataSafe.mensagem || "Erro ao cadastrar usuário";
    throw new Error(errorMsg);
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

  const data: Usuario | ErrorResponse | null = await response
    .json()
    .catch(() => null);

  const dataSafe = (
    data && typeof data === "object" ? data : {}
  ) as ErrorResponse;

  if (!response.ok) {
    const errorMsg =
      dataSafe.erro || dataSafe.mensagem || "Erro ao obter usuário";
    throw new Error(errorMsg);
  }

  const usuarioData = data as Usuario;

  return {
    nome: usuarioData.nome,
    email: usuarioData.email,
    // se não houver foto, usa a padrão
    foto: usuarioData.foto || "/placeholder-user.jpg",
    tipoPlano: usuarioData.tipoPlano,
    statusAcesso: usuarioData.statusAcesso,
  };
}

/**
 * Login com Google
 * Redireciona para o backend OAuth2
 */
export function loginComGoogle() {
  window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
}
