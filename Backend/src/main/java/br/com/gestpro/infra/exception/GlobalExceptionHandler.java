package br.com.gestpro.infra.exception;

import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

    // =====================================================
    // 1. Exceção personalizada da API
    // =====================================================
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<RetornoErroAPI> handleApiException(ApiException ex) {

        RetornoErroAPI erro = new RetornoErroAPI(
                false, // sucesso
                ex.getMessage(), // mensagem de erro personalizada
                ex.getStatus().value(), // status HTTP definido na exceção
                ex.getPath(), // endpoint onde ocorreu o erro
                LocalDateTime.now(), // momento do erro
                ex.getDetalhes() != null ? (ex.getDetalhes() instanceof List<?> ? (List<String>) ex.getDetalhes() : null) : null
        );

        return new ResponseEntity<>(erro, ex.getStatus());
    }

    // =====================================================
    // 2. Validação de DTO (@Valid / @Validated)
    // Captura erros de validação de campos
    // =====================================================
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<RetornoErroAPI> handleValidationExceptions(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {

        // Mapeia cada campo que falhou na validação
        List<String> erros = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.toList());

        RetornoErroAPI retorno = new RetornoErroAPI(
                false,
                "Erro de validação",
                400,
                request.getRequestURI(),
                LocalDateTime.now(),
                erros
        );

        return ResponseEntity.badRequest().body(retorno);
    }

    // =====================================================
    // 3. Recursos não encontrados
    // EntityNotFoundException ou NoSuchElementException
    // =====================================================
    @ExceptionHandler({EntityNotFoundException.class, NoSuchElementException.class})
    public ResponseEntity<RetornoErroAPI> handleNotFoundException(Exception ex, HttpServletRequest request) {

        RetornoErroAPI retorno = new RetornoErroAPI(
                false,
                ex.getMessage(),
                404,
                request.getRequestURI(),
                LocalDateTime.now(),
                null
        );

        return ResponseEntity.status(404).body(retorno);
    }

    // =====================================================
    // 4. Falhas de autenticação e autorização (Spring Security)
    // AuthenticationException -> 401
    // AccessDeniedException -> 403
    // =====================================================
    @ExceptionHandler({AuthenticationException.class, AccessDeniedException.class})
    public ResponseEntity<RetornoErroAPI> handleSecurityExceptions(Exception ex, HttpServletRequest request) {

        int status = ex instanceof AuthenticationException ? 401 : 403;

        RetornoErroAPI retorno = new RetornoErroAPI(
                false,
                ex.getMessage(),
                status,
                request.getRequestURI(),
                LocalDateTime.now(),
                null
        );

        return ResponseEntity.status(status).body(retorno);
    }

    // =====================================================
    // 5. Qualquer outra exceção não prevista
    // =====================================================
    @ExceptionHandler(Exception.class)
    public ResponseEntity<RetornoErroAPI> handleAllExceptions(Exception ex, HttpServletRequest request) {

        RetornoErroAPI erro = new RetornoErroAPI(
                false,
                ex.getMessage(),
                500,
                request.getRequestURI(),
                LocalDateTime.now(),
                null
        );

        return ResponseEntity.status(500).body(erro);
    }
}
