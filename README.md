# 🛒 GestPro - Sistema de Gestão para Mercados e Lojas

**GestPro** é um sistema completo de gestão para mercados e lojas, desenvolvido com **Next.js 14+** (frontend) e **Spring Boot 3** (backend).  
O sistema inclui login, cadastro, recuperação de senha, dashboard, controle de produtos, estoque, vendas, clientes e relatórios.

---

## 🚀 Tecnologias

### Frontend
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide Icons

### Backend
- Java 17+
- Spring Boot 3.x
- Spring Security + JWT
- OAuth2 (Login com Google)
- MySQL 8+
- Maven

---

## 📂 Estrutura do Repositório

```bash
GestPro/
├── frontend/      # Interface do usuário (Next.js)
├── backend/       # API e regras de negócio (Spring Boot)
└── README.md      # Este arquivo
```
Cada pasta possui seu próprio README detalhado com instruções de configuração, execução e screenshots.

Screenshots do Sistema

Login
---
![Tela de login do Gest-Pro](https://raw.githubusercontent.com/MartnsDev/Gest-Pro/b22799e9e53523f9b9442e41db645f729c92247c/Img/gestpro-login.png)

Dashboard
---
![GestPro - Dashboard](https://github.com/MartnsDev/Gest-Pro/blob/c7f08fcf4571fefae78d8af88cb5fca656c48328/Img/Gest-Pro_Dashboard.png)


🔐 Funcionalidades Principais
```
Cadastro e login de usuários (email/senha e Google OAuth2)

Recuperação e redefinição de senha

Controle de acesso por TipoPlano (EXPERIMENTAL / ASSINANTE)

Status de usuário (ATIVO / INATIVO)

Dashboard com informações do usuário

Backend totalmente integrado com frontend Next.js
```
📡 Links Úteis

[Frontend README](https://github.com/MartnsDev/Gest-Pro/tree/2ced41f10df3341faa91cdcd0596061cfdcbc920/FrontEnd) 
[Backend README](https://github.com/MartnsDev/Gest-Pro/tree/2ced41f10df3341faa91cdcd0596061cfdcbc920/Backend)

🧩 Próximos Passos
```
Implementar módulos de Produtos, Estoque, Vendas, Clientes e Relatórios

Adicionar testes unitários e de integração

Implementar notificações em tempo real

Suporte a múltiplas lojas
```

# Como Baixar e executar o projeto
Abra a pasta no terminal e digite 
```
git clone https://github.com/MartnsDev/Gest-Pro.git
```
Após isso, abre o projeto e configure as variáveis de ambiente:
```
# ===============================
# BANCO DE DADOS
# ===============================
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
# ===============================
# SERVIDOR
# ===============================
server.port=${SERVER_PORT}
app.base-url=${APP_BASE_URL}
# ===============================
# JPA / HIBERNATE
# ===============================
spring.jpa.hibernate.ddl-auto=${JPA_HBM_DDL}
spring.jpa.show-sql=${JPA_SHOW_SQL}
spring.jpa.properties.hibernate.format_sql=${JPA_FORMAT_SQL}
spring.jpa.open-in-view=${JPA_OPEN_IN_VIEW}
# ===============================
# Swagger
# ===============================
springdoc.api-docs.path=${SWAGGER_API_DOCS_PATH}
springdoc.swagger-ui.path=${SWAGGER_UI_PATH}
# ===============================
# JWT
# ===============================
jwt.secret=${JWT_SECRET}
app.jwt-expiration-ms=${JWT_EXPIRATION}
# ===============================
# BASIC AUTH (TESTES)
# ===============================
spring.security.user.name=${BASIC_AUTH_USER}
spring.security.user.password=${BASIC_AUTH_PASSWORD}
spring.security.user.roles=${BASIC_AUTH_ROLE}
# ===============================
# OAuth2 Google
# ===============================
spring.security.oauth2.client.registration.google.client-id=${GOOGLE_CLIENT_ID}
spring.security.oauth2.client.registration.google.client-secret=${GOOGLE_CLIENT_SECRET}
spring.security.oauth2.client.registration.google.scope=${GOOGLE_SCOPE}
spring.security.oauth2.client.registration.google.redirect-uri=${GOOGLE_REDIRECT_URI}
spring.security.oauth2.client.provider.google.authorization-uri=${GOOGLE_AUTH_URI}
spring.security.oauth2.client.provider.google.token-uri=${GOOGLE_TOKEN_URI}
spring.security.oauth2.client.provider.google.user-info-uri=${GOOGLE_USERINFO_URI}
spring.security.oauth2.client.provider.google.user-name-attribute=${GOOGLE_USERNAME_ATTR}
# ===============================
# Email Sender
# ===============================
spring.mail.host=${MAIL_HOST}
spring.mail.port=${MAIL_PORT}
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
spring.mail.properties.mail.smtp.auth=${MAIL_SMTP_AUTH}
spring.mail.properties.mail.smtp.starttls.enable=${MAIL_SMTP_STARTTLS}
# ===============================
# Otimização
# ===============================
spring.main.lazy-initialization=false
# Redis
spring.redis.host=localhost
spring.redis.port=6379
spring.devtools.restart.enabled=false
```

# Configuração OAuth2 com Google no Spring Boot

Este guia explica como obter e configurar todas as variáveis necessárias para usar login com Google OAuth2 em um projeto Spring Boot com Spring Security.

A ideia é simples. Você cria um app no Google Cloud, gera credenciais OAuth2 e conecta isso ao seu backend.

---

## Pré requisitos

Você precisa de uma conta Google e acesso ao Google Cloud Console.  
Não é necessário cartão de crédito para desenvolvimento.

Acesse:
```
htps://console.cloud.google.com
```
--

## 1 Criar um projeto no Google Cloud

No topo da tela, clique em **Selecionar projeto** e depois em **Novo projeto**.

![Criar projeto — Google Auth](Img/Create-project_googleAuth.png)

Defina um nome, por exemplo:
```
GestPro OAuth  
ou  
GP Dev Auth  
```
Crie o projeto e selecione ele.

---

## 2 Configurar a Tela de Consentimento OAuth

No menu lateral, acesse:

APIs e serviços  
Tela de consentimento OAuth  

Selecione o tipo:

Externo  

Clique em Criar.

Preencha os campos principais:

Nome do app  
Email de suporte  

Os escopos podem ficar no padrão por enquanto.  
Salve e finalize a configuração.

Mesmo em modo de teste isso já funciona para desenvolvimento.

---

## 3 Criar as credenciais OAuth 2.0

No menu lateral, vá em:

APIs e serviços  
Credenciais  

Clique em **Criar credenciais** e escolha **ID do cliente OAuth**.

Tipo de aplicativo:

Aplicativo da Web  

### URIs de redirecionamento autorizados

Adicione exatamente esta URL:

```text
http://localhost:8080/login/oauth2/code/google
```

# Configuração de Envio de Email no Spring Boot

Este guia explica como configurar envio de emails no Spring Boot usando SMTP.  
Esse recurso é muito usado para cadastro de usuário, recuperação de senha, confirmação de conta e notificações do sistema.

A ideia aqui é simples. Seu backend se conecta a um servidor de email e envia mensagens automaticamente.

---

## Pré requisitos

Você precisa de um email que permita envio via SMTP.  
O mais comum em projetos é usar Gmail ou um serviço como Outlook, Zoho ou um serviço profissional.

Neste exemplo vou usar **Gmail**, pois é o mais comum em desenvolvimento.

---

## 1 Criar ou preparar um email para envio

Use um email dedicado para o sistema, por exemplo:
```
gestpro.app@gmail.com  
```
Evite usar seu email pessoal.

---

## 2 Ativar senha de app no Gmail

O Gmail não permite mais usar a senha normal da conta.

Você precisa criar uma **senha de app**.

Passo a passo:

Acesse:
```
https://myaccount.google.com/security
```
Ative a verificação em duas etapas na conta.

Depois disso, entre em **Senhas de app**.
![Criar projeto — Google Auth](Img/emailsender-1.png)

Crie uma nova senha para o aplicativo.  
Nome sugerido: Spring Boot Email

![Criar projeto — Google Auth](Img/emailsender-2.png)

O Google vai gerar uma senha parecida com:

```text
abcd efgh ijkl mnop
```

## Documentação Swagger
---
![Documentaçãp Swagger](https://github.com/MartnsDev/Gest-Pro/blob/2ced41f10df3341faa91cdcd0596061cfdcbc920/Img/Documenta%C3%A7%C3%A3o-Swagger.png)

Cadastro
---
![GestPro - Cadastro](https://github.com/MartnsDev/Gest-Pro/blob/2ced41f10df3341faa91cdcd0596061cfdcbc920/Img/gestpro-cadastro.png)

Redefinir Senha
---
![GestPro - Redefinir senha](https://github.com/MartnsDev/Gest-Pro/blob/8b390608e23256ca71fb5e4ce190dfa55f4efa58/Img/gestpro-redefinir-senha.png)

� Licença
```
Este projeto não pode ser copiado, reproduzido ou utilizado sem autorização do autor.
Todos os direitos reservados a Matheus Martins (MartnsDev).
```

Feito com 💚 por Matheus Martins [Linkedin](https://www.linkedin.com/in/matheusmartnsdev/)
