package br.com.gestpro.marketplace.controller;

import br.com.gestpro.marketplace.model.MarketplaceConnection;
import br.com.gestpro.marketplace.model.MarketplaceProductLink;
import br.com.gestpro.marketplace.service.MarketplaceConnectionService;
import br.com.gestpro.pedidos.CanalVenda;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Endpoints de gestão de integrações (apenas usuários Premium).
 - POST   /empresa/{empresaId}/conectar            salva credenciais OAuth
 - DELETE /empresa/{empresaId}/desconectar         desativa conexão
 - GET    /empresa/{empresaId}/conexoes            lista conexões ativas
 - POST   /empresa/{empresaId}/vinculos            cria vínculo produto ↔ anúncio
 - GET    /empresa/{empresaId}/vinculos            lista vínculos (filtrado por marketplace)
 - DELETE /empresa/{empresaId}/vinculos/{linkId}   remove vínculo
 */
@RestController
@RequestMapping("/api/v1/marketplace")
@RequiredArgsConstructor
public class MarketplaceConnectionController {

    private final MarketplaceConnectionService service;

    //Conexões
    @PostMapping("/empresa/{empresaId}/conectar")
    public ResponseEntity<MarketplaceConnection> conectar(
            @PathVariable Long empresaId,
            @Valid @RequestBody ConectarRequest req,
            Authentication auth) {

        MarketplaceConnection conn = service.conectar(
                empresaId, auth.getName(),
                req.getMarketplace(), req.getSellerId(),
                req.getAccessToken(), req.getRefreshToken(),
                req.getExpiresInSeconds());

        return ResponseEntity.status(HttpStatus.CREATED).body(conn);
    }

    @DeleteMapping("/empresa/{empresaId}/desconectar")
    public ResponseEntity<Void> desconectar(
            @PathVariable Long empresaId,
            @RequestParam CanalVenda marketplace,
            Authentication auth) {

        service.desconectar(empresaId, auth.getName(), marketplace);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/empresa/{empresaId}/conexoes")
    public ResponseEntity<List<MarketplaceConnection>> listarConexoes(
            @PathVariable Long empresaId,
            Authentication auth) {

        return ResponseEntity.ok(service.listarConexoes(empresaId, auth.getName()));
    }

    // Vínculos

    @PostMapping("/empresa/{empresaId}/vinculos")
    public ResponseEntity<MarketplaceProductLink> vincular(
            @PathVariable Long empresaId,
            @Valid @RequestBody VincularRequest req,
            Authentication auth) {

        MarketplaceProductLink link = service.vincularProduto(
                empresaId, auth.getName(),
                req.getProdutoId(), req.getMarketplace(),
                req.getAnuncioId(), req.getAnuncioTitulo());

        return ResponseEntity.status(HttpStatus.CREATED).body(link);
    }

    @GetMapping("/empresa/{empresaId}/vinculos")
    public ResponseEntity<List<MarketplaceProductLink>> listarVinculos(
            @PathVariable Long empresaId,
            @RequestParam CanalVenda marketplace,
            Authentication auth) {

        return ResponseEntity.ok(service.listarVinculos(empresaId, auth.getName(), marketplace));
    }

    @DeleteMapping("/empresa/{empresaId}/vinculos/{linkId}")
    public ResponseEntity<Void> removerVinculo(
            @PathVariable Long empresaId,
            @PathVariable Long linkId,
            Authentication auth) {

        service.removerVinculo(empresaId, auth.getName(), linkId);
        return ResponseEntity.noContent().build();
    }

    //  Request bodies inline

    @Getter @Setter
    public static class ConectarRequest {
        @NotNull  private CanalVenda marketplace;
        @NotBlank private String sellerId;
        @NotBlank private String accessToken;
        private String refreshToken;
        private Long expiresInSeconds;
    }

    @Getter @Setter
    public static class VincularRequest {
        @NotNull  private Long produtoId;
        @NotNull  private CanalVenda marketplace;
        @NotBlank private String anuncioId;
        private String anuncioTitulo;
    }
}