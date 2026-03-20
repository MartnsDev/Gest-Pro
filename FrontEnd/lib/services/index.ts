// ===================== SERVIÇOS DE API CENTRALIZADOS =====================
// Todas as chamadas ao backend organizadas por módulo

import { http } from "../http-client";
import type {
  Produto,
  CriarProdutoDTO,
  Venda,
  RegistrarVendaDTO,
  Cliente,
  CriarClienteDTO,
  Caixa,
  AbrirCaixaDTO,
  FecharCaixaDTO,
  DashboardVisaoGeral,
  MetodoPagamentoData,
  ProdutoVendasData,
  VendasDiariasData,
} from "../types";

// ─── Produtos ───────────────────────────────────────────────────────
export const produtosService = {
  listar: () => http.get<Produto[]>("/api/v1/produtos"),

  buscarPorId: (id: number) => http.get<Produto>(`/api/v1/produtos/${id}`),

  criar: (data: CriarProdutoDTO) => http.post<Produto>("/api/v1/produtos", data),

  atualizar: (id: number, data: CriarProdutoDTO) =>
    http.put<Produto>(`/api/v1/produtos/${id}`, data),

  excluir: (id: number) => http.delete<void>(`/api/v1/produtos/${id}`),
};

// ─── Vendas ─────────────────────────────────────────────────────────
export const vendasService = {
  registrar: (data: RegistrarVendaDTO) =>
    http.post<Venda>("/api/v1/vendas/registrar", data),

  listarPorCaixa: (idCaixa: number) =>
    http.get<Venda[]>(`/api/v1/vendas/caixa/${idCaixa}`),

  buscarPorId: (id: number) => http.get<Venda>(`/api/v1/vendas/${id}`),
};

// ─── Clientes ───────────────────────────────────────────────────────
export const clientesService = {
  listar: () => http.get<Cliente[]>("/clientes/listar"),

  criar: (data: CriarClienteDTO) => http.post<Cliente>("/clientes/criar", data),

  desativar: (id: number) => http.delete<void>(`/clientes/desativar/${id}`),
};

// ─── Caixa ──────────────────────────────────────────────────────────
export const caixaService = {
  abrir: (data: AbrirCaixaDTO) => http.post<Caixa>("/api/v1/caixas/abrir", data),

  fechar: (data: FecharCaixaDTO) => http.post<Caixa>("/api/v1/caixas/fechar", data),

  obterResumo: (id: number) => http.get<Caixa>(`/api/v1/caixas/${id}/resumo`),

  buscarAberto: (empresaId: number) =>
    http.get<Caixa>(`/api/v1/caixas/aberto?empresaId=${empresaId}`),
};

// ─── Dashboard ──────────────────────────────────────────────────────
export const dashboardService = {
  visaoGeral: () => http.get<DashboardVisaoGeral>("/api/v1/dashboard/visao-geral"),

  vendasPorMetodo: () =>
    http.get<MetodoPagamentoData[]>("/api/v1/dashboard/vendas/metodo-pagamento"),

  vendasPorProduto: () =>
    http.get<ProdutoVendasData[]>("/api/v1/dashboard/vendas/produto"),

  vendasDiarias: () =>
    http.get<VendasDiariasData[]>("/api/v1/dashboard/vendas/diarias"),
};

// ─── Exportar todos os serviços ─────────────────────────────────────
export const api = {
  produtos: produtosService,
  vendas: vendasService,
  clientes: clientesService,
  caixa: caixaService,
  dashboard: dashboardService,
};
