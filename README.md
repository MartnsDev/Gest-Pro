<div align="center">

<img src="Img/gevyro-fav-br.png" alt="Gevyro" width="90" />

# Gevyro

### Gestão em evolução.

Plataforma de gestão empresarial criada para centralizar vendas, estoque, caixa, clientes e informações importantes da operação em um único ambiente.

<br />

[Conheça a Gevyro](https://www.gevyro.com.br) · [Produto](#uma-visão-mais-clara-do-negócio) · [Tecnologia](#tecnologia) · [Segurança](#segurança)

<br />

[![Java](https://img.shields.io/badge/Java-17%2B-ED8B00?style=flat-square&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-14%2B-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8%2B-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com/)

</div>

<br />

## Administrar uma empresa não deveria significar procurar informações em vários lugares

Uma venda acontece.

O estoque muda.

O caixa recebe uma movimentação.

Um cliente compra.

Novos dados são gerados.

Quando cada uma dessas informações está em um lugar diferente, entender o que realmente está acontecendo com a empresa se torna mais difícil do que deveria.

A Gevyro nasceu para reunir essa operação.

Vendas, estoque, produtos, clientes, caixa e indicadores passam a fazer parte de um mesmo ambiente.

Não para adicionar mais uma ferramenta à rotina.

Para tornar a gestão mais clara.

<br />

<div align="center">

### Sua operação em um só lugar.

Vendas · Estoque · Caixa · Clientes · Empresas · Relatórios

</div>

<br />

## Uma visão mais clara do negócio

A Gevyro organiza diferentes partes da operação para que elas funcionem de maneira conectada.

Uma venda registrada no PDV não termina na tela de vendas.

Ela movimenta o estoque, pertence a um caixa, pode estar relacionada a um cliente e passa a fazer parte dos indicadores utilizados para acompanhar a empresa.

É essa conexão que transforma registros isolados em informação útil.

<br />

<table>
<tr>
<td width="50%" valign="top">

### Vendas

Uma frente de caixa integrada à operação.

Produtos, descontos, diferentes formas de pagamento, troco, histórico e cancelamentos fazem parte do mesmo fluxo.

</td>
<td width="50%" valign="top">

### Estoque

A quantidade disponível acompanha as movimentações realizadas pelo sistema.

Produtos podem possuir informações de custo, venda, margem, categoria, código de barras e estoque mínimo.

</td>
</tr>

<tr>
<td width="50%" valign="top">

### Caixa

Abertura, movimentações e fechamento ficam relacionados às vendas realizadas durante a operação.

</td>
<td width="50%" valign="top">

### Clientes

Informações comerciais podem ser centralizadas e relacionadas às operações realizadas pela empresa.

</td>
</tr>

<tr>
<td width="50%" valign="top">

### Indicadores

Os dados gerados pela própria operação alimentam dashboards e relatórios para facilitar o acompanhamento do negócio.

</td>
<td width="50%" valign="top">

### Empresas

Uma conta pode trabalhar com diferentes empresas conforme as regras de acesso disponíveis, mantendo suas operações separadas.

</td>
</tr>
</table>

<br />

## A Gevyro por dentro

<table>
<tr>
<td align="center" width="50%">
<img src="Img/lading-gp-dark.png" alt="Página inicial da Gevyro" />
<br />
<sub><b>Experiência de entrada da plataforma</b></sub>
</td>

<td align="center" width="50%">
<img src="Img/dashboard-gp-dark.png" alt="Dashboard da Gevyro" />
<br />
<sub><b>Visão geral da operação</b></sub>
</td>
</tr>

<tr>
<td align="center" width="50%">
<img src="Img/vendas-gp-dark.png" alt="Área de vendas da Gevyro" />
<br />
<sub><b>Vendas e frente de caixa</b></sub>
</td>

<td align="center" width="50%">
<img src="Img/relatorios-gp-dark.png" alt="Relatórios da Gevyro" />
<br />
<sub><b>Indicadores e análise da operação</b></sub>
</td>
</tr>
</table>

<br />

## Da operação para a informação

A arquitetura do produto acompanha o fluxo da operação empresarial.

```text
Empresa

    Produtos
        ↓
      Venda
        ↓
      Caixa

        ↓

Dados da operação

        ↓

Dashboard
Relatórios
Indicadores
```

Cada módulo possui sua responsabilidade, mas os dados trabalham em conjunto.

Isso permite que a plataforma evolua sem transformar cada nova funcionalidade em uma ferramenta isolada.

<br />

## Tecnologia

A Gevyro também é um projeto de engenharia de software.

A interface é construída com Next.js, React e TypeScript.

A API utiliza Java e Spring Boot, com Spring Security para autenticação e autorização e Spring Data JPA para persistência.

O MySQL mantém os dados relacionais da aplicação.

```text
Next.js + React + TypeScript

            ↓

        REST API

            ↓

Java + Spring Boot + Spring Security

            ↓

           MySQL
```

A aplicação também utiliza JWT, OAuth2, Hibernate, Jakarta Validation, Maven, Tailwind CSS e ferramentas complementares do ecossistema utilizado pelo projeto.

A documentação técnica detalhada do backend fica disponível em:

```text
Backend/README.md
```

<br />

## Segurança

Recursos protegidos passam pelas camadas de autenticação e autorização da aplicação.

A Gevyro utiliza Spring Security, BCrypt para senhas, autenticação baseada em JWT e suporte a OAuth2.

Sessões podem utilizar cookies HttpOnly para impedir que o token seja acessado diretamente pelo JavaScript executado no navegador.

O acesso aos dados empresariais considera a relação entre o usuário autenticado e a empresa responsável pelo recurso solicitado.

Segredos, credenciais e chaves utilizadas pelos ambientes da aplicação não devem fazer parte do código fonte versionado.

<br />

## Construída para evoluir

Gevyro não foi escolhida apenas como um novo nome para um sistema.

O nome representa a direção do produto.

**GE** parte de Gestão Empresarial.

**VYRO** é uma construção própria inspirada na ideia de virada, transformação e mudança de direção.

Uma empresa muda todos os dias.

Novos clientes chegam.

Produtos mudam.

Vendas acontecem.

Decisões precisam ser tomadas.

A tecnologia que acompanha essa operação também precisa evoluir.

É daí que nasce a assinatura da marca.

<div align="center">

## Gestão em evolução.

</div>

<br />

## Desenvolvimento

A Gevyro está em desenvolvimento contínuo.

Novos recursos, melhorias de experiência, alterações de arquitetura e evolução das regras de negócio fazem parte do desenvolvimento do produto.

Este repositório representa a implementação técnica da plataforma.

Informações sobre endpoints, configuração do ambiente, arquitetura do backend e execução local ficam concentradas na documentação técnica do projeto.

<br />

## Informações institucionais

**Marca:** Gevyro

**Segmento:** Software de gestão empresarial

**CNPJ:** 68.259.534/0001-70

**Website:** [www.gevyro.com.br](https://www.gevyro.com.br)

<br />

## Desenvolvimento e autoria

Desenvolvido por **Matheus Martins · MartnsDev**

[GitHub](https://github.com/MartnsDev) · [LinkedIn](https://www.linkedin.com/in/matheusmartnsdev/)

<br />

## Direitos

Copyright © 2025 Matheus Martins.

Todos os direitos reservados.

O código fonte e os demais componentes deste repositório permanecem sujeitos aos termos definidos pelo titular dos direitos.

Consulte o arquivo `LICENSE` para informações aplicáveis ao uso do código.

<br />

<div align="center">

<img src="Img/gestpro-img.jpg" alt="Gevyro" width="55" />

### GEVYRO

**Gestão em evolução.**

[www.gevyro.com.br](https://www.gevyro.com.br)

</div>
