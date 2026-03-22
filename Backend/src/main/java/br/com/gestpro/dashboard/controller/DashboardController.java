package br.com.gestpro.dashboard.controller;

import br.com.gestpro.dashboard.dto.*;
import br.com.gestpro.dashboard.service.DashboardServiceInterface;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardServiceInterface dashboardService;

    @GetMapping("/visao-geral")
    public ResponseEntity<DashboardVisaoGeralResponse> getVisaoGeral(
            @RequestParam Long empresaId,
            Authentication authentication) {
        return ResponseEntity.ok(dashboardService.visaoGeral(empresaId, authentication.getName()));
    }

    @GetMapping("/vendas/metodo-pagamento")
    public ResponseEntity<List<MetodoPagamentoDTO>> vendasPorMetodoPagamento(
            @RequestParam Long empresaId,
            Authentication authentication) {
        return ResponseEntity.ok(dashboardService.vendasPorMetodoPagamento(empresaId, authentication.getName()));
    }


    @GetMapping("/vendas/produto")
    public ResponseEntity<List<ProdutoVendasDTO>> vendasPorProduto(
            @RequestParam Long empresaId,
            Authentication authentication) {
        return ResponseEntity.ok(dashboardService.vendasPorProduto(empresaId, authentication.getName()));
    }

    @GetMapping("/vendas/diarias")
    public ResponseEntity<List<VendasDiariasDTO>> vendasDiariasSemana(
            @RequestParam Long empresaId,
            Authentication authentication) {
        return ResponseEntity.ok(dashboardService.vendasDiariasSemana(empresaId, authentication.getName()));
    }


    @GetMapping("/vendas/plano-usuario")
    public ResponseEntity<PlanoDTO> buscarPlanoUsuarioLogado(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        PlanoDTO plano = dashboardService.planoUsuarioLogado(authentication.getName());
        return ResponseEntity.ok(plano);
    }
}