package br.com.gestpro.nota.service.validacoes;

import br.com.gestpro.nota.NotaFiscalStatus;
import br.com.gestpro.nota.dto.EmpresaInfo;
import br.com.gestpro.nota.dto.ItemCalc;
import br.com.gestpro.nota.dto.NotaFiscalDTOs;
import br.com.gestpro.nota.model.ItemNotaFiscal;
import br.com.gestpro.nota.model.NotaFiscal;
import br.com.gestpro.nota.repository.ItemNotaFiscalRepository;
import br.com.gestpro.nota.repository.NotaFiscalRepository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class Criar {

    private final ItemNotaFiscalRepository itemRepo;
    private final BuscaPorId buscarPorId;
    private final NotaFiscalRepository notaRepo;

    public Criar(ItemNotaFiscalRepository itemRepo, BuscaPorId buscarPorId, NotaFiscalRepository notaRepo) {
        this.itemRepo = itemRepo;
        this.buscarPorId = buscarPorId;
        this.notaRepo = notaRepo;
    }

    @Transactional
    public Map<String, Object> criar(NotaFiscalDTOs.CriarNotaFiscalDTO dto, String usuarioId) {
        EmpresaInfo empresa = buscarDadosEmpresa(dto.getEmpresaId());
        String numero = gerarNumeroNota(dto.getEmpresaId());

        List<ItemCalc> itensCalc = dto.getItens().stream().map(item -> {
            BigDecimal descPct = item.getDesconto() != null ? item.getDesconto() : BigDecimal.ZERO;
            BigDecimal base    = item.getQuantidade().multiply(item.getValorUnitario());
            BigDecimal descVal = base.multiply(descPct).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            BigDecimal total   = base.subtract(descVal).setScale(2, RoundingMode.HALF_UP);
            return new ItemCalc(item, total);
        }).toList();

        BigDecimal subtotal     = itensCalc.stream().map(i -> i.total()).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal descontoPct  = dto.getDesconto()  != null ? dto.getDesconto()  : BigDecimal.ZERO;
        BigDecimal valorDesc    = subtotal.multiply(descontoPct).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal baseCalculo  = subtotal.subtract(valorDesc);
        BigDecimal impostosPct  = dto.getImpostos()  != null ? dto.getImpostos()  : BigDecimal.ZERO;
        BigDecimal valorImp     = baseCalculo.multiply(impostosPct).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal total        = baseCalculo.add(valorImp).setScale(2, RoundingMode.HALF_UP);

        NotaFiscal nota = NotaFiscal.builder()
                .numero(numero)
                .tipo(dto.getTipo())
                .status(NotaFiscalStatus.RASCUNHO)
                .empresaId(dto.getEmpresaId())
                .empresaNome(empresa.nome())
                .empresaCnpj(empresa.cnpj())
                .empresaInscricaoEstadual(empresa.inscricaoEstadual())
                .empresaEndereco(empresa.endereco())
                .empresaCidade(empresa.cidade())
                .empresaEstado(empresa.estado())
                .empresaCep(empresa.cep())
                .empresaTelefone(empresa.telefone())
                .empresaEmail(empresa.email())
                .clienteId(dto.getClienteId())
                .clienteNome(dto.getClienteNome())
                .clienteCpfCnpj(dto.getClienteCpfCnpj())
                .clienteEmail(dto.getClienteEmail())
                .clienteTelefone(dto.getClienteTelefone())
                .clienteEndereco(dto.getClienteEndereco())
                .clienteCidade(dto.getClienteCidade())
                .clienteEstado(dto.getClienteEstado())
                .clienteCep(dto.getClienteCep())
                .subtotal(subtotal)
                .desconto(descontoPct)
                .valorDesconto(valorDesc)
                .impostos(impostosPct)
                .valorImpostos(valorImp)
                .total(total)
                .formaPagamento(dto.getFormaPagamento())
                .vendaId(dto.getVendaId())
                .observacoes(dto.getObservacoes())
                .build();

        NotaFiscal salva = notaRepo.save(nota);

        itensCalc.forEach(ic -> {
            NotaFiscalDTOs.CriarItemNotaDTO i = ic.dto();
            itemRepo.save(ItemNotaFiscal.builder()
                    .notaFiscalId(salva.getId())
                    .produtoId(i.getProdutoId())
                    .descricao(i.getDescricao())
                    .codigo(i.getCodigo())
                    .ncm(i.getNcm())
                    .cfop(i.getCfop() != null ? i.getCfop() : "5102")
                    .unidade(i.getUnidade() != null ? i.getUnidade() : "UN")
                    .quantidade(i.getQuantidade())
                    .valorUnitario(i.getValorUnitario())
                    .desconto(i.getDesconto()  != null ? i.getDesconto()  : BigDecimal.ZERO)
                    .icms(i.getIcms()          != null ? i.getIcms()      : BigDecimal.ZERO)
                    .pis(i.getPis()            != null ? i.getPis()       : BigDecimal.ZERO)
                    .cofins(i.getCofins()      != null ? i.getCofins()    : BigDecimal.ZERO)
                    .valorTotal(ic.total())
                    .build());
        });

        return buscarPorId.buscarPorId(salva.getId());
    }

    private EmpresaInfo buscarDadosEmpresa(String empresaId) {
        // TODO: injete seu EmpresaRepository e busque pelo empresaId
        return new EmpresaInfo("GestPro Empresa", "", "", "", "", "", "", "", "");
    }

    private String gerarNumeroNota(String empresaId) {
        int ano    = LocalDateTime.now().getYear();
        long count = notaRepo.countByEmpresaId(empresaId);
        return "NF-" + ano + "-" + String.format("%06d", count + 1);
    }
}



