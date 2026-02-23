# GestPro

Sistema completo de gestão para mercados e lojas que desenvolvi utilizando Next.js 14+ no frontend e Spring Boot 3 no backend.

[![License](https://img.shields.io/badge/license-All%20Rights%20Reserved-red.svg)](LICENSE)

## 📋 Sobre o Projeto

Desenvolvi o GestPro como uma solução completa para gestão comercial, implementando funcionalidades essenciais como controle de produtos, estoque, vendas, clientes e relatórios, tudo através de uma interface moderna e intuitiva.

### O que implementei

- **Sistema de autenticação completo**: Criei login com email/senha e integração com OAuth2 do Google
- **Gestão de usuários**: Implementei cadastro, recuperação de senha e confirmação por email
- **Controle de acesso**: Desenvolvi sistema de planos (EXPERIMENTAL/ASSINANTE) e gerenciamento de status de usuário
- **Dashboard interativo**: Construí uma visão geral com atalhos rápidos para as principais funcionalidades
- **Módulo comercial**: Desenvolvi a gestão completa de produtos, estoque, vendas e clientes
- **Sistema de relatórios**: Implementei análises e indicadores de performance


## 🚀 Tecnologias que Utilizei

### Frontend
Construí a interface do usuário utilizando:
- **Next.js 14+** com App Router
- **TypeScript** para tipagem estática
- **Tailwind CSS** para estilização responsiva
- **shadcn/ui** como biblioteca de componentes
- **Lucide Icons** para ícones

### Backend
Desenvolvi a API e regras de negócio com:
- **Java 17+**
- **Spring Boot 3.x**
- **Spring Security** implementando autenticação JWT
- **OAuth2** para integração com login do Google
- **MySQL 8+** como banco de dados
- **Redis** para sistema de caching
- **Maven** para gerenciamento de dependências
- **Swagger** para documentação automática da API

## 📂 Como Organizei o Projeto

```
GestPro/
├── frontend/          # Interface do usuário (Next.js)
├── backend/           # API e lógica de negócio (Spring Boot)
├── Img/               # Imagens utilizadas neste README
└── README.md
```

## 🚀 Como Rodar o Projeto

### Pré-requisitos

Para rodar o projeto, você vai precisar de:
- **Java 17+**
- **Node.js 18+**
- **MySQL 8+**
- **Redis** (opcional, para caching)
- **Maven** (já incluído no projeto)

### Instalação Rápida

```bash
# 1. Clone o repositório
git clone https://github.com/MartnsDev/Gest-Pro.git
cd GestPro

# 2. Configure as variáveis de ambiente (veja a seção abaixo)

# 3. Crie o banco de dados
mysql -u root -p -e "CREATE DATABASE gestpro_db;"

# 4. Inicie o backend
cd backend
./mvnw spring-boot:run

# 5. Em outro terminal, inicie o frontend
cd frontend
npm install
npm run dev
```

**Depois de iniciar, acesse:**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080`
- Documentação Swagger: `http://localhost:8080/swagger-ui.html`

---

## ⚙️ Como Configurei as Variáveis de Ambiente

Optei por usar variáveis de ambiente para manter as configurações sensíveis fora do código. **Importante: nunca faça commit de credenciais no código.**

### Configuração no Windows

Se você estiver no Windows, use o PowerShell para definir as variáveis:
```powershell
# Database
setx DB_URL "jdbc:mysql://localhost:3306/gestpro_db"
setx DB_USERNAME "root"
setx DB_PASSWORD "sua_senha"

# Server
setx SERVER_PORT "8080"
setx APP_BASE_URL "http://localhost:8080"

# JPA/Hibernate
setx JPA_HBM_DDL "update"
setx JPA_SHOW_SQL "true"
setx JPA_FORMAT_SQL "true"
setx JPA_OPEN_IN_VIEW "false"

# Swagger
setx SWAGGER_API_DOCS_PATH "/v3/api-docs"
setx SWAGGER_UI_PATH "/swagger-ui.html"

# JWT
setx JWT_SECRET "sua_chave_secreta_jwt_minimo_256_bits"
setx JWT_EXPIRATION "86400000"

# Basic Auth
setx BASIC_AUTH_USER "admin"
setx BASIC_AUTH_PASSWORD "admin"
setx BASIC_AUTH_ROLE "ADMIN"

# OAuth2 Google (ver seção OAuth2)
setx GOOGLE_CLIENT_ID "seu_client_id"
setx GOOGLE_CLIENT_SECRET "seu_client_secret"
setx GOOGLE_SCOPE "openid,email,profile"
setx GOOGLE_REDIRECT_URI "http://localhost:8080/login/oauth2/code/google"
setx GOOGLE_AUTH_URI "https://accounts.google.com/o/oauth2/v2/auth"
setx GOOGLE_TOKEN_URI "https://oauth2.googleapis.com/token"
setx GOOGLE_USERINFO_URI "https://www.googleapis.com/oauth2/v3/userinfo"
setx GOOGLE_USERNAME_ATTR "sub"

# Email (ver seção Email)
setx MAIL_HOST "smtp.gmail.com"
setx MAIL_PORT "587"
setx MAIL_USERNAME "seu_email@gmail.com"
setx MAIL_PASSWORD "senha_de_app_google"
setx MAIL_SMTP_AUTH "true"
setx MAIL_SMTP_STARTTLS "true"
```

**Observação:** Feche e reabra o terminal para aplicar as variáveis.

---

### Configuração no Linux/macOS

Se você usa Linux ou macOS, edite o arquivo de configuração do shell:

```bash
nano ~/.bashrc  # ou ~/.zshrc se usar zsh
```

Adicione as seguintes variáveis:

```bash
# Database
export DB_URL="jdbc:mysql://localhost:3306/gestpro_db"
export DB_USERNAME="root"
export DB_PASSWORD="sua_senha"

# Server
export SERVER_PORT="8080"
export APP_BASE_URL="http://localhost:8080"

# JPA/Hibernate
export JPA_HBM_DDL="update"
export JPA_SHOW_SQL="true"
export JPA_FORMAT_SQL="true"
export JPA_OPEN_IN_VIEW="false"

# Swagger
export SWAGGER_API_DOCS_PATH="/v3/api-docs"
export SWAGGER_UI_PATH="/swagger-ui.html"

# JWT
export JWT_SECRET="sua_chave_secreta_jwt_minimo_256_bits"
export JWT_EXPIRATION="86400000"

# Basic Auth
export BASIC_AUTH_USER="admin"
export BASIC_AUTH_PASSWORD="admin"
export BASIC_AUTH_ROLE="ADMIN"

# OAuth2 Google
export GOOGLE_CLIENT_ID="seu_client_id"
export GOOGLE_CLIENT_SECRET="seu_client_secret"
export GOOGLE_SCOPE="openid,email,profile"
export GOOGLE_REDIRECT_URI="http://localhost:8080/login/oauth2/code/google"
export GOOGLE_AUTH_URI="https://accounts.google.com/o/oauth2/v2/auth"
export GOOGLE_TOKEN_URI="https://oauth2.googleapis.com/token"
export GOOGLE_USERINFO_URI="https://www.googleapis.com/oauth2/v3/userinfo"
export GOOGLE_USERNAME_ATTR="sub"

# Email
export MAIL_HOST="smtp.gmail.com"
export MAIL_PORT="587"
export MAIL_USERNAME="seu_email@gmail.com"
export MAIL_PASSWORD="senha_de_app_google"
export MAIL_SMTP_AUTH="true"
export MAIL_SMTP_STARTTLS="true"
```

Aplique as alterações:

```bash
source ~/.bashrc  # ou source ~/.zshrc
```

---

## 🔐 Integrações que Implementei

### OAuth2 - Login com Google

Implementei a autenticação com Google seguindo estes passos:

#### 1. Criei um Projeto no Google Cloud Console

Acessei o [Google Cloud Console](https://console.cloud.google.com) e criei um novo projeto:

<img src="Img/Create-project_googleAuth.png" alt="Criar Projeto Google" width="600"/>

#### 2. Configurei a OAuth Consent Screen

- Acessei **APIs e serviços → Tela de consentimento OAuth**
- Selecionei o tipo: **Externo**
- Preenchi o nome do aplicativo e email de suporte

<img src="Img/Criar-um-cliente-auth.png" alt="Configurar OAuth" width="600"/>

#### 3. Criei as Credenciais OAuth 2.0

- Naveguei até **Credenciais → Criar credenciais → ID do cliente OAuth**
- Escolhi o tipo: **Aplicativo da Web**

<img src="Img/Criar-id-cliente-Auth.png" alt="Criar ID Cliente" width="600"/>

#### 4. Adicionei a URI de Redirecionamento

Configurei a seguinte URI autorizada:
```
http://localhost:8080/login/oauth2/code/google
```

#### 5. Copiei as Credenciais

Após criar, copiei o **Client ID** e **Client Secret** e configurei nas variáveis de ambiente:

```bash
GOOGLE_CLIENT_ID="seu_client_id_aqui"
GOOGLE_CLIENT_SECRET="seu_client_secret_aqui"
```

---

### Sistema de Envio de Email via SMTP

Implementei o envio de emails utilizando Gmail para confirmação de cadastro e recuperação de senha.

#### 1. Ativei a Verificação em Duas Etapas

Primeiro, acessei [Google Account Security](https://myaccount.google.com/security) e ativei a verificação em duas etapas.

#### 2. Gerei uma Senha de Aplicativo

<img src="Img/emailsender-1.png" alt="App Passwords Menu" width="600"/>

Acessei **Senhas de app** e criei uma nova senha:

<img src="Img/emailsender-2.png" alt="Criar App Password" width="600"/>

#### 3. Configurei as Variáveis de Ambiente

Usei a senha gerada (16 caracteres) na variável `MAIL_PASSWORD`:

```bash
MAIL_USERNAME="seu_email@gmail.com"
MAIL_PASSWORD="xxxx xxxx xxxx xxxx"  # Senha de app gerada
```

#### Emails que o Sistema Envia

**Confirmação de Cadastro:**

<img src="Img/Confirmar-email_gestpro.png" alt="Email de Confirmação" width="500"/>

Implementei o envio de um código de 6 dígitos com validade de 10 minutos para ativar a conta.

**Recuperação de Senha:**

<img src="Img/Mudar-senha-Gestpro.png" alt="Email Redefinição de Senha" width="500"/>

Criei um sistema de código temporário para redefinir a senha com segurança.

## 📚 Documentação da API que Criei

Implementei documentação interativa completa utilizando **Swagger/OpenAPI 3.0**.

Para acessar após iniciar o backend:
```
http://localhost:8080/swagger-ui.html
```

<img src="Img/Documentação-Swagger.png" alt="Swagger UI" />

### Endpoints que Implementei

- **Autenticação**: Login, cadastro, confirmação de email
- **Usuário**: Perfil, atualização de dados
- **Produtos**: CRUD completo
- **Estoque**: Controle de movimentações
- **Vendas**: Registro e consulta
- **Clientes**: Gestão de cadastro
- **Relatórios**: Dashboards e analytics

## 🔒 Segurança que Implementei

Implementei diversas camadas de segurança no projeto:

- **Autenticação JWT** com tokens de refresh
- **OAuth2** para login social integrado
- **Senhas criptografadas** utilizando BCrypt
- **Validação de email obrigatória** para ativar contas
- **Códigos de verificação** com tempo de expiração
- **Proteção CSRF** para requisições
- **Rate limiting** para prevenir abuso da API

## ⚠️ Pontos Importantes

Durante o desenvolvimento deste projeto, algumas decisões e boas práticas se mostraram essenciais para manter o sistema seguro, escalável e próximo de um ambiente real de produção:

- **Segurança em primeiro lugar**  
  Nunca versionar credenciais, tokens, senhas ou secrets no repositório.  
  Todas as informações sensíveis devem ser configuradas exclusivamente via variáveis de ambiente.

- **JWT Secret forte**  
  Utilize uma chave JWT com no mínimo **256 bits**.  
  Chaves fracas comprometem toda a segurança da aplicação, independentemente do restante da arquitetura.

- **Email dedicado para o sistema**  
  É altamente recomendado utilizar um email exclusivo para o envio de mensagens do sistema  
  (confirmação de conta, redefinição de senha, notificações).  
  Evite usar email pessoal, especialmente em ambientes de produção.

- **Redis em produção**  
  Embora opcional durante o desenvolvimento local, o uso de Redis é fortemente recomendado em produção  
  para caching, controle de sessões, otimização de performance e redução de carga no banco de dados.

- **Separação de responsabilidades**  
  Frontend e backend foram desenvolvidos como aplicações independentes, permitindo escalabilidade,  
  deploy separado e melhor organização do código.

- **Ambiente de produção ≠ ambiente de desenvolvimento**  
  Configurações como logs detalhados, `ddl-auto=update` e `show-sql=true` devem ser usadas apenas em desenvolvimento.  
  Em produção, essas opções precisam ser revisadas para evitar riscos de segurança e impacto de performance.
  

## 📖 Links do Projeto

- [Código do Frontend](https://github.com/MartnsDev/Gest-Pro/tree/2ced41f10df3341faa91cdcd0596061cfdcbc920/FrontEnd)

## 📝 Licença

Todos os direitos reservados © 2025 Matheus Martins (MartnsDev)

Este projeto é de minha autoria e não pode ser copiado, reproduzido ou utilizado sem minha autorização expressa.

## 👤 Sobre Mim

**Matheus Martins**

Sou desenvolvedor e criei este projeto para aprender e demonstrar minhas habilidades. Se quiser trocar uma ideia sobre o projeto ou tiver alguma sugestão, fique à vontade para entrar em contato!

- LinkedIn: [@matheusmartnsdev](https://www.linkedin.com/in/matheusmartnsdev/)

---

Desenvolvido com 💚 por Matheus Martins
