package br.com.gestpro.gestpro_backend.api.controller.modules;

import br.com.gestpro.gestpro_backend.api.dto.modules.caixa.AbrirCaixaDTO;
import br.com.gestpro.gestpro_backend.api.dto.modules.caixa.CaixaDTO;
import br.com.gestpro.gestpro_backend.domain.service.modulesService.caixa.CaixaServiceInterface;
import br.com.gestpro.gestpro_backend.infra.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/caixas")
public class CaixaController {

    private final CaixaServiceInterface caixaService;

    public CaixaController(CaixaServiceInterface caixaService) {
        this.caixaService = caixaService;
    }

    /**
     * Abre um novo caixa
     * POST /api/caixas/abrir
     */
    @PostMapping("/abrir")
    public ResponseEntity<?> abrirCaixa(@RequestBody AbrirCaixaDTO dto) {
        try {
            CaixaDTO caixaDTO = caixaService.abrirCaixa(dto.getEmailUsuario(), BigDecimal.valueOf(dto.getSaldoInicial()));
            return ResponseEntity.status(HttpStatus.CREATED).body(caixaDTO);
        } catch (ApiException e) {
            // Retorna objeto com mensagem e caminho do erro
            return ResponseEntity.status(e.getStatus()).body(
                    Map.of(
                            "sucesso", false,
                            "mensagem", e.getMessage(),
                            "path", e.getPath()
                    )
            );
        }
    }


    /**
     * Fecha um caixa existente
     * POST /api/caixas/fechar/{id}
     */
    @PostMapping("/fechar/{id}")
    public ResponseEntity<CaixaDTO> fecharCaixa(@PathVariable Long id) {
        try {
            CaixaDTO caixaDTO = caixaService.fecharCaixa(id);
            return ResponseEntity.ok(caixaDTO);
        } catch (ApiException e) {
            return ResponseEntity.status(e.getStatus()).body(null);
        }
    }


    /**
     * Busca o caixa aberto de um usuário
     * GET /api/caixas/aberto?emailUsuario=...
     */
    @GetMapping("/aberto")
    public ResponseEntity<CaixaDTO> buscarCaixaAberto(@RequestParam String emailUsuario) {
        try {
            CaixaDTO caixaDTO = caixaService.buscarCaixaAberto(emailUsuario);
            return ResponseEntity.ok(caixaDTO);
        } catch (ApiException e) {
            return ResponseEntity.status(e.getStatus()).body(null);
        }
    }
}
