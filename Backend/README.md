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
📁 Estrutura de Pacotes
```
backend/
├── src/main/java/br/com/gestpro/gestpro_backend
│   ├── domain/
│   │   ├── model/          # Entidades (Usuario, Plano, etc.)
│   │   ├── model/enums/    # Enums: TipoPlano, StatusAcesso
│   │   ├── repository/     # Interfaces de acesso a dados
│   │   └── service/        # Regras de negócio e lógica de serviços
│   ├── infra/
│   │   ├── jwt/            # Configuração JWT, filtros e utilitários
│   │   ├── security/       # Configuração do Spring Security e OAuth2
│   │   └── exception/      # Tratamento de erros global
│   └── controller/         # Endpoints REST
└── src/main/resources/
    └── application.properties
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
📜 Licença
```
Este projeto não pode ser copiado, reproduzido ou utilizado sem autorização do autor.
Todos os direitos reservados a Matheus Martins (MartnsDev).

```


Feito com 💚 por Matheus Martins (MartnsDev)
