# 🛠️ GestPro Backend

Backend do **GestPro**, sistema completo de gestão para mercados e lojas, desenvolvido com **Java 17+** e **Spring Boot 3.x**.  
Responsável por autenticação, gerenciamento de usuários, planos, controle de acesso e integração com o frontend.

> 🔗 Repositório do frontend: [GestPro Frontend](https://github.com/MartnsDev/GestPro/tree/71368bf65a66019599829ff285afbe9b40038fad/gestpro-frontEnd)

---

## 🚀 Tecnologias Utilizadas

- Java 17+
- Spring Boot 3.x
- Spring Security + JWT
- OAuth2 (Login com Google)
- MySQL 8+
- Maven
- Lombok
- JUnit / Mockito (para testes)

---

## 📋 Pré-requisitos

- Java 17+
- Maven
- MySQL 8+
- Node.js (para integração com frontend, opcional)

---

## ⚙️ Configuração e Execução

### 1️⃣ Clone o repositório
```
git clone https://github.com/MartnsDev/GestPro.git
cd GestPro/backend
```
2️⃣ Configure o banco de dados MySQL
```
Crie um banco, por exemplo gestpro_db, e configure as credenciais.
```
3️⃣ Configurar variáveis no application.properties ou .yml
properties
```
spring.datasource.url=jdbc:mysql://localhost:3306/gestpro_db
spring.datasource.username=root
spring.datasource.password=senha123
jwt.secret=meuJWTsuperSecretoComMaisDe32Caracteres123!
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```
# Configurações do Google OAuth2
```
spring.security.oauth2.client.registration.google.client-id=SEU_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=SEU_CLIENT_SECRET
spring.security.oauth2.client.registration.google.scope=email,profile
```
4️⃣ Rodar o backend
```
./mvnw spring-boot:run
O backend estará disponível em:
👉 http://localhost:8080
```

🔐 Autenticação
```
O backend suporta dois métodos de login:

Login tradicional: Email e senha

Login com Google: OAuth2

A autenticação utiliza JWT tokens, que são enviados para o frontend via cookies HTTP-only.
O sistema também implementa:

Controle de acesso por TipoPlano (EXPERIMENTAL, ASSINANTE)

Status do usuário com StatusAcesso (ATIVO, INATIVO)

Controle de acesso expirado (7 dias para usuários experimentais)
```
📡 Principais Endpoints
```
Autenticação
Método	Endpoint	Descrição
POST	/auth/login	Login com email e senha
POST	/auth/cadastro	Cadastro de novo usuário
GET	/oauth2/authorization/google	Login com Google OAuth2
POST	/auth/esqueceu-senha	Solicitar redefinição de senha
POST	/auth/redefinir-senha	Redefinir senha
POST	/auth/logout	Logout do usuário

Usuário
Método	Endpoint	Descrição
GET	/api/usuario	Obter dados do usuário autenticado
GET	/api/usuarios	Listar usuários (admin)
```
🎯 Principais Funcionalidades
```
Cadastro e login de usuários

Recuperação e redefinição de senha

Login com Google OAuth2

Controle de acesso via JWT e cookies HTTP-only

Controle de status de usuário e plano (experimental ou assinante)

Integração completa com frontend Next.js
```
📝 Testes
```
Testes unitários com JUnit 5

Testes de serviço com Mockito

Cobertura de endpoints via Spring Boot Test
```
📁 Estrutura de Pacotes
```
backend/
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

```

📜 Licença
```
Este projeto não pode ser copiado, reproduzido ou utilizado sem autorização do autor.
Todos os direitos reservados a Matheus Martins (MartnsDev).

```


Feito com 💚 por Matheus Martins (MartnsDev)
