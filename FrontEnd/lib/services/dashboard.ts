// lib/services/dashboard.ts
import { http } from "../http-client";

export interface PlanoDTO {
  tipoPlano: string;
  diasRestantes: number;
  empresasCriadas: number;
  limiteEmpresas: number;
  statusAcesso: "ATIVO" | "INATIVO";
}

// Alinhado com DashboardVisaoGeralResponse do backend
export interface VisaoGeral {
  vendasHoje: number;
  produtosComEstoque: number;
  produtosSemEstoque: number;
  clientesAtivos: number;
  vendasSemanais: number;          // ← "vendasSemanais", não "vendasSemana"
  planoUsuario: PlanoDTO | null;   // ← "planoUsuario", não "plano"
  alertas: string[];
}

export interface MetodoPagamentoData {
  metodo: string;
  total: number;
}

// Backend retorna "quantidade", não "total"
export interface ProdutoVendasData {
  nome: string;
  quantidade: number;
}

export interface VendasDiariasData {
  dia: string;
  total: number;
}

export const dashboardService = {
  visaoGeral:       () => http.get<VisaoGeral>            ("/api/v1/dashboard/visao-geral"),
  vendasPorMetodo:  () => http.get<MetodoPagamentoData[]> ("/api/v1/dashboard/vendas/metodo-pagamento"),
  vendasPorProduto: () => http.get<ProdutoVendasData[]>   ("/api/v1/dashboard/vendas/produto"),
  vendasDiarias:    () => http.get<VendasDiariasData[]>   ("/api/v1/dashboard/vendas/diarias"),
};// lib/services/dashboard.ts
import { http } from "../http-client";

export interface PlanoDTO {
  tipoPlano: string;
  diasRestantes: number;
  empresasCriadas: number;
  limiteEmpresas: number;
  statusAcesso: "ATIVO" | "INATIVO";
}

// Alinhado com DashboardVisaoGeralResponse do backend
export interface VisaoGeral {
  vendasHoje: number;
  produtosComEstoque: number;
  produtosSemEstoque: number;
  clientesAtivos: number;
  vendasSemanais: number;          // ← "vendasSemanais", não "vendasSemana"
  planoUsuario: PlanoDTO | null;   // ← "planoUsuario", não "plano"
  alertas: string[];
}

export interface MetodoPagamentoData {
  metodo: string;
  total: number;
}

// Backend retorna "quantidade", não "total"
export interface ProdutoVendasData {
  nome: string;
  quantidade: number;
}

export interface VendasDiariasData {
  dia: string;
  total: number;
}

export const dashboardService = {
  visaoGeral:       () => http.get<VisaoGeral>            ("/api/v1/dashboard/visao-geral"),
  vendasPorMetodo:  () => http.get<MetodoPagamentoData[]> ("/api/v1/dashboard/vendas/metodo-pagamento"),
  vendasPorProduto: () => http.get<ProdutoVendasData[]>   ("/api/v1/dashboard/vendas/produto"),
  vendasDiarias:    () => http.get<VendasDiariasData[]>   ("/api/v1/dashboard/vendas/diarias"),
};