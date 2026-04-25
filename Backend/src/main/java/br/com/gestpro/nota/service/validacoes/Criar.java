package br.com.gestpro.nota.service.validacoes;

import br.com.gestpro.infra.exception.ApiException;
import br.com.gestpro.nota.NotaFiscalStatus;
import br.com.gestpro.nota.dto.CriarNotaRequest;
import br.com.gestpro.nota.dto.ItemCalc;
import br.com.gestpro.nota.model.ItemNotaFiscal;
import br.com.gestpro.nota.model.NotaFiscal;
import br.com.gestpro.nota.repository.NotaFiscalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;

/**
 * Serviço responsável por criar um rascunho de nota fiscal (Modo Digitação).
 * Realiza o cálculo dos valores financeiros e persiste a nota e seus itens.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class Criar {

    private final NotaFiscalRepository notaRepo;
    private final BuscaPorId buscaPorId;

    @Transactional
    public Map<String, Object> criar(CriarNotaRequest request) {

        if (request.getItens() == null || request.getItens().isEmpty()) {
            throw new ApiException(
                    "A nota deve conter pelo menos um item.",
                    HttpStatus.BAD_REQUEST,
                    "/api/nota-fiscal"
            );
        }

        // 1. Instanciar a Nota (O Lombok Builder facilita muito aqui)
        NotaFiscal nota = NotaFiscal.builder()
                .empresaId(request.getEmpresaId())
                .clienteId(request.getClienteId())
                .clienteNome(request.getClienteNome())
                .clienteCpfCnpj(request.getClienteCpfCnpj())
                .tipo(request.getTipo())
                .naturezaOperacao(request.getNaturezaOperacao())
                .formaPagamento(request.getFormaPagamento())
                .serie(request.getSerie() != null ? request.getSerie() : "1")
                .valorFrete(coalesce(request.getValorFrete(), BigDecimal.ZERO))
                .valorDesconto(coalesce(request.getValorDesconto(), BigDecimal.ZERO))
                .informacoesAdicionais(request.getInformacoesAdicionais())
                .status(NotaFiscalStatus.DIGITACAO)
                .build();

        // 2. Gerar Número Sequencial real consultando o banco
        Long proxNumero = notaRepo.findMaxNumeroByEmpresaIdAndTipoAndSerie(
                        request.getEmpresaId(), request.getTipo(), nota.getSerie())
                .map(n -> n + 1).orElse(1L);
        nota.setNumeroNota(proxNumero);

        // 3. Processar Itens e Acumular Totais
        BigDecimal totalProdutos = BigDecimal.ZERO;
        BigDecimal totalIcms = BigDecimal.ZERO;
        BigDecimal totalPis = BigDecimal.ZERO;
        BigDecimal totalCofins = BigDecimal.ZERO;
        int numItem = 1;

        for (ItemCalc ic : request.getItens()) {
            // Usa o DTO ItemCalc para instanciar a entidade ItemNotaFiscal
            ItemNotaFiscal item = ItemNotaFiscal.builder()
                    .produtoId(ic.getProdutoId())
                    .codigoProduto(ic.getCodigoProduto())
                    .descricao(ic.getDescricao())
                    .ncm(ic.getNcm())
                    .cfop(coalesceStr(ic.getCfop(), "5102")) // Default para venda estadual
                    .unidade(coalesceStr(ic.getUnidade(), "UN"))
                    .quantidade(ic.getQuantidade())
                    .valorUnitario(ic.getValorUnitario())
                    .valorDesconto(coalesce(ic.getValorDesconto(), BigDecimal.ZERO))
                    .valorBruto(ic.getValorBruto())
                    .valorTotal(ic.getValorTotal())
                    .csosn(ic.getCsosn())
                    .cstIcms(ic.getCstIcms())
                    .icmsAliquota(coalesce(ic.getIcmsAliquota(), BigDecimal.ZERO))
                    .cstPis(ic.getCstPis())
                    .pisAliquota(coalesce(ic.getPisAliquota(), BigDecimal.ZERO))
                    .cstCofins(ic.getCstCofins())
                    .cofinsAliquota(coalesce(ic.getCofinsAliquota(), BigDecimal.ZERO))
                    .numeroItem(numItem++)
                    .build();

            // Cálculos exatos de impostos baseados na alíquota do DTO
            if (item.getIcmsAliquota().compareTo(BigDecimal.ZERO) > 0) {
                item.setIcmsBaseCalculo(item.getValorTotal());
                item.setIcmsValor(calcularImposto(item.getValorTotal(), item.getIcmsAliquota()));
                totalIcms = totalIcms.add(item.getIcmsValor());
            }

            if (item.getPisAliquota().compareTo(BigDecimal.ZERO) > 0) {
                item.setPisBaseCalculo(item.getValorTotal());
                item.setPisValor(calcularImposto(item.getValorTotal(), item.getPisAliquota()));
                totalPis = totalPis.add(item.getPisValor());
            }

            if (item.getCofinsAliquota().compareTo(BigDecimal.ZERO) > 0) {
                item.setCofinsBaseCalculo(item.getValorTotal());
                item.setCofinsValor(calcularImposto(item.getValorTotal(), item.getCofinsAliquota()));
                totalCofins = totalCofins.add(item.getCofinsValor());
            }

            totalProdutos = totalProdutos.add(item.getValorTotal());

            // Adiciona o item à nota (O método addItem já faz o vínculo bidirecional)
            nota.addItem(item);
        }

        // 4. Fechar Totais da Nota
        nota.setValorProdutos(totalProdutos);
        nota.setValorIcms(totalIcms);
        nota.setValorPis(totalPis);
        nota.setValorCofins(totalCofins);

        // Total = Produtos + Frete - Desconto Global
        nota.setValorTotal(totalProdutos
                .add(nota.getValorFrete())
                .subtract(nota.getValorDesconto()));

        // 5. Salvar tudo (Cascade = ALL salva os itens automaticamente)
        log.info("Salvando rascunho de Nota Fiscal: Tipo={} Número={}", nota.getTipo(), nota.getNumeroNota());
        NotaFiscal salva = notaRepo.save(nota);

        // 6. Retorna o Map utilizando o serviço de busca
        return buscaPorId.buscarPorId(salva.getId());
    }

    // ────────────────────────────────────────────────────────────────────────
    // Helpers Matemáticos e de Nulidade
    // ────────────────────────────────────────────────────────────────────────

    private BigDecimal calcularImposto(BigDecimal base, BigDecimal aliquota) {
        return base.multiply(aliquota).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal coalesce(BigDecimal val, BigDecimal fallback) {
        return val != null ? val : fallback;
    }

    private String coalesceStr(String val, String fallback) {
        return (val != null && !val.isBlank()) ? val.trim() : fallback;
    }
}