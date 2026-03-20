// lib/services/estoque.ts
import { http } from "../http-client";

export interface ProdutoEstoque {
  id: number;
  nome: string;
  categoria: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  status: "ok" | "baixo" | "zerado";
}

export interface Movimentacao {
  id: number;
  produtoId: number;
  produtoNome: string;
  quantidade: number;
  tipo: "ENTRADA" | "SAIDA";
  usuario: string;
  data: string;
  observacoes?: string;
}

export interface AjusteEstoqueDTO {
  quantidade: number;
  tipo: "ENTRADA" | "SAIDA";
  observacoes?: string;
}

export const estoqueService = {
  listar: () => http.get<ProdutoEstoque[]>("/api/estoque"),
  movimentacoes: () => http.get<Movimentacao[]>("/api/estoque/movimentacoes"),
  ajustar: (produtoId: number, data: AjusteEstoqueDTO) =>
    http.post<void>(`/api/estoque/${produtoId}/ajustar`, data),
};
