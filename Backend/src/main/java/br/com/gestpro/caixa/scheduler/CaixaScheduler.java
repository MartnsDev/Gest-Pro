package br.com.gestpro.caixa.scheduler;

import br.com.gestpro.caixa.model.Caixa;
import br.com.gestpro.caixa.repository.CaixaRepository;
import br.com.gestpro.caixa.service.CaixaServiceInterface;
import br.com.gestpro.caixa.dto.caixa.FecharCaixaRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class CaixaScheduler {

    private final CaixaRepositoryScheduler caixaRepository;
    private final CaixaServiceInterface caixaService;

    /**
     * Executa a cada hora para verificar caixas abertos há mais de 24 horas.
     * Cron: a cada hora em ponto  →  "0 0 * * * *"
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void fecharCaixasExpirados() {
        LocalDateTime limite = LocalDateTime.now().minusHours(24);

        List<Caixa> expirados = caixaRepository
                .findByAbertoTrueAndDataAberturaLessThanEqual(limite);

        if (expirados.isEmpty()) {
            return;
        }

        log.info("[CaixaScheduler] {} caixa(s) aberto(s) há mais de 24h — fechando automaticamente.",
                expirados.size());

        for (Caixa caixa : expirados) {
            try {
                FecharCaixaRequest req = new FecharCaixaRequest();
                req.setCaixaId(caixa.getId());
                req.setEmailUsuario("sistema@gestpro.auto");
                req.setObservacao("Fechamento automático após 24 horas sem atividade.");

                caixaService.fecharCaixa(req);

                log.info("[CaixaScheduler] Caixa #{} (empresa #{}) fechado automaticamente. Aberto em: {}",
                        caixa.getId(), caixa.getEmpresa().getId(), caixa.getDataAbertura());

            } catch (Exception e) {
                log.error("[CaixaScheduler] Erro ao fechar caixa #{}: {}", caixa.getId(), e.getMessage(), e);
            }
        }
    }
}