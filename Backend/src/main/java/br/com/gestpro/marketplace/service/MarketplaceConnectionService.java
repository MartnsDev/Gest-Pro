package br.com.gestpro.marketplace.service;

import br.com.gestpro.empresa.model.Empresa;
import br.com.gestpro.empresa.repository.EmpresaRepository;
import br.com.gestpro.infra.exception.ApiException;
import br.com.gestpro.marketplace.model.MarketplaceConnection;
import br.com.gestpro.marketplace.model.MarketplaceProductLink;
import br.com.gestpro.marketplace.repository.MarketplaceConnectionRepository;
import br.com.gestpro.marketplace.repository.MarketplaceProductLinkRepository;
import br.com.gestpro.pedidos.CanalVenda;
import br.com.gestpro.produto.model.Produto;
import br.com.gestpro.produto.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class MarketplaceConnectionService {

    private static final Logger log = LoggerFactory.getLogger(MarketplaceConnectionService.class);
    private static final String PATH = "/api/v1/marketplace";
    private static final Set<CanalVenda> SUPORTADOS = Set.of(CanalVenda.SHOPEE, CanalVenda.MERCADO_LIVRE);

    private final MarketplaceConnectionRepository connectionRepository;
    private final MarketplaceProductLinkRepository linkRepository;
    private final EmpresaRepository empresaRepository;
    private final ProdutoRepository produtoRepository;

    // ─── Conexões ──────────────────────────────────────────────────────────────

    /**
     * Salva ou atualiza as credenciais de um marketplace para uma empresa.
     * Se já existir uma conexão (mesmo marketplace + empresa), ela é atualizada.
     */
    @Transactional
    public MarketplaceConnection conectar(
            Long empresaId,
            String emailUsuario,
            CanalVenda marketplace,
            String sellerId,
            String accessToken,
            String refreshToken,
            Long expiresInSeconds) {

        validarMarketplaceSuportado(marketplace);
        Empresa empresa = buscarEmpresaComPermissao(empresaId, emailUsuario);

        MarketplaceConnection conn = connectionRepository
                .findByEmpresaIdAndMarketplaceAndActiveTrue(empresaId, marketplace)
                .orElseGet(() -> {
                    MarketplaceConnection nova = new MarketplaceConnection();
                    nova.setEmpresa(empresa);
                    nova.setMarketplace(marketplace);
                    return nova;
                });

        conn.setSellerId(sellerId);
        conn.setAccessToken(accessToken);
        conn.setRefreshToken(refreshToken);
        conn.setTokenExpiresAt(expiresInSeconds != null
                ? LocalDateTime.now().plusSeconds(expiresInSeconds)
                : null);
        conn.setActive(true);

        MarketplaceConnection salva = connectionRepository.save(conn);
        log.info("Empresa {} conectou marketplace={} sellerId={}", empresa.getNomeFantasia(), marketplace, sellerId);
        return salva;
    }

    /**
     * Desativa a conexão (soft delete) — não apaga os vínculos de produto.
     */
    @Transactional
    public void desconectar(Long empresaId, String emailUsuario, CanalVenda marketplace) {
        validarMarketplaceSuportado(marketplace);
        buscarEmpresaComPermissao(empresaId, emailUsuario);

        MarketplaceConnection conn = connectionRepository
                .findByEmpresaIdAndMarketplaceAndActiveTrue(empresaId, marketplace)
                .orElseThrow(() -> new ApiException(
                        "Nenhuma conexão ativa com " + marketplace.name(), HttpStatus.NOT_FOUND, PATH));

        conn.setActive(false);
        connectionRepository.save(conn);
        log.info("Empresa {} desconectou marketplace={}", empresaId, marketplace);
    }

    @Transactional(readOnly = true)
    public List<MarketplaceConnection> listarConexoes(Long empresaId, String emailUsuario) {
        buscarEmpresaComPermissao(empresaId, emailUsuario);
        return connectionRepository.findByEmpresaIdAndActiveTrue(empresaId);
    }

    // ─── Vínculos produto ↔ anúncio ───────────────────────────────────────────

    /**
     * Cria ou atualiza o vínculo entre um produto interno e um anúncio do marketplace.
     */
    @Transactional
    public MarketplaceProductLink vincularProduto(
            Long empresaId,
            String emailUsuario,
            Long produtoId,
            CanalVenda marketplace,
            String anuncioId,
            String anuncioTitulo) {

        validarMarketplaceSuportado(marketplace);
        buscarEmpresaComPermissao(empresaId, emailUsuario);

        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new ApiException("Produto não encontrado", HttpStatus.NOT_FOUND, PATH));

        if (!produto.getEmpresa().getId().equals(empresaId))
            throw new ApiException("Produto não pertence a esta empresa.", HttpStatus.FORBIDDEN, PATH);

        // Se já existe um vínculo para este anúncio, atualiza
        MarketplaceProductLink link = linkRepository
                .findByMarketplaceAndAnuncioId(marketplace, anuncioId)
                .orElseGet(MarketplaceProductLink::new);

        link.setProduto(produto);
        link.setMarketplace(marketplace);
        link.setAnuncioId(anuncioId);
        link.setAnuncioTitulo(anuncioTitulo);

        MarketplaceProductLink salvo = linkRepository.save(link);
        log.info("Vínculo criado: marketplace={} anuncio={} → produto={}", marketplace, anuncioId, produto.getNome());
        return salvo;
    }

    @Transactional
    public void removerVinculo(Long empresaId, String emailUsuario, Long linkId) {
        buscarEmpresaComPermissao(empresaId, emailUsuario);
        MarketplaceProductLink link = linkRepository.findById(linkId)
                .orElseThrow(() -> new ApiException("Vínculo não encontrado", HttpStatus.NOT_FOUND, PATH));
        if (!link.getProduto().getEmpresa().getId().equals(empresaId))
            throw new ApiException("Sem permissão para este vínculo.", HttpStatus.FORBIDDEN, PATH);
        linkRepository.delete(link);
    }

    @Transactional(readOnly = true)
    public List<MarketplaceProductLink> listarVinculos(Long empresaId, String emailUsuario, CanalVenda marketplace) {
        buscarEmpresaComPermissao(empresaId, emailUsuario);
        return linkRepository.findByMarketplaceAndProduto_Empresa_Id(marketplace, empresaId);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private Empresa buscarEmpresaComPermissao(Long empresaId, String emailUsuario) {
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new ApiException("Empresa não encontrada", HttpStatus.NOT_FOUND, PATH));
        if (!empresa.getDono().getEmail().equals(emailUsuario))
            throw new ApiException("Sem permissão para esta empresa.", HttpStatus.FORBIDDEN, PATH);
        return empresa;
    }

    private void validarMarketplaceSuportado(CanalVenda marketplace) {
        if (!SUPORTADOS.contains(marketplace))
            throw new ApiException(
                    "Marketplace não suportado para integração: " + marketplace,
                    HttpStatus.BAD_REQUEST, PATH);
    }
}