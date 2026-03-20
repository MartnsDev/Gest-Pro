// lib/http-client.ts
import { config } from "./config";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  retries?: number;
};

async function request<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, retries = 1, ...rest } = options;

  const url = path.startsWith("http") ? path : `${config.apiUrl}${path}`;

  const headers: Record<string, string> = {
    ...(rest.headers as Record<string, string>),
  };

  if (body !== undefined && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const init: RequestInit = {
    ...rest,
    credentials: "include",
    headers,
    body:
      body instanceof FormData
        ? body
        : body !== undefined
          ? JSON.stringify(body)
          : undefined,
  };

  let lastError: Error = new Error("Erro desconhecido");

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, init);

      // 401 → redireciona para login
      if (res.status === 401) {
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
        throw new ApiError(401, "Não autenticado");
      }

      // 403 → plano inativo
      if (res.status === 403) {
        throw new ApiError(403, "PLANO_INATIVO");
      }

      // Tenta parsear JSON
      const contentType = res.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await res.json().catch(() => null)
        : null;

      if (!res.ok) {
        const message =
          (data as { erro?: string; mensagem?: string })?.erro ||
          (data as { erro?: string; mensagem?: string })?.mensagem ||
          `Erro ${res.status}`;
        throw new ApiError(res.status, message, data);
      }

      return data as T;
    } catch (err) {
      lastError = err as Error;
      // só faz retry em erros de rede, não em erros HTTP
      if (err instanceof ApiError) throw err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
      }
    }
  }

  throw lastError;
}

export const http = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PUT", body }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
