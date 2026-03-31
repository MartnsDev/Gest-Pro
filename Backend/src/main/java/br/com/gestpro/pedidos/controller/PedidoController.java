package br.com.gestpro.pedidos.controller;


import br.com.gestpro.pedidos.dto.PedidoResponseDTO;
import br.com.gestpro.pedidos.dto.RegistrarPedidoDTO;
import br.com.gestpro.pedidos.dto.StatusPedido;
import br.com.gestpro.pedidos.service.PedidoServiceInterface;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Endpoints do módulo "Pedidos" — vendas rápidas sem caixa físico.
 *
 * Base: /api/v1/pedidos
 *
 * POST   /empresa/{empresaId}              → registrar pedido
 * GET    /empresa/{empresaId}              → listar pedidos da empresa
 * GET    /{id}                             → buscar por ID
 * PATCH  /{id}/status                     → atualizar status
 * POST   /{id}/cancelar                   → cancelar + devolver estoque
 * PATCH  /{id}/observacao                 → editar observação
 */
@RestController
@RequestMapping("/api/v1/pedidos")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoServiceInterface pedidoService;

    // ─── Registrar ───────────────────────────────────────────────────────

    @PostMapping("/empresa/{empresaId}")
    public ResponseEntity<PedidoResponseDTO> registrar(
            @PathVariable Long empresaId,
            @Valid @RequestBody RegistrarPedidoDTO dto,
            Authentication authentication) {

        dto.setEmailUsuario(authentication.getName());
        dto.setEmpresaId(empresaId);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new PedidoResponseDTO(pedidoService.registrarPedido(dto)));
    }

    // ─── Listar por empresa ──────────────────────────────────────────────

    @GetMapping("/empresa/{empresaId}")
    @Transactional(readOnly = true)
    public ResponseEntity<List<PedidoResponseDTO>> listarPorEmpresa(
            @PathVariable Long empresaId,
            Authentication authentication) {

        return ResponseEntity.ok(
                pedidoService.listarPorEmpresa(empresaId, authentication.getName())
                        .stream()
                        .map(PedidoResponseDTO::new)
                        .toList()
        );
    }

    // ─── Buscar por ID ───────────────────────────────────────────────────

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<PedidoResponseDTO> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(new PedidoResponseDTO(pedidoService.buscarPorId(id)));
    }

    // ─── Atualizar status ────────────────────────────────────────────────

    /**
     * Body: { "status": "ENVIADO" }
     * Valores aceitos: PENDENTE | CONFIRMADO | ENVIADO | ENTREGUE | CANCELADO
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<PedidoResponseDTO> atualizarStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {

        String statusStr = body.get("status");
        if (statusStr == null || statusStr.isBlank())
            return ResponseEntity.badRequest().build();

        StatusPedido novoStatus;
        try {
            novoStatus = StatusPedido.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(new PedidoResponseDTO(
                pedidoService.atualizarStatus(id, novoStatus, authentication.getName())
        ));
    }

    // ─── Cancelar ────────────────────────────────────────────────────────

    @PostMapping("/{id}/cancelar")
    public ResponseEntity<PedidoResponseDTO> cancelar(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            Authentication authentication) {

        String motivo = body != null ? body.getOrDefault("motivo", "") : "";
        return ResponseEntity.ok(new PedidoResponseDTO(
                pedidoService.cancelarPedido(id, motivo, authentication.getName())
        ));
    }

    // ─── Editar observação ───────────────────────────────────────────────

    @PatchMapping("/{id}/observacao")
    public ResponseEntity<PedidoResponseDTO> editarObservacao(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {

        String obs = body.getOrDefault("observacao", "");
        return ResponseEntity.ok(new PedidoResponseDTO(
                pedidoService.editarObservacao(id, obs, authentication.getName())
        ));
    }
}