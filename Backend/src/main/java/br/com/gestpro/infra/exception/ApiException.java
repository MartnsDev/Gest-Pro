package br.com.gestpro.infra.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception personalizada para retornar erros padronizados da API.
 */
public class ApiException extends RuntimeException {

    private final HttpStatus status; // Status HTTP do erro
    private final String path;       // Endpoint que causou o erro
    private final Object detalhes;   // Informação extra opcional (como lista de erros de validação)

    public ApiException(String mensagem, HttpStatus status, String path) {
        super(mensagem); // Mensagem do erro
        this.status = status;
        this.path = path;
        this.detalhes = null;
    }

    public ApiException(String mensagem, HttpStatus status, String path, Object detalhes) {
        super(mensagem);
        this.status = status;
        this.path = path;
        this.detalhes = detalhes;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getPath() {
        return path;
    }

    public Object getDetalhes() {
        return detalhes;
    }
}
