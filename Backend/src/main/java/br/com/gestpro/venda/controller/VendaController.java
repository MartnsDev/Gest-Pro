package br.com.gestpro.venda.controller;

import br.com.gestpro.venda.dto.RegistrarVendaDTO;
import br.com.gestpro.venda.dto.VendaResponseDTO;
import br.com.gestpro.venda.model.Venda;
import br.com.gestpro.venda.service.VendaServiceInterface;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/vendas")
public class VendaController {

    private final VendaServiceInterface vendaService;

    public VendaController(VendaServiceInterface vendaService) {
        this.vendaService = vendaService;
    }

    @PostMapping("/registrar")
    public ResponseEntity<VendaResponseDTO> registrarVenda(
            @RequestBody RegistrarVendaDTO dto,
            Authentication authentication) {
        dto.setEmailUsuario(authentication.getName());
        Venda venda = vendaService.registrarVenda(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(new VendaResponseDTO(venda));
    }

    @GetMapping("/caixa/{idCaixa}")
    @Transactional(readOnly = true)
    public ResponseEntity<List<VendaResponseDTO>> listarPorCaixa(@PathVariable Long idCaixa) {
        List<VendaResponseDTO> vendas = vendaService.listarPorCaixa(idCaixa)
                .stream()
                .map(VendaResponseDTO::new)
                .toList();
        return ResponseEntity.ok(vendas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VendaResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(new VendaResponseDTO(vendaService.buscarPorId(id)));
    }
}