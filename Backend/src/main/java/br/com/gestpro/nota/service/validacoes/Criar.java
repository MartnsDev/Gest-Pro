package br.com.gestpro.nota.service.validacoes;

import br.com.gestpro.nota.NotaFiscalStatus;
import br.com.gestpro.nota.dto.ItemCalc;
import br.com.gestpro.nota.dto.NotaFiscalDTOs;
import br.com.gestpro.nota.model.ItemNotaFiscal;
import br.com.gestpro.nota.model.NotaFiscal;
import br.com.gestpro.nota.repository.ItemNotaFiscalRepository;
import br.com.gestpro.nota.repository.NotaFiscalRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Serviço responsável por criar um rascunho de nota fiscal.
 * Realiza o cálculo dos valores financeiros e persiste a nota e seus itens.
 */
public class Criar {

    private static final DateTimeFormatter ANO_FORMATTER = DateTimeFormatter.ofPattern("yyyy");

    private final ItemNotaFiscalRepository itemRepo;
    private final BuscaPorId               buscaPorId;
    private final NotaFiscalRepository     notaRepo;

    public Criar(ItemNotaFiscalRepository itemRepo,
                 BuscaPorId buscaPorId,
                 NotaFiscalRepository notaRepo) {
        this.itemRepo   = itemRepo;
        this.buscaPorId = buscaPorId;
        this.notaRepo   = notaRepo;
    }

    public Map<String, Object> criar(NotaFiscalDTOs.CriarNotaFiscalDTO dto, String usuarioId) {

        // 1. Calcular itens
        List<ItemCalc> itensCalculados = calcularItens(dto.getItens());

        // 2. Calcular totais da nota
        BigDecimal subtotal = itensCalculados.stream()
                .map(ItemCalc::total)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal pctDesconto = coalesce(dto.getDesconto(), BigDecimal.ZERO);
        BigDecimal pctImpostos = coalesce(dto.getImpostos(), BigDecimal.ZERO);

        BigDecimal valorDesconto = subtotal
                .multiply(pctDesconto.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP))
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal baseImpostos = subtotal.subtract(valorDesconto);
        BigDecimal valorImpostos = baseImpostos
                .multiply(pctImpostos.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP))
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal total = baseImpostos.add(valorImpostos)
                .setScale(2, RoundingMode.HALF_UP);

        // 3. Gerar número sequencial
        String numero = gerarNumero(dto.getEmpresaId(), dto.getTipo().name());

        // 4. Construir e persistir nota
        NotaFiscal nota = NotaFiscal.builder()
                .numero(numero)
                .tipo(dto.getTipo())
                .status(NotaFiscalStatus.RASCUNHO)
                .empresaId(dto.getEmpresaId())
                .clienteId(dto.getClienteId())
                .clienteNome(dto.getClienteNome())
                .clienteCpfCnpj(dto.getClienteCpfCnpj())
                .clienteEmail(dto.getClienteEmail())
                .clienteTelefone(dto.getClienteTelefone())
                .clienteEndereco(dto.getClienteEndereco())
                .clienteCidade(dto.getClienteCidade())
                .clienteEstado(dto.getClienteEstado() != null
                        ? dto.getClienteEstado().toUpperCase() : null)
                .clienteCep(dto.getClienteCep())
                .subtotal(subtotal)
                .desconto(pctDesconto)
                .valorDesconto(valorDesconto)
                .impostos(pctImpostos)
                .valorImpostos(valorImpostos)
                .total(total)
                .formaPagamento(dto.getFormaPagamento())
                .vendaId(dto.getVendaId())
                .observacoes(dto.getObservacoes())
                .build();

        NotaFiscal salva = notaRepo.save(nota);

        // 5. Persistir itens
        List<ItemNotaFiscal> itensSalvos = new ArrayList<>();
        for (ItemCalc ic : itensCalculados) {
            NotaFiscalDTOs.CriarItemNotaDTO d = ic.dto();
            ItemNotaFiscal item = ItemNotaFiscal.builder()
                    .notaFiscalId(salva.getId())
                    .produtoId(d.getProdutoId())
                    .descricao(d.getDescricao())
                    .codigo(d.getCodigo())
                    .ncm(d.getNcm())
                    .cfop(coalesceStr(d.getCfop(), "5102"))
                    .unidade(coalesceStr(d.getUnidade(), "UN"))
                    .quantidade(d.getQuantidade())
                    .valorUnitario(d.getValorUnitario())
                    .desconto(coalesce(d.getDesconto(), BigDecimal.ZERO))
                    .icms(coalesce(d.getIcms(), BigDecimal.ZERO))
                    .pis(coalesce(d.getPis(), BigDecimal.ZERO))
                    .cofins(coalesce(d.getCofins(), BigDecimal.ZERO))
                    .valorTotal(ic.total())
                    .build();
            itensSalvos.add(itemRepo.save(item));
        }

        // 6. Retornar resposta completa
        Map<String, Object> resultado = buscaPorId.notaParaMap(salva);
        resultado.put("itens", itensSalvos.stream()
                .map(buscaPorId::itemParaMap)
                .toList());
        return resultado;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private List<ItemCalc> calcularItens(List<NotaFiscalDTOs.CriarItemNotaDTO> dtos) {
        List<ItemCalc> resultado = new ArrayList<>();
        for (NotaFiscalDTOs.CriarItemNotaDTO d : dtos) {
            BigDecimal qty  = d.getQuantidade();
            BigDecimal unit = d.getValorUnitario();
            BigDecimal desc = coalesce(d.getDesconto(), BigDecimal.ZERO);

            BigDecimal bruto   = qty.multiply(unit);
            BigDecimal desAmt  = bruto.multiply(desc.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
            BigDecimal total   = bruto.subtract(desAmt).setScale(2, RoundingMode.HALF_UP);
            resultado.add(new ItemCalc(d, total));
        }
        return resultado;
    }

    private String gerarNumero(String empresaId, String tipo) {
        String ano    = LocalDateTime.now().format(ANO_FORMATTER);
        String prefixo = tipo + "-" + ano + "-";

        Long max = notaRepo.findMaxNumeroSequencial(empresaId, prefixo).orElse(0L);
        long proximo = max + 1;

        // Garante unicidade em caso de colisão
        String candidato = prefixo + String.format("%06d", proximo);
        while (notaRepo.existsByNumero(candidato)) {
            proximo++;
            candidato = prefixo + String.format("%06d", proximo);
        }
        return candidato;
    }

    private BigDecimal coalesce(BigDecimal val, BigDecimal fallback) {
        return val != null ? val : fallback;
    }

    private String coalesceStr(String val, String fallback) {
        return (val != null && !val.isBlank()) ? val.trim() : fallback;
    }
}
