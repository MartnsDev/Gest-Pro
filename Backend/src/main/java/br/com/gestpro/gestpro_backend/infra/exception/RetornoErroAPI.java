package br.com.gestpro.gestpro_backend.infra.exception;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Estrutura padrão para retornar erros da API.
 * Contém todas as informações importantes sobre a falha da requisição.
 */
public record RetornoErroAPI(

        // Indica se a requisição foi bem-sucedida ou não.
        // Para erros, sempre será false.
        boolean sucesso,

        // Mensagem resumida do erro, descrevendo o que aconteceu.
        // Ex: "Produto não encontrado"
        String mensagem,

        // Código HTTP da resposta, útil para o frontend e logs.
        // Ex: 404 (Not Found), 400 (Bad Request), 500 (Internal Server Error)
        int status,

        // Caminho (endpoint) da requisição que gerou o erro.
        // Ex: "/api/produtos/123"
        String path,

        // Data e hora em que o erro ocorreu.
        // Útil para monitoramento e logs.
        LocalDateTime timestamp,

        // Lista de erros detalhados, geralmente usada para validações.
        // Pode ser null se não houver detalhes extras.
        // Ex: ["Campo 'nome' é obrigatório", "Campo 'preco' deve ser positivo"]
        List<String> erros
) {
}
