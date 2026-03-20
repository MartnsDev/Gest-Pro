// lib/services/produtos.ts
import { http } from "../http-client";

export interface Produto {
  id: number;
  nome: string;
  categoria: string;
  preco: number;
  estoque: number;
  estoqueMinimo?: number;
  destaque?: boolean;
  descricao?: string;
  codigoBarras?: string;
  imagemUrl?: string;
}

export interface CreateProdutoDTO {
  nome: string;
  categoria: string;
  preco: number;
  estoque: number;
  estoqueMinimo?: number;
  destaque?: boolean;
  descricao?: string;
  codigoBarras?: string;
}

export type UpdateProdutoDTO = Partial<CreateProdutoDTO>;

export const produtosService = {
  listar: () => http.get<Produto[]>("/api/produtos"),
  buscarPorId: (id: number) => http.get<Produto>(`/api/produtos/${id}`),
  criar: (data: CreateProdutoDTO) => http.post<Produto>("/api/produtos", data),
  atualizar: (id: number, data: UpdateProdutoDTO) =>
    http.put<Produto>(`/api/produtos/${id}`, data),
  excluir: (id: number) => http.delete<void>(`/api/produtos/${id}`),
  categorias: () => http.get<string[]>("/api/produtos/categorias"),
};
