export interface ProdutoFormData {
  nome: string;
  categoria: string;
  descricao: string;
  unidade: string;
  codigoBarras: string;
  preco: string;
  precoCusto: string;
  quantidadeEstoque: string;
  estoqueMinimo: string;
  ativo: boolean;
}

export interface ProdutoPayload {
  empresaId: number;
  nome: string;
  categoria: string | null;
  descricao: string | null;
  unidade: string | null;
  codigoBarras: string | null;
  preco: number;
  precoCusto: number | null;
  quantidadeEstoque: number;
  estoqueMinimo: number;
  ativo: boolean;
}

export function numeroDecimal(valor: string): number {
  return Number(valor.trim().replace(",", "."));
}

function inteiroNaoNegativo(valor: string, campo: string): number {
  const normalizado = valor.trim();
  if (!/^\d+$/.test(normalizado)) {
    throw new Error(`${campo} deve ser um número inteiro igual ou maior que zero.`);
  }
  const numero = Number(normalizado);
  if (!Number.isSafeInteger(numero)) throw new Error(`${campo} possui um valor inválido.`);
  return numero;
}

const textoOpcional = (valor: string) => valor.trim() || null;

export function montarProdutoPayload(form: ProdutoFormData, empresaId: number): ProdutoPayload {
  const nome = form.nome.trim();
  if (!nome) throw new Error("Nome é obrigatório.");

  if (!form.preco.trim()) throw new Error("Preço de venda é obrigatório.");
  const preco = numeroDecimal(form.preco);
  if (!Number.isFinite(preco) || preco < 0) {
    throw new Error("Preço de venda deve ser um valor igual ou maior que zero.");
  }

  const custoPreenchido = form.precoCusto.trim() !== "";
  const precoCusto = custoPreenchido ? numeroDecimal(form.precoCusto) : null;
  if (precoCusto !== null && (!Number.isFinite(precoCusto) || precoCusto < 0)) {
    throw new Error("Preço de custo deve ser um valor igual ou maior que zero.");
  }

  return {
    empresaId,
    nome,
    categoria: textoOpcional(form.categoria),
    descricao: textoOpcional(form.descricao),
    unidade: textoOpcional(form.unidade),
    codigoBarras: textoOpcional(form.codigoBarras),
    preco,
    precoCusto,
    quantidadeEstoque: inteiroNaoNegativo(form.quantidadeEstoque || "0", "Quantidade em estoque"),
    estoqueMinimo: inteiroNaoNegativo(form.estoqueMinimo || "0", "Estoque mínimo"),
    ativo: form.ativo,
  };
}
