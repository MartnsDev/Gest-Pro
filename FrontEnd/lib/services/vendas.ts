// lib/services/vendas.ts
import { http } from "../http-client";

export interface ItemVenda {
  produtoId: number;
  nomeProduto: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface Venda {
  id: number;
  itens: ItemVenda[];
  valorTotal: number;
  desconto: number;
  metodoPagamento: string;
  dataHora: string;
  clienteId?: number;
  clienteNome?: string;
  observacoes?: string;
}

export interface CreateVendaDTO {
  itens: { produtoId: number; quantidade: number }[];
  metodoPagamento: string;
  desconto?: number;
  clienteId?: number;
  observacoes?: string;
}

export const vendasService = {
  listar: (params?: { dataInicio?: string; dataFim?: string }) => {
    const query = params
      ? "?" + new URLSearchParams(params as Record<string, string>).toString()
      : "";
    return http.get<Venda[]>(`/api/vendas${query}`);
  },
  buscarPorId: (id: number) => http.get<Venda>(`/api/vendas/${id}`),
  criar: (data: CreateVendaDTO) => http.post<Venda>("/api/vendas", data),
  cancelar: (id: number) => http.delete<void>(`/api/vendas/${id}`),
};
