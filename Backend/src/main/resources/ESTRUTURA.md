br.com.gestpro.gestpro_backend/
│
│----------------------------------------------------- Requisições -----------------------------------------------------
├── api/
│   ├── controller/
│   │   ├── modules/                                         # Controllers das funcionalidades
│   │   │   ├── DashboardController.java
│   │   │   ├── ProdutoController.java
│   │   │   ├── VendaController.java
│   │   │   ├── ClienteController.java
│   │   │   ├── RelatorioController.java
│   │   │   ├── ConfiguracaoController.java
│   │   │   └── CaixaController.java                         # ✅ Novo Controller do módulo Caixa
│   │   └── auth/
│   │       ├── AuthController.java
│   │       ├── GoogleAuthController.java
│   │       ├── UpdatePasswordController.java
│   │       └── UsuarioController.java
│   │
│   └── dto/
│       ├── AuthDTO/
│       │   ├── AuthResponseDTO.java
│       │   ├── CadastroRequestDTO.java
│       │   ├── LoginResponse.java
│       │   └── LoginUsuarioDTO.java
│       ├── googleAuthDTO/
│       │   └── UsuarioResponse.java
│       ├── updatePassword/
│       │   └── UpdatePasswordRequestDTO.java
│       ├── recuperarSenha/
│       │   ├── SolicitarCodigoRequest.java
│       │   ├── VerificarCodigoRequest.java
│       │   └── AtualizarSenhaRequest.java
│       └── caixaDTO/                                        # ✅ Novo pacote DTO para o módulo Caixa
│           ├── AbrirCaixaRequest.java
│           ├── FecharCaixaRequest.java
│           ├── CaixaResponse.java
│           └── ResumoCaixaDTO.java
│
│---------------------------------------------- Definição / Principal --------------------------------------------------
│
├── domain/
│   ├── model/
│   │   ├── auth/
│   │   │   ├── Usuario.java
│   │   │   └── UsuarioPrincipal.java
│   │   ├── Enums/
│   │   │   ├── TipoPlano.java
│   │   │   └── StatusAcesso.java
│   │   └── modules/
│   │       ├── dashboard/
│   │       │   └── DashboardResumo.java
│   │       ├── produto/
│   │       │   └── Produto.java
│   │       ├── venda/
│   │       │   └── Venda.java
│   │       ├── cliente/
│   │       │   └── Cliente.java
│   │       ├── relatorio/
│   │       │   └── Relatorio.java
│   │       ├── configuracao/
│   │       │   └── Configuracao.java
│   │       └── caixa/                                     # ✅ Nova entidade
│   │           └── Caixa.java
│   │
│   ├── repository/
│   │   ├── auth/
│   │   │   └── UsuarioRepository.java
│   │   └── modules/
│   │       ├── DashboardRepository.java
│   │       ├── ProdutoRepository.java
│   │       ├── VendaRepository.java
│   │       ├── ClienteRepository.java
│   │       ├── RelatorioRepository.java
│   │       ├── ConfiguracaoRepository.java
│   │       └── CaixaRepository.java                       # ✅ Novo repository
│   │
│   └── service/
│       ├── modules/
│       │   ├── dashboard/
│       │   │   ├── DashboardServiceInterface.java
│       │   │   └── DashboardServiceImpl.java
│       │   ├── produto/
│       │   │   ├── ProdutoServiceInterface.java
│       │   │   └── ProdutoServiceImpl.java
│       │   ├── venda/
│       │   │   ├── VendaServiceInterface.java
│       │   │   └── VendaServiceImpl.java
│       │   ├── cliente/
│       │   │   ├── ClienteServiceInterface.java
│       │   │   └── ClienteServiceImpl.java
│       │   ├── relatorio/
│       │   │   ├── RelatorioServiceInterface.java
│       │   │   └── RelatorioServiceImpl.java
│       │   ├── configuracao/
│       │   │   ├── ConfiguracaoServiceInterface.java
│       │   │   └── ConfiguracaoServiceImpl.java
│       │   └── caixa/                                     # ✅ Novo service
│       │       ├── CaixaServiceInterface.java
│       │       └── CaixaServiceImpl.java
│       └── authService/
│           ├── AuthenticationService.java
│           ├── LoginManualOperation.java
│           ├── LoginGoogleOperation.java
│           ├── UpdatePasswordService.java
│           ├── AtualizarPlanoOperation.java
│           ├── ConfirmarEmailOperation.java
│           ├── CadastroManualOperation.java
│           ├── UploadFotoOperation.java
│           ├── VerificarPlanoOperation.java
│           └── IAuthenticationService.java
│
│---------------------------------------------- Segurança / Estrutura --------------------------------------------------
│
├── domain/
│   ├── model/                                         # Entidades do sistema
│   │   ├── auth/                                      # Entidades de autenticação e usuários
│   │   │   ├── Usuario.java
│   │   │   └── UsuarioPrincipal.java
│   │   ├── Enums/
│   │   │   ├── TipoPlano.java
│   │   │   └── StatusAcesso.java
│   │   └── modules/                                   # Entidades específicas de cada módulo
│   │       ├── dashboard/
│   │       │   └── DashboardResumo.java
│   │       ├── produto/
│   │       │   └── Produto.java
│   │       ├── venda/
│   │       │   └── Venda.java
│   │       ├── cliente/
│   │       │   └── Cliente.java
│   │       ├── relatorio/
│   │       │   └── Relatorio.java
│   │       └── configuracao/
│   │           └── Configuracao.java
│   │
│   ├── repository/                                             # Interfaces de acesso ao banco de dados
│   │   ├── auth/
│   │   └── UsuarioRepository.java
│   └── modules/
│       ├── DashboardRepository.java
│       ├── ProdutoRepository.java
│       ├── VendaRepository.java
│       ├── ClienteRepository.java
│       ├── RelatorioRepository.java
│       └── ConfiguracaoRepository.java
│
│────── service/                                                # Lógica de negócio
│       ├── modules/                                            # Services dos módulos do sistema
│       │   ├── dashboard/
│       │   │   ├── DashboardServiceInterface.java
│       │   │   └── DashboardServiceImpl.java
│       │   ├── produto/
│       │   │   ├── ProdutoServiceInterface.java
│       │   │   └── ProdutoServiceImpl.java
│       │   ├── venda/
│       │   │   ├── VendaServiceInterface.java
│       │   │   └── VendaServiceImpl.java
│       │   ├── cliente/
│       │   │   ├── ClienteServiceInterface.java
│       │   │   └── ClienteServiceImpl.java
│       │   ├── relatorio/
│       │   │   ├── RelatorioServiceInterface.java
│       │   │   └── RelatorioServiceImpl.java
│       │   └── configuracao/
│       │       ├── ConfiguracaoServiceInterface.java
│       │       └── ConfiguracaoServiceImpl.java
│       └── authService/                                         # Services de autenticação e operações de usuário
│           ├── AtualizarPlanoOperation.java
│           ├── AuthenticationService.java
│           ├── CadastroManualOperation.java
│           ├── ConfirmarEmailOperation.java
│           ├── IAuthenticationService.java
│           ├── LoginGoogleOperation.java
│           ├── LoginManualOperation.java
│           ├── UpdatePasswordService.java
│           ├── UploadFotoOperation.java
│           └── VerificarPlanoOperation.java
│
│----------------------------------------------Segurança/Estrutura------------------------------------------------------
│
├── infra/
│   ├── configs/                                  # Configurações gerais
│   │   ├── CorsConfig.java
│   │   ├── StaticResourceConfig.java
│   │   ├── AsyncConfig.java                       # Novo
│   │   └── WebConfig.java                         # Novo, se necessário
│   ├── exceptions/                                # Tratamento de exceções
│   │   ├── ApiException.java
│   │   ├── GlobalExceptionHandler.java
│   │   ├── RetornoErroAPI.java
│   │   └── ApiResponse.java                       # Atualizar
│   ├── filters/                                   # Filtros HTTP
│   │   ├── JwtAuthenticationFilter.java
│   │   └── OAuth2LoginSuccessHandler.java
│   ├── jwt/                                        # Manipulação de JWT
│   │   └── JwtService.java
│   ├── security/                                   # Configuração de segurança
│   │   ├── CustomOAuth2UserService.java
│   │   ├── SecurityConfig.java                     # Atualizar
│   │   └── PasswordEncoderConfig.java              # Novo, se necessário
│   ├── swagger/                                    # Configurações Swagger
│   │   └── DocumentationSwagger.java
│   └── util/                                       # Utilitários gerais
│       ├── backups/                                # Arquivos de backup
│       ├── helpers/                                # Funções comuns, validadores
│       └── UsuarioCleanupScheduler.java
│
└── GestproBackendApplication.java                  # Classe principal que inicializa a aplicação
