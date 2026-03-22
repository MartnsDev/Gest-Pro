package br.com.gestpro.venda.controller;

import br.com.gestpro.venda.dto.RegistrarVendaDTO;
import br.com.gestpro.venda.dto.VendaResponseDTO;
import br.com.gestpro.venda.model.Venda;
import br.com.gestpro.venda.service.VendaServiceInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/vendas")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor
public class VendaController {

    private final VendaServiceInterface vendaService;

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
        return ResponseEntity.ok(
                vendaService.listarPorCaixa(idCaixa)
                        .stream().map(VendaResponseDTO::new).toList()
        );
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<VendaResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(new VendaResponseDTO(vendaService.buscarPorId(id)));
    }

    /** Cancela uma venda e devolve o estoque */
    @PostMapping("/{id}/cancelar")
    public ResponseEntity<VendaResponseDTO> cancelar(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            Authentication authentication) {
        String motivo = body != null ? body.getOrDefault("motivo", "") : "";
        return ResponseEntity.ok(new VendaResponseDTO(
                vendaService.cancelarVenda(id, motivo, authentication.getName())
        ));
    }

    /** Edita apenas a observação da venda */
    @PatchMapping("/{id}/observacao")
    public ResponseEntity<VendaResponseDTO> editarObservacao(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        String obs = body.getOrDefault("observacao", "");
        return ResponseEntity.ok(new VendaResponseDTO(
                vendaService.editarObservacao(id, obs, authentication.getName())
        ));
    }
}