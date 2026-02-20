package br.com.gestpro.auth.service;

import br.com.gestpro.auth.dto.AuthDTO.LoginResponse;
import br.com.gestpro.auth.model.Usuario;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface IAuthenticationService {

    //Cadastro Manual Operation
    Usuario cadastrarManual(String nome, String email, String senha, MultipartFile foto, String baseUrl, String path) throws IOException;

    //Confirmar Email Operation
    boolean confirmarEmail(String token);

    //Login Manual Operation
    LoginResponse loginManual(String email,
                              String senha,
                              String path,
                              HttpServletResponse response);

    //Login Google Operation
    Usuario loginOrRegisterGoogle(String email, String nome, String foto, HttpServletResponse response) throws IOException;

    //Gerar Token
    String gerarToken(Usuario usuario);

    //Salvar Foto Upload
    String salvarFoto(MultipartFile foto) throws IOException;

    //Atualizar Plano
    Usuario atualizarPlano(String email, int duracaoDias);
}
