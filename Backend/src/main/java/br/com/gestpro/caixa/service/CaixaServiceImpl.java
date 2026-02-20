package br.com.gestpro.caixa.service;

import br.com.gestpro.caixa.dto.caixa.AbrirCaixaRequest;
import br.com.gestpro.caixa.dto.caixa.CaixaResponse;
import br.com.gestpro.caixa.dto.caixa.FecharCaixaRequest;
import br.com.gestpro.caixa.StatusCaixa;
import br.com.gestpro.caixa.model.Caixa;
import br.com.gestpro.caixa.repository.CaixaRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CaixaServiceImpl implements CaixaServiceInterface {

    private static final Logger log = LoggerFactory.getLogger(CaixaServiceImpl.class);

    private final CaixaRepository caixaRepository;
    private final ApplicationEventPublisher eventPublisher; // opcional, caso você publique eventos


    @Override
    @Transactional
    public CaixaResponse abrirCaixa(AbrirCaixaRequest req) {
        log.info("Solicitação de abertura de caixa iniciada. abertoPor={}, saldoInicial={}",
                req.getAbertoPor(), req.getSaldoInicial());

        // verifica se já existe caixa aberto
        Optional<Caixa> ultimo = caixaRepository.findTopByOrderByDataAberturaDesc();
        if (ultimo.isPresent() && Boolean.TRUE.equals(ultimo.get().getAberto())) {
            log.warn("Tentativa de abrir caixa quando já existe um aberto. caixaId={}", ultimo.get().getId());
            throw new IllegalStateException("Já existe um caixa aberto.");
        }

        Caixa caixa = new Caixa();
        caixa.setDataAbertura(LocalDateTime.now());
        caixa.setValorInicial(req.getSaldoInicial());
        caixa.setAberto(true);
        caixa.setStatus(StatusCaixa.ABERTO);


        caixa.setAbertoPor(req.getAbertoPor());

        caixa.setTotalVendas(BigDecimal.ZERO);

        Caixa salvo = caixaRepository.save(caixa);

        log.info("Caixa aberto com sucesso. caixaId={}", salvo.getId());
        return mapToResponse(salvo);
    }


    @Override
    @Transactional
    public CaixaResponse fecharCaixa(FecharCaixaRequest req) {
        log.info("Solicitação de fechamento de caixa iniciada. caixaId={}, fechadoPor={}, valorFinal={}",
                req.getCaixaId(), req.getFechadoPor(), req.getSaldoFinal());

        Caixa caixa = caixaRepository.findById(req.getCaixaId())
                .orElseThrow(() -> new EntityNotFoundException("Caixa não encontrado com id: " + req.getCaixaId()));

        if (!Boolean.TRUE.equals(caixa.getAberto())) {
            log.warn("Tentativa de fechar caixa já fechado. caixaId={}", caixa.getId());
            throw new IllegalStateException("Caixa já está fechado.");
        }

        try {
            caixa.recalcularTotalVendas();

            caixa.setValorFinal(req.getSaldoFinal());
            caixa.setDataFechamento(LocalDateTime.now());
            caixa.setAberto(false);
            caixa.setStatus(StatusCaixa.FECHADO);

            if (req.getFechadoPor() != null) {
                caixa.setFechadoPor(req.getFechadoPor());
            }

            Caixa salvo;
            try {
                salvo = caixaRepository.saveAndFlush(caixa);
            } catch (ObjectOptimisticLockingFailureException ex) {
                log.warn("Object optimistic lock ao fechar caixa. caixaId={}", caixa.getId(), ex);
                throw new OptimisticLockingFailureException("Conflito ao fechar caixa (object lock). Tente novamente.", ex);
            } catch (OptimisticLockingFailureException ex) {
                log.warn("Optimistic lock ao fechar caixa. caixaId={}", caixa.getId(), ex);
                throw new OptimisticLockingFailureException("Conflito ao fechar caixa. Tente novamente.", ex);
            }

            log.info("Caixa fechado com sucesso. caixaId={}", salvo.getId());

            try {
                eventPublisher.publishEvent(new CaixaFechadoEvent(this, salvo.getId()));
            } catch (Exception e) {
                log.debug("Falha ao publicar CaixaFechadoEvent: {}", e.getMessage());
            }

            return mapToResponse(salvo);

        } catch (RuntimeException ex) {
            log.error("Erro ao tentar fechar caixa. caixaId={}, causa={}", req.getCaixaId(), ex.getMessage());
            throw ex;
        }
    }


    @Override
    @Transactional(readOnly = true)
    public CaixaResponse obterResumo(Long caixaId) {
        Caixa caixa = caixaRepository.findById(caixaId)
                .orElseThrow(() -> new EntityNotFoundException("Caixa não encontrado com id: " + caixaId));

        // garante total atualizado
        caixa.recalcularTotalVendas();
        return mapToResponse(caixa);
    }

    /* ------------------ mappers ------------------ */

    private CaixaResponse mapToResponse(Caixa caixa) {
        if (caixa == null) return null;

        Long usuarioId = null;
        if (caixa.getUsuario() != null) {
            usuarioId = caixa.getUsuario().getId();
        }

        return CaixaResponse.builder()
                .id(caixa.getId())
                .dataAbertura(caixa.getDataAbertura())
                .dataFechamento(caixa.getDataFechamento())
                .valorInicial(caixa.getValorInicial())
                .valorFinal(caixa.getValorFinal())
                .totalVendas(caixa.getTotalVendas())
                .status(caixa.getStatus() != null ? caixa.getStatus().name() : null)
                .aberto(caixa.getAberto())
                .usuarioId(usuarioId)
                .build();
    }

    /* ------------------ eventos simples (POJOs) ------------------ */

    public static class CaixaAbertoEvent {
        private final Object source;
        private final Long caixaId;

        public CaixaAbertoEvent(Object source, Long caixaId) {
            this.source = source;
            this.caixaId = caixaId;
        }

        public Object getSource() {
            return source;
        }

        public Long getCaixaId() {
            return caixaId;
        }
    }

    public static class CaixaFechadoEvent {
        private final Object source;
        private final Long caixaId;

        public CaixaFechadoEvent(Object source, Long caixaId) {
            this.source = source;
            this.caixaId = caixaId;
        }

        public Object getSource() {
            return source;
        }

        public Long getCaixaId() {
            return caixaId;
        }
    }
}
