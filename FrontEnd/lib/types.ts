// ===================== TIPOS DO SISTEMA GESTPRO =====================

// ─── Usuário e Autenticação ─────────────────────────────────────────
export interface Usuario {
  id?: number;
  nome: string;
  email: string;
  foto?: string;
  tipoPlano: TipoPlano;
  statusAcesso?: StatusAcesso;
  expiracaoPlano?: string;
}

export type TipoPlano = "GRATUITO" | "BASICO" | "PROFISSIONAL" | "ENTERPRISE";
export type StatusAcesso = "ATIVO" | "INATIVO";

export interface LoginResponse {
  token?: string;
  nome: string;
  email: string;
  tipoPlano: TipoPlano;
  foto?: string;
  statusAcesso?: StatusAcesso;
  expiracaoPlano?: string;
}

// ─── Produto ────────────────────────────────────────────────────────
export interface Produto {
  id: number;
  nome: string;
  preco: number;
  quantidadeEstoque: number;
  quantidade?: number;
  ativo: boolean;
  usuarioId: number;
  dataCriacao?: string;
}

export interface CriarProdutoDTO {
  nome: string;
  preco: number;
  quantidadeEstoque: number;
  ativo?: boolean;
}

export interface AtualizarProdutoDTO extends CriarProdutoDTO {
  id: number;
}

// ─── Venda ──────────────────────────────────────────────────────────
export type FormaPagamento = "DINHEIRO" | "CARTAO_CREDITO" | "CARTAO_DEBITO" | "PIX" | "BOLETO";

export interface ItemVenda {
  id?: number;
  idProduto: number;
  nomeProduto?: string;
  quantidade: number;
  precoUnitario?: number;
  subtotal?: number;
}

export interface Venda {
  id: number;
  emailUsuario?: string;
  idCaixa?: number;
  nomeCliente?: string;
  itens: ItemVenda[];
  valorTotal: number;
  desconto: number;
  valorFinal: number;
  formaPagamento: FormaPagamento;
  dataVenda: string;
  observacao?: string;
}

export interface RegistrarVendaDTO {
  idCaixa: number;
  idCliente?: number;
  itens: { idProduto: number; quantidade: number }[];
  formaPagamento: FormaPagamento;
  desconto?: number;
  observacao?: string;
}

// ─── Cliente ────────────────────────────────────────────────────────
export interface Cliente {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
  ativo: boolean;
  usuarioId?: number;
}

export interface CriarClienteDTO {
  nome: string;
  email?: string;
  telefone?: string;
}

// ─── Caixa ──────────────────────────────────────────────────────────
export type StatusCaixa = "ABERTO" | "FECHADO";

export interface Caixa {
  id: number;
  empresaId: number;
  valorAbertura: number;
  valorFechamento?: number;
  status: StatusCaixa;
  dataAbertura: string;
  dataFechamento?: string;
  totalVendas?: number;
  quantidadeVendas?: number;
}

export interface AbrirCaixaDTO {
  empresaId: number;
  valorAbertura: number;
}

export interface FecharCaixaDTO {
  idCaixa: number;
  valorFechamento: number;
}

// ─── Dashboard ──────────────────────────────────────────────────────
export interface DashboardVisaoGeral {
  vendasHoje: number;
  produtosComEstoque: number;
  produtosSemEstoque: number;
  clientesAtivos: number;
  vendasSemana: number;
  planoUsuario?: PlanoDTO;
  alertas?: string[];
}

export interface PlanoDTO {
  tipoPlano: TipoPlano;
  diasRestantes: number;
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

// ─── Estoque / Movimentação ─────────────────────────────────────────
export interface Movimentacao {
  id: number;
  produtoId: number;
  produtoNome: string;
  quantidade: number;
  tipo: "ENTRADA" | "SAIDA";
  usuario: string;
  data: string;
}

// ─── Relatórios ─────────────────────────────────────────────────────
export interface Relatorio {
  id: number;
  tipo: string;
  dataInicio: string;
  dataFim: string;
  dados: Record<string, unknown>;
}

// ─── Erros da API ───────────────────────────────────────────────────
export interface ApiError {
  erro?: string;
  mensagem?: string;
  status?: number;
  timestamp?: string;
}

// ─── Resposta genérica ──────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  status: number;
}
