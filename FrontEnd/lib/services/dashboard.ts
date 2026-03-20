// lib/services/dashboard.ts
import { http } from "../http-client";

export interface PlanoDTO {
  tipoPlano: string;
  diasRestantes: number;
}

export interface VisaoGeral {
  vendasHoje: number;
  produtosComEstoque: number;
  produtosSemEstoque: number;
  clientesAtivos: number;
  vendasSemana: number;
  planoUsuario: PlanoDTO | null;
  alertas: string[];
}

export interface MetodoPagamentoData {
  metodo: string;
  total: number;
}

export interface ProdutoVendasData {
  nome: string;
  total: number;
}

export interface VendasDiariasData {
  dia: string;
  total: number;
}

export const dashboardService = {
  visaoGeral: () => http.get<VisaoGeral>("/api/dashboard/visao-geral"),
  vendasPorMetodo: () =>
    http.get<MetodoPagamentoData[]>("/api/dashboard/vendas/metodo-pagamento"),
  vendasPorProduto: () =>
    http.get<ProdutoVendasData[]>("/api/dashboard/vendas/produto"),
  vendasDiarias: () =>
    http.get<VendasDiariasData[]>("/api/dashboard/vendas/diarias"),
};
