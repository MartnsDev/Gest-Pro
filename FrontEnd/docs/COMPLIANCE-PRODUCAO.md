# Preparação jurídica, LGPD e segurança — GEVYRO

Última revisão técnica: 18/08/2026. Este documento é operacional e não substitui revisão jurídica.

## Pendências empresariais e jurídicas

- Informar razão social e endereço oficial vinculados ao CNPJ 68.259.534/0001-70.
- Definir canal do encarregado ou canal exclusivo de privacidade.
- Aprovar regras do teste de 30 dias, cancelamento, acesso após cancelamento, inadimplência e reembolso.
- Aprovar tabela de retenção por categoria (cadastro, fiscal, vendas, logs, suporte, cobrança e backups).
- Versionar documentos fora do código ou preservar snapshots imutáveis de cada versão publicada.
- Implementar registro auditável da versão apresentada/aceita somente quando a base legal exigir ciência ou aceite.

## Cookies e armazenamento encontrados

- Backend: `jwt_token`, CSRF e sessão temporária do OAuth2.
- Frontend: preferência de tema, consentimento, sidebar e empresa/caixa selecionados por usuário.
- Existem leituras legadas de JWT em `sessionStorage`/`document.cookie` no dashboard; migrar para cookie HttpOnly e `credentials: include`.
- Não foram encontrados Google Analytics, pixels, Hotjar, Clarity ou publicidade ativa.

## Integrações identificadas no código

- Stripe: checkout, assinatura, portal e webhooks.
- Google OAuth2: identidade de login.
- Resend e SMTP: e-mails transacionais.
- Cloudinary: arquivos/imagens de perfil.
- MySQL e Redis: persistência e dados temporários.
- Shopee e Mercado Livre: integrações opcionais de marketplace.
- Railway aparece como URL padrão do backend. O fornecedor final de frontend, banco e monitoramento deve ser confirmado no inventário de operadores.

## Segurança — correções prioritárias no backend

1. Corrigir `GlobalExceptionHandler`: a resposta genérica 500 não deve retornar `ex.getMessage()` em produção; usar mensagem neutra e identificador de correlação.
2. Desabilitar Swagger em produção também na cadeia do Spring Security ou condicionar os matchers ao profile.
3. Implementar rate limiting distribuído em login, cadastro, recuperação e confirmação; usar resposta uniforme para evitar enumeração.
4. Auditar IDOR em todos os services/repositories. IDs recebidos do cliente devem ser sempre combinados com empresa/usuário obtidos do `Authentication`.
5. Criptografar tokens de marketplace armazenados em `marketplace_connection` e nunca registrá-los.
6. Remover SQL DEBUG/TRACE e dados pessoais dos logs de produção; definir mascaramento e controle de acesso.
7. Validar `app.cookie.secure=true`, `SameSite` compatível com os domínios reais e HTTPS fim a fim atrás do proxy.
8. Corrigir os testes de Stripe para injetar/usar mocks; eles não devem realizar chamadas externas.
9. Criar configuração de teste para serviços externos (incluindo `RESEND_API_KEY` falsa ou bean mockado).
10. Revisar o método de portal: o código auditado cria `com.stripe.model.checkout.Session`; o Billing Portal deve usar a API própria `billingportal.Session`.

## Exclusão e direitos do titular

Não executar exclusão em cascata sem inventário. O fluxo recomendado é: autenticar solicitante, registrar solicitação, bloquear novas operações quando adequado, classificar dados por obrigação de retenção, exportar quando aplicável, anonimizar referências operacionais, eliminar dados sem base de retenção e registrar evidência mínima da conclusão. Dados fiscais e antifraude precisam de avaliação específica.

## Incidentes

1. Registrar data, descoberta, sistemas, categorias de dados e responsável.
2. Conter sem destruir evidências e rotacionar credenciais afetadas.
3. Avaliar alcance, titulares, probabilidade e gravidade do dano.
4. Corrigir, testar e monitorar recorrência.
5. Submeter eventual comunicação à ANPD/titulares a avaliação humana jurídica e técnica.
6. Fazer retrospectiva e acompanhar ações corretivas.

## Backup e restauração

Devem ser cobertos: MySQL, arquivos necessários, configurações versionadas e segredos por mecanismo seguro. Confirmar frequência, criptografia, segregação, retenção e RPO/RTO. Testar restauração periodicamente. Não há evidência suficiente no repositório para afirmar que backups já existem.

## Resultado dos testes em 18/08/2026

- Frontend: `tsc --noEmit` possui erros preexistentes em módulos de dashboard; nenhum erro foi encontrado nos novos arquivos jurídicos. `next build` ficou indefinidamente na otimização e foi interrompido.
- Backend: 48 testes executados; 1 falha e 10 erros. Causas principais: `RESEND_API_KEY` ausente no profile de teste e testes Stripe realizando chamada externa/mocks incompatíveis.
