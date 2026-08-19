<div align="center">

<img src="Img/gestpro-img.jpg" alt="Gevyro" width="90" />

# Gevyro

### Gestão em evolução.

Plataforma de gestão empresarial para centralizar vendas, estoque, caixa, clientes e informações importantes da operação em um único ambiente.

<br />

[![Java](https://img.shields.io/badge/Java-17%2B-ED8B00?style=flat-square&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-14%2B-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8%2B-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-All%20Rights%20Reserved-red?style=flat-square)](LICENSE)

<br />

[Visão geral](#visão-geral) · [Produto](#produto) · [Interface](#interface) · [Arquitetura](#arquitetura) · [Tecnologias](#tecnologias) · [Desenvolvimento](#desenvolvimento-local) · [API](#api) · [Segurança](#segurança)

</div>

## Visão geral

A Gevyro é uma plataforma de gestão empresarial desenvolvida para tornar mais simples o acompanhamento da operação de um negócio.

O sistema concentra informações que normalmente ficam distribuídas entre planilhas, anotações e ferramentas diferentes. Vendas, produtos, estoque, movimentações de caixa, clientes e indicadores passam a fazer parte de um mesmo fluxo.

A proposta da Gevyro é permitir que os dados gerados durante a operação sejam utilizados para acompanhar o negócio e apoiar decisões.

O projeto possui frontend desenvolvido com Next.js e TypeScript e uma API construída com Java e Spring Boot. A aplicação utiliza MySQL para persistência dos dados e possui autenticação com Spring Security, JWT e OAuth2.

## Produto

A operação da Gevyro é organizada em torno da empresa do usuário.

Cada empresa possui seus próprios produtos, clientes, caixas, vendas e informações operacionais. Essa separação permite utilizar uma mesma conta para administrar empresas diferentes sem misturar seus dados.

### Vendas e PDV

O módulo de vendas funciona como frente de caixa da aplicação.

É possível localizar produtos, adicionar itens à venda, informar descontos, selecionar formas de pagamento e concluir a operação pelo próprio sistema.

O PDV suporta pagamento utilizando até duas formas na mesma venda. Quando necessário, o sistema calcula o troco automaticamente.

As vendas concluídas passam a integrar o histórico da empresa e alimentam os indicadores utilizados pelo dashboard e pelos relatórios.

Também existe suporte ao cancelamento de vendas, com restituição dos itens ao estoque conforme as regras implementadas pela aplicação.

### Caixa

A Gevyro possui controle de abertura e fechamento de caixa.

As vendas ficam relacionadas ao caixa responsável pela operação, permitindo consultar movimentações e obter um resumo do período.

Empresas que possuam acesso a múltiplos caixas podem manter essas operações separadas.

### Produtos e estoque

Produtos podem ser cadastrados com informações como nome, categoria, unidade, código de barras, preço de custo, preço de venda e quantidade disponível.

Durante o cadastro, a aplicação consegue apresentar informações como lucro unitário e margem com base nos valores informados.

Quando uma venda é registrada, o estoque correspondente é atualizado.

O sistema também utiliza estoque mínimo para identificar produtos que precisam de atenção.

### Clientes e fornecedores

A Gevyro mantém um cadastro centralizado de contatos comerciais.

Clientes e fornecedores podem ser diferenciados dentro do sistema e possuir informações específicas de acordo com seu tipo.

Clientes também podem ser associados às vendas realizadas.

### Dashboard

O dashboard transforma os registros da operação em uma visão resumida da empresa.

Informações de vendas, produtos, estoque e outros indicadores ficam disponíveis em uma interface visual para facilitar o acompanhamento da operação.

### Relatórios

A área de relatórios permite analisar diferentes períodos da operação.

Entre as informações disponíveis estão receita, lucro estimado, ticket médio, vendas, cancelamentos, produtos vendidos e formas de pagamento.

Os dados podem ser apresentados por meio de indicadores e gráficos.

A aplicação também possui recursos de exportação em formatos como CSV e HTML, além da possibilidade de geração de PDF utilizando os recursos de impressão do navegador.

### Múltiplas empresas

Uma conta pode possuir mais de uma empresa conforme as regras do plano contratado.

Os registros operacionais são associados à empresa correspondente.

A empresa ativa pode ser selecionada pela interface para que o usuário alterne entre diferentes operações sem precisar utilizar contas separadas.

### Conta e configurações

A área de configurações concentra informações relacionadas à conta, perfil e acesso.

Entre os recursos implementados estão atualização de informações do perfil, foto, alteração de senha mediante código enviado por email, informações sobre o plano e preferências disponíveis na aplicação.

## Interface

<table>
<tr>
<td align="center" width="50%">
<img src="Img/lading-gp-dark.png" alt="Página inicial da Gevyro" />
<br />
<sub><b>Apresentação e acesso à plataforma</b></sub>
</td>
<td align="center" width="50%">
<img src="Img/dashboard-gp-dark.png" alt="Dashboard da Gevyro" />
<br />
<sub><b>Visão geral da operação</b></sub>
</td>
</tr>
<tr>
<td align="center" width="50%">
<img src="Img/vendas-gp-dark.png" alt="PDV da Gevyro" />
<br />
<sub><b>Vendas e frente de caixa</b></sub>
</td>
<td align="center" width="50%">
<img src="Img/relatorios-gp-dark.png" alt="Relatórios da Gevyro" />
<br />
<sub><b>Indicadores e relatórios</b></sub>
</td>
</tr>
</table>

## Arquitetura

A aplicação é dividida entre frontend e backend.

O frontend é responsável pela experiência do usuário, navegação, dashboard, PDV, visualização de dados e comunicação com a API.

O backend concentra autenticação, autorização, regras de negócio, persistência e acesso aos dados.

```text
Gevyro

FrontEnd
    Next.js
    TypeScript
    App Router

    Interface pública
    Autenticação
    Dashboard
    Empresas
    Caixa
    Produtos
    Vendas
    Clientes
    Relatórios
    Configurações

Backend
    Java
    Spring Boot
    Spring Security
    Spring Data JPA

    Autenticação
    Usuários
    Empresas
    Caixa
    Produtos
    Vendas
    Clientes
    Analytics
    Configurações
    Infraestrutura

Database
    MySQL
```

### Organização dos dados

```text
Usuário
    Empresa
        Caixa
            Venda
                Item da venda
                    Produto

        Produto
        Cliente
```

Essa organização permite manter vendas, caixas, produtos e clientes relacionados à empresa responsável pela operação.

## Autenticação

A autenticação da aplicação é processada pelo backend com Spring Security.

O acesso pode ocorrer pelas formas habilitadas na aplicação, incluindo autenticação convencional e OAuth2 com Google.

Após uma autenticação válida, o backend emite o JWT utilizado pela sessão.

```text
Usuário realiza o login

Backend valida as credenciais

Spring Security processa a autenticação

JWT é emitido

Cookie HttpOnly mantém a sessão

Frontend envia as requisições com credenciais

Backend valida a sessão antes de acessar recursos protegidos
```

## Tecnologias

### Backend

| Tecnologia | Utilização |
| :--- | :--- |
| Java 17 | Linguagem principal do backend |
| Spring Boot 3 | Estrutura da API |
| Spring Security 6 | Autenticação e autorização |
| Spring Data JPA | Persistência e repositórios |
| Hibernate | Mapeamento objeto relacional |
| MySQL 8 | Banco de dados relacional |
| JJWT | Implementação dos tokens JWT |
| OAuth2 | Autenticação com Google |
| Jakarta Validation | Validação das entradas da API |
| JavaMailSender | Comunicação por email |
| Maven | Dependências e build |

### Frontend

| Tecnologia | Utilização |
| :--- | :--- |
| Next.js 14 | Framework da aplicação web |
| React | Construção da interface |
| TypeScript | Tipagem do frontend |
| Tailwind CSS | Estilização |
| Recharts | Visualização de dados |
| Lucide React | Iconografia |
| Sonner | Notificações da interface |

## Desenvolvimento local

### Requisitos

Java 17 ou superior.

Node.js 18 ou superior.

MySQL 8 ou superior.

Maven compatível com o projeto.

Git.

### Repositório

```bash
git clone https://github.com/MartnsDev/Gest-Pro.git
cd Gest-Pro
```

### Backend

```bash
cd Backend
mvn spring-boot:run
```

No ambiente local padrão, a API utiliza a porta 8080.

```text
http://localhost:8080
```

### Frontend

```bash
cd FrontEnd
npm install
npm run dev
```

Exemplo de variável de ambiente local.

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Por padrão, o Next.js disponibiliza a aplicação na porta 3000.

```text
http://localhost:3000
```

Credenciais, chaves JWT, senhas, tokens e segredos de serviços externos não devem ser versionados no repositório.

## API

O backend disponibiliza documentação por OpenAPI e Swagger UI quando esse recurso estiver habilitado no ambiente executado.

```text
http://localhost:8080/swagger-ui.html
```

<img src="Img/Documentação-Swagger.png" alt="Documentação da API da Gevyro no Swagger UI" />

A API está organizada por domínios da aplicação, incluindo autenticação, usuários, empresas, caixas, produtos, vendas, clientes, relatórios e configurações.

Os contratos disponíveis no Swagger devem ser considerados a referência atual dos endpoints implementados.

## Segurança

A segurança da aplicação utiliza recursos do ecossistema Spring.

As senhas são armazenadas utilizando BCrypt.

A autenticação das áreas protegidas utiliza Spring Security e JWT.

O token da sessão pode ser armazenado em cookie HttpOnly, evitando acesso direto pelo JavaScript do navegador.

O login com Google utiliza OAuth2.

Operações relacionadas à empresa devem validar o vínculo entre o usuário autenticado e o recurso solicitado.

A alteração de senha utiliza verificação por email conforme o fluxo implementado pela aplicação.

CORS é configurado de acordo com os ambientes autorizados.

Em produção, segredos e credenciais devem permanecer exclusivamente em configurações protegidas do ambiente de execução.

## Planos

A Gevyro possui regras de acesso e limites que podem variar conforme o plano disponível na aplicação.

| Plano | Período | Empresas | Caixas |
| :--- | :---: | :---: | :---: |
| Experimental | 7 dias | 1 | 1 |
| Básico | 30 dias | 1 | 1 |
| Pro | 30 dias | 2 | 3 |
| Premium | 30 dias | Ilimitado | Ilimitado |

As condições comerciais vigentes devem ser consultadas nos canais oficiais da Gevyro, pois preços e características dos planos podem evoluir.

## Produção

A aplicação deve utilizar variáveis de ambiente para todas as informações sensíveis.

Credenciais do banco de dados, chaves JWT, credenciais OAuth2 e senhas de serviços de email não devem ser armazenadas diretamente no código fonte.

O ambiente de produção deve utilizar HTTPS.

Cookies de autenticação utilizados em produção devem possuir configurações adequadas ao ambiente.

O comportamento do Hibernate deve ser configurado conscientemente para produção.

Logs não devem expor tokens, senhas, credenciais ou outras informações sensíveis.

Alterações estruturais do banco devem utilizar uma estratégia controlada de migração.

## Status do projeto

A Gevyro está em desenvolvimento contínuo.

Funcionalidades, contratos da API, regras dos planos e estrutura interna podem evoluir conforme novas versões do produto forem desenvolvidas.

Este repositório representa o desenvolvimento técnico da plataforma e não utiliza alegações de liderança de mercado, quantidade de clientes ou resultados comerciais não comprovados.

## Gevyro

Gevyro é a identidade da plataforma de gestão empresarial.

O nome parte do conceito de Gestão Empresarial. VYRO é uma construção própria da marca inspirada na ideia de virada, transformação e mudança de direção.

Essa ideia é sintetizada pela assinatura:

### Gestão em evolução.

## Informações institucionais

**Marca:** Gevyro

**Segmento:** Software de gestão empresarial

**CNPJ:** 68.259.534/0001-70

**Website:** https://www.gevyro.com.br

## Autor e desenvolvimento

A Gevyro é desenvolvida por **Matheus Martins**, MartnsDev.

**GitHub:** https://github.com/MartnsDev

**LinkedIn:** https://www.linkedin.com/in/matheusmartnsdev/

## Licença

```text
Copyright © 2025 Matheus Martins

Todos os direitos reservados.

O software e seu código fonte são de propriedade de seu autor.

Cópia, modificação, distribuição ou utilização não autorizada deste código
dependem de autorização expressa do titular dos direitos.
```

<div align="center">

<br />

### Gevyro

**Gestão em evolução.**

Software de gestão empresarial.

</div>
