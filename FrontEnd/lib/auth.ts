// lib/auth.ts
import { getUsuario, type Usuario } from "./api";

/**
 * Salva o token JWT no localStorage (apenas login normal)
 */
export function saveToken(token: string) {
  if (typeof window !== "undefined" && token) {
    localStorage.setItem("jwt_token", token);
  }
}

/**
 * Remove o token JWT do localStorage
 */
export function removeToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("jwt_token");
  }
}

/**
 * Obtém o token JWT do localStorage
 */
export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("jwt_token");
  }
  return null;
}

/**
 * Verifica se o usuário está autenticado
 * Retorna os dados do usuário se autenticado, null caso contrário
 * Funciona tanto para login normal quanto Google (via cookie HttpOnly)
 */
export async function checkAuth(): Promise<Usuario | null> {
  try {
    const usuario = await getUsuario(); // pega do backend via cookie
    return usuario || null;
  } catch (error) {
    removeToken(); // remove token local caso tenha
    return null;
  }
}

/**
 * Redireciona para a página de login se não estiver autenticado
 */
export async function requireAuth(): Promise<Usuario> {
  const usuario = await checkAuth();
  if (!usuario) {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
    throw new Error("Não autenticado");
  }
  return usuario;
}
