package br.com.gestpro.venda.controller;

import br.com.gestpro.venda.dto.RegistrarVendaDTO;
import br.com.gestpro.venda.dto.VendaResponseDTO;
import br.com.gestpro.venda.model.Venda;
import br.com.gestpro.venda.service.VendaServiceInterface;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendas")
public class VendaController {

    private final VendaServiceInterface vendaService;

    public VendaController(VendaServiceInterface vendaService) {
        this.vendaService = vendaService;
    }

    @PostMapping("/registrar")
    public ResponseEntity<VendaResponseDTO> registrarVenda(@RequestBody RegistrarVendaDTO dto) {
        Venda venda = vendaService.registrarVenda(dto);
        return ResponseEntity.ok(new VendaResponseDTO(venda));
    }

    @GetMapping("/caixa/{idCaixa}")
    public ResponseEntity<List<VendaResponseDTO>> listarPorCaixa(@PathVariable Long idCaixa) {
        List<VendaResponseDTO> vendas = vendaService.listarPorCaixa(idCaixa)
                .stream()
                .map(VendaResponseDTO::new)
                .toList();
        return ResponseEntity.ok(vendas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VendaResponseDTO> buscarPorId(@PathVariable Long id) {
        Venda venda = vendaService.buscarPorId(id);
        return ResponseEntity.ok(new VendaResponseDTO(venda));
    }
}
