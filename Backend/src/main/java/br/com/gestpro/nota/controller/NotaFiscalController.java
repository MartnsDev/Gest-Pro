package br.com.gestpro.nota.controller;

import br.com.gestpro.nota.NotaFiscalStatus;
import br.com.gestpro.nota.dto.*;
import br.com.gestpro.nota.model.*;
import br.com.gestpro.nota.service.NotaFiscalInterface;
import br.com.gestpro.nota.service.NotaFiscalServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.YearMonth;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/nota-fiscal")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class NotaFiscalController {

    private final NotaFiscalInterface notaFiscalService;
    private final NotaFiscalServiceImpl notaFiscalServiceImpl;

    // =====================================================================
    // CRUD
    // =====================================================================

    @PostMapping
    public ResponseEntity<ApiResponse<NotaFiscal>> criar(@RequestBody CriarNotaRequest request) {
        try {
            NotaFiscal nota = notaFiscalService.criar(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(nota));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.erro(e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NotaFiscal>> buscarPorId(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(ApiResponse.ok(notaFiscalService.buscarPorId(id)));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotaFiscalResumoResponse>>> listar(
            @RequestParam Long empresaId,
            @RequestParam(required = false) NotaFiscalStatus status
    ) {
        return ResponseEntity.ok(ApiResponse.ok(notaFiscalService.listar(empresaId, status)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> excluir(@PathVariable Long id) {
        try {
            notaFiscalService.excluir(id);
            return ResponseEntity.ok(ApiResponse.ok(null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.erro(e.getMessage()));
        }
    }

    // =====================================================================
    // CICLO DE VIDA
    // =====================================================================

    @PostMapping("/{id}/emitir")
    public ResponseEntity<ApiResponse<NotaFiscal>> emitir(@PathVariable Long id) {
        try {
            NotaFiscal nota = notaFiscalService.emitir(id);
            return ResponseEntity.ok(ApiResponse.ok(nota));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                    .body(ApiResponse.erro(e.getMessage()));
        }
    }

    @PostMapping("/cancelar")
    public ResponseEntity<ApiResponse<NotaFiscal>> cancelar(@RequestBody CancelarNotaRequest request) {
        try {
            NotaFiscal nota = notaFiscalService.cancelar(request);
            return ResponseEntity.ok(ApiResponse.ok(nota));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.erro(e.getMessage()));
        }
    }

    @PostMapping("/inutilizar")
    public ResponseEntity<ApiResponse<Void>> inutilizar(@RequestBody InutilizarRequest request) {
        try {
            notaFiscalService.inutilizar(request);
            return ResponseEntity.ok(ApiResponse.ok(null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.erro(e.getMessage()));
        }
    }

    @PostMapping("/transmitir-contingencias")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> transmitirContingencias(@RequestParam Long empresaId) {
        int qtd = notaFiscalService.transmitirContingencias(empresaId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("transmitidas", qtd)));
    }

    // =====================================================================
    // DOWNLOADS
    // =====================================================================

    @GetMapping("/{id}/xml")
    public ResponseEntity<byte[]> baixarXml(@PathVariable Long id) {
        try {
            byte[] xml = notaFiscalService.baixarXml(id);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_XML);
            headers.setContentDisposition(ContentDisposition.attachment().filename("nfe-" + id + ".xml").build());
            return ResponseEntity.ok().headers(headers).body(xml);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/danfe")
    public ResponseEntity<byte[]> baixarDanfe(@PathVariable Long id) {
        try {
            byte[] pdf = notaFiscalService.gerarDanfePdf(id);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.attachment().filename("danfe-" + id + ".pdf").build());
            return ResponseEntity.ok().headers(headers).body(pdf);
        } catch (UnsupportedOperationException e) {
            return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // =====================================================================
    // ÁREA DO CONTADOR
    // =====================================================================

    @GetMapping("/exportar/xml-mensal")
    public ResponseEntity<byte[]> exportarXmlsMensal(
            @RequestParam Long empresaId,
            @RequestParam String periodo // formato: yyyy-MM
    ) {
        try {
            YearMonth ym = YearMonth.parse(periodo);
            byte[] zip = notaFiscalService.gerarZipXmlsMensal(empresaId, ym);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.valueOf("application/zip"));
            headers.setContentDisposition(ContentDisposition.attachment()
                    .filename("xmls-" + periodo + ".zip").build());
            return ResponseEntity.ok().headers(headers).body(zip);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/exportar/sped")
    public ResponseEntity<byte[]> exportarSped(
            @RequestParam Long empresaId,
            @RequestParam String periodo,
            @RequestParam String tipo
    ) {
        try {
            YearMonth ym = YearMonth.parse(periodo);
            byte[] sped = notaFiscalService.gerarArquivoSped(empresaId, ym, tipo);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.TEXT_PLAIN);
            headers.setContentDisposition(ContentDisposition.attachment()
                    .filename("sped-" + tipo + "-" + periodo + ".txt").build());
            return ResponseEntity.ok().headers(headers).body(sped);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
        }
    }

    // =====================================================================
    // CERTIFICADO DIGITAL
    // =====================================================================

    @PostMapping("/certificado/{empresaId}")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadCertificado(
            @PathVariable Long empresaId,
            @RequestParam("arquivo") MultipartFile arquivo,
            @RequestParam("senha") String senha
    ) {
        try {
            byte[] pfxBytes = arquivo.getBytes();
            notaFiscalServiceImpl.registrarCertificado(empresaId, pfxBytes, senha);
            Map<String, String> info = notaFiscalServiceImpl
                    .getAssinaturaService().getInfoCertificado(pfxBytes, senha);
            return ResponseEntity.ok(ApiResponse.ok(info));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.erro(e.getMessage()));
        }
    }

    // =====================================================================
    // CONSULTAS AUXILIARES
    // =====================================================================
    @GetMapping("/cep/{cep}")
    public ResponseEntity<Object> consultarCep(@PathVariable String cep) {
        Object resultado = notaFiscalService.consultarCep(cep);
        return resultado != null ? ResponseEntity.ok(resultado) : ResponseEntity.notFound().build();
    }

    @GetMapping("/cnpj/{cnpj}")
    public ResponseEntity<Object> consultarCnpj(@PathVariable String cnpj) {
        Object resultado = notaFiscalService.consultarCnpj(cnpj);
        return resultado != null ? ResponseEntity.ok(resultado) : ResponseEntity.notFound().build();
    }

    @GetMapping("/chave/{chaveAcesso}")
    public ResponseEntity<ApiResponse<NotaFiscal>> buscarPorChave(@PathVariable String chaveAcesso) {
        try {
            return ResponseEntity.ok(ApiResponse.ok(notaFiscalService.buscarPorChaveAcesso(chaveAcesso)));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/estatisticas")
    public ResponseEntity<ApiResponse<EstatisticasResponse>> getEstatisticas(
            @RequestParam Long empresaId
    ) {
        return ResponseEntity.ok(ApiResponse.ok(notaFiscalService.getEstatisticas(empresaId)));
    }
}