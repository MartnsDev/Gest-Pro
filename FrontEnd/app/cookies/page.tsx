import { LegalShell } from "@/components/legal/legal-shell";
import { CookiePreferencesButton } from "@/components/cookie-preferences-button";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata({ title: "Política de Cookies", description: "Conheça os cookies, armazenamentos locais e preferências utilizados pela plataforma Gevyro.", path: "/cookies" });
export default function CookiesPage() { return <LegalShell title="Política de Cookies" description="Resultado da análise das tecnologias de armazenamento e preferências encontradas no frontend da Gevyro.">
  <h2>1. O que encontramos</h2><p>A aplicação utiliza cookie de autenticação <code>jwt_token</code>, cookie de CSRF e sessão temporária do OAuth no backend. O frontend usa armazenamento local para tema, preferências de cookies, empresa/caixa selecionados e limpeza de tokens legados. O componente de sidebar pode gravar uma preferência funcional. Não foram encontrados pixels, Google Analytics, Hotjar, Clarity ou cookies de publicidade ativos.</p>
  <h2>2. Estritamente necessários</h2><p>Autenticação, proteção CSRF, segurança e estado temporário do login Google são necessários ao serviço. Eles não são usados para publicidade e não podem ser desativados pelo gerenciador sem comprometer a conta.</p>
  <h2>3. Funcionais</h2><p>O tema visual e estados de interface melhoram a experiência. A seleção de empresa e caixa é isolada por usuário no navegador. Esses dados não devem conter senhas ou o JWT. O tema pode ser alterado nas configurações.</p>
  <h2>4. Analíticos e marketing</h2><p>Nenhuma tecnologia dessas categorias foi identificada no código auditado. As opções aparecem no gerenciador para preparar uma escolha granular futura, mas marcá-las hoje não carrega serviços inexistentes. Qualquer integração futura deverá consultar a preferência antes de iniciar.</p>
  <h2>5. Gerenciar preferências</h2><p>Você pode reabrir o painel pelo botão abaixo. Limpar dados do navegador também remove a escolha e poderá exibir o aviso novamente.</p>
  <CookiePreferencesButton />
  <h2>6. Alterações</h2><p>Esta política deve ser revisada sempre que uma nova tecnologia, fornecedor ou finalidade for adicionada.</p>
</LegalShell>; }
