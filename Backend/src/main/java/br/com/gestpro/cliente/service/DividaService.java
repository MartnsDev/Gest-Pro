package br.com.gestpro.cliente.service;

import br.com.gestpro.cliente.dto.DividaDTO;
import br.com.gestpro.cliente.dto.DividaRequest;
import br.com.gestpro.cliente.model.Cliente;
import br.com.gestpro.cliente.model.Divida;
import br.com.gestpro.cliente.repository.ClienteRepository;
import br.com.gestpro.cliente.repository.DividaRepository;
import br.com.gestpro.empresa.model.Empresa;
import br.com.gestpro.empresa.repository.EmpresaRepository;
import br.com.gestpro.infra.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DividaService {

    private final DividaRepository dividaRepository;
    private final ClienteRepository clienteRepository;
    private final EmpresaRepository empresaRepository;

    public DividaDTO criar(DividaRequest req) {
        Cliente cliente = clienteRepository.findById(req.getClienteId())
                .orElseThrow(() -> new ApiException("Cliente não encontrado",
                        HttpStatus.NOT_FOUND, "/dividas"));
        Empresa empresa = empresaRepository.findById(req.getEmpresaId())
                .orElseThrow(() -> new ApiException("Empresa não encontrada",
                        HttpStatus.NOT_FOUND, "/dividas"));

        Divida d = new Divida();
        d.setCliente(cliente);
        d.setEmpresa(empresa);
        d.setDescricao(req.getDescricao());
        d.setValor(req.getValor());
        d.setVencimento(req.getVencimento());

        return new DividaDTO(dividaRepository.save(d));
    }

    public List<DividaDTO> listarPorCliente(Long clienteId) {
        return dividaRepository
                .findByClienteIdOrderByStatusAscCriadoEmDesc(clienteId)
                .stream().map(DividaDTO::new).toList();
    }

    public DividaDTO registrarPagamento(Long id, BigDecimal valor) {
        Divida d = dividaRepository.findById(id)
                .orElseThrow(() -> new ApiException("Dívida não encontrada",
                        HttpStatus.NOT_FOUND, "/dividas/" + id));

        BigDecimal novoPago = d.getValorPago().add(valor);
        d.setValorPago(novoPago);

        if (novoPago.compareTo(d.getValor()) >= 0) {
            d.setStatus(Divida.StatusDivida.QUITADA);
            d.setQuitadoEm(LocalDateTime.now());
        } else {
            d.setStatus(Divida.StatusDivida.PARCIAL);
        }

        return new DividaDTO(dividaRepository.save(d));
    }

    public void excluir(Long id) {
        dividaRepository.deleteById(id);
    }
}