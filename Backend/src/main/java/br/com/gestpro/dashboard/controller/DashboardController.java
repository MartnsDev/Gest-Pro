package br.com.gestpro.dashboard.controller;

import br.com.gestpro.dashboard.dto.DashboardVisaoGeralResponse;
import br.com.gestpro.dashboard.dto.MetodoPagamentoDTO;
import br.com.gestpro.dashboard.dto.ProdutoVendasDTO;
import br.com.gestpro.dashboard.dto.VendasDiariasDTO;
import br.com.gestpro.dashboard.service.DashboardServiceInterface;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class DashboardController {

    private final DashboardServiceInterface dashboardService;

    public DashboardController(DashboardServiceInterface dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/visao-geral")
    public ResponseEntity<DashboardVisaoGeralResponse> getVisaoGeral(Authentication authentication) {
        return ResponseEntity.ok(dashboardService.visaoGeral(getEmail(authentication)));
    }

    @GetMapping("/vendas/metodo-pagamento")
    public ResponseEntity<List<MetodoPagamentoDTO>> vendasPorMetodoPagamento(Authentication authentication) {
        return ResponseEntity.ok(dashboardService.vendasPorMetodoPagamento(getEmail(authentication)));
    }

    @GetMapping("/vendas/produto")
    public ResponseEntity<List<ProdutoVendasDTO>> vendasPorProduto(Authentication authentication) {
        return ResponseEntity.ok(dashboardService.vendasPorProduto(getEmail(authentication)));
    }

    @GetMapping("/vendas/diarias")
    public ResponseEntity<List<VendasDiariasDTO>> vendasDiariasSemana(Authentication authentication) {
        return ResponseEntity.ok(dashboardService.vendasDiariasSemana(getEmail(authentication)));
    }

    private String getEmail(Authentication authentication) {
        if (authentication == null) {
            throw new RuntimeException("Usuário não autenticado");
        }
        return authentication.getName();
    }
}