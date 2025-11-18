package br.com.gestpro.gestpro_backend.domain.service.authService;

import br.com.gestpro.gestpro_backend.api.dto.auth.AuthDTO.LoginResponse;
import br.com.gestpro.gestpro_backend.api.dto.auth.AuthDTO.LoginUsuarioDTO;
import br.com.gestpro.gestpro_backend.domain.model.auth.Usuario;
import br.com.gestpro.gestpro_backend.domain.service.authService.planoService.AtualizarPlanoOperation;
import br.com.gestpro.gestpro_backend.infra.jwt.JwtService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class AuthenticationService implements IAuthenticationService{

    private final CadastroManualOperation cadastroManual;
    private final LoginManualOperation loginManual;
    private final ConfirmarEmailOperation confirmarEmailOperation;
    private final LoginGoogleOperation loginGoogle;
    private final JwtService jwtService;
    private final UploadFotoOperation uploadFotoOperation;
    private final AtualizarPlanoOperation atualizarPlanoOperation;

    public AuthenticationService(CadastroManualOperation cadastroManual,
                                 LoginManualOperation loginManual,
                                 ConfirmarEmailOperation confirmarEmailOperation,
                                 LoginGoogleOperation loginGoogle,
                                 JwtService jwtService,
                                 UploadFotoOperation uploadFotoOperation,
                                 AtualizarPlanoOperation atualizarPlanoOperation) {
        this.cadastroManual = cadastroManual;
        this.loginManual = loginManual;
        this.confirmarEmailOperation = confirmarEmailOperation;
        this.loginGoogle = loginGoogle;
        this.jwtService = jwtService;
        this.uploadFotoOperation = uploadFotoOperation;
        this.atualizarPlanoOperation = atualizarPlanoOperation;
    }

    @Override
    public Usuario cadastrarManual(String nome, String email, String senha, MultipartFile foto, String baseUrl, String path) throws IOException {
        return cadastroManual.execute(nome, email, senha, foto, baseUrl, path);
    }

    @Override
    public boolean confirmarEmail(String token) {
        return confirmarEmailOperation.execute(token);
    }

    @Override
    public LoginResponse loginManual(String email, String senha, String path) {
        LoginUsuarioDTO loginDTO = new LoginUsuarioDTO(email, senha);
        return loginManual.execute(loginDTO, path);
    }

    @Override
    public Usuario loginOrRegisterGoogle(String email, String nome, String foto) {
        return loginGoogle.execute(email, nome, foto);
    }

    @Override
    public String gerarToken(Usuario usuario) {
        return jwtService.gerarToken(usuario);
    }

    @Override
    public String salvarFoto(MultipartFile foto) throws IOException {
        return uploadFotoOperation.salvarFoto(foto);
    }


    @Override
    public Usuario atualizarPlano(String email, int duracaoDias) {
        return atualizarPlanoOperation.atualizarPlano(email, duracaoDias);
    }


}
