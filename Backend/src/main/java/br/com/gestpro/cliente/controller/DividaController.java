package br.com.gestpro.cliente.controller;

import br.com.gestpro.cliente.dto.DividaDTO;
import br.com.gestpro.cliente.dto.DividaRequest;
import br.com.gestpro.cliente.service.DividaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/dividas")
@RequiredArgsConstructor
public class DividaController {

    private final DividaService dividaService;

    @PostMapping
    public ResponseEntity<DividaDTO> criar(@RequestBody DividaRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(dividaService.criar(req));
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<DividaDTO>> listar(@PathVariable Long clienteId) {
        return ResponseEntity.ok(dividaService.listarPorCliente(clienteId));
    }

    @PatchMapping("/{id}/pagamento")
    public ResponseEntity<DividaDTO> pagar(
            @PathVariable Long id,
            @RequestParam BigDecimal valor) {
        return ResponseEntity.ok(dividaService.registrarPagamento(id, valor));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        dividaService.excluir(id);
        return ResponseEntity.noContent().build();
    }
}