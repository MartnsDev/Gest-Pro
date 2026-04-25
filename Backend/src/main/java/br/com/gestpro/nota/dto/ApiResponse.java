package br.com.gestpro.nota.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApiResponse<T> {
    private boolean sucesso;
    private String mensagem;
    private T dados;

    public static <T> ApiResponse<T> ok(T dados) {
        ApiResponse<T> r = new ApiResponse<>();
        r.sucesso = true;
        r.dados = dados;
        return r;
    }

    public static <T> ApiResponse<T> erro(String mensagem) {
        ApiResponse<T> r = new ApiResponse<>();
        r.sucesso = false;
        r.mensagem = mensagem;
        return r;
    }
}
