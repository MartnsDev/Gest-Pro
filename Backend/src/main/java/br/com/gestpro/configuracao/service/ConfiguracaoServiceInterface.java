package br.com.gestpro.configuracao.service;

import br.com.gestpro.configuracao.dto.*;
import org.springframework.web.multipart.MultipartFile;

public interface ConfiguracaoServiceInterface {
    PerfilDTO     getPerfil(String email);
    void          atualizarNome(String email, String novoNome);
    String        uploadFoto(String email, MultipartFile foto);
    void          solicitarCodigoTrocaSenha(String email);
    void          trocarSenha(String email, TrocarSenhaDTO dto);
    NotificacoesDTO getNotificacoes(String email);
    void          atualizarNotificacoes(String email, NotificacoesDTO dto);
}