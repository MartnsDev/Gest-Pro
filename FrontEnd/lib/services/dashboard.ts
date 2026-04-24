// lib/services/dashboard.ts
import { http } from "../http-client";

export interface PlanoDTO {
  tipoPlano: string;
  diasRestantes: number;
  empresasCriadas: number;
  limiteEmpresas: number;
  statusAcesso: "ATIVO" | "INATIVO";
}

export interface MetodoPagamentoData { metodo: string; total: number; }
export interface ProdutoVendasData { nome: string; quantidade: number; }
export interface VendasDiariasData { dia: string; total: number; }

// Alinhado com DashboardVisaoGeralResponse do backend
export interface VisaoGeral {
  vendasHoje: number;
  produtosComEstoque: number;
  produtosSemEstoque: number;
  clientesAtivos: number;
  vendasSemanais: number;
  vendasMes: number; 
  lucroDia: number;  
  lucroMes: number;  
  custos: number;    
  planoUsuario: PlanoDTO | null;
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
  visaoGeral:       (empresaId: number) => http.get<VisaoGeral>            (`/api/v1/dashboard/visao-geral?empresaId=${empresaId}`),
  vendasPorMetodo:  (empresaId: number) => http.get<MetodoPagamentoData[]> (`/api/v1/dashboard/vendas/metodo-pagamento?empresaId=${empresaId}`),
  vendasPorProduto: (empresaId: number) => http.get<ProdutoVendasData[]>   (`/api/v1/dashboard/vendas/produto?empresaId=${empresaId}`),
  vendasDiarias:    (empresaId: number) => http.get<VendasDiariasData[]>   (`/api/v1/dashboard/vendas/diarias?empresaId=${empresaId}`),
};
