# GestPro Frontend

Interface do **GestPro**, um sistema completo de gestão para mercados e lojas, desenvolvido com **Next.js 14+** (App Router) e integração com o backend em **Spring Boot 3**.

> 🔗 Repositório do backend: [GestPro Backend](https://github.com/MartnsDev/GestPro/tree/97003ec661c1babf34f53533396ced94d0c0b9cb/gestpro-backend)

---

## 🚀 Tecnologias Utilizadas

### ⚛️ Frontend
- [Next.js 14+ (App Router)](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)
---
## 📋 Pré-requisitos

Certifique-se de ter instalado:

- **Node.js 18+**
- **pnpm** (ou npm/yarn)
- Backend em execução (porta padrão `8080`)

---

## ⚙️ Configuração e Execução

### 1️⃣ Clonar o repositório
```bash
git clone https://github.com/MartnsDev/GestPro.git
cd GestPro/frontend
```
2️⃣ Instalar dependências
```
pnpm install
```
3️⃣ Configurar variáveis de ambiente
Copie o arquivo de exemplo:

```
cp .env.local.example .env.local
```
Edite o arquivo .env.local e configure a URL da API:
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```
4️⃣ Rodar o servidor de desenvolvimento
```
npm run dev
```
Acesse o app em:
```
👉 http://localhost:3000
```
📁 Estrutura de Pastas
```
frontend/
├── app/                     # Páginas (App Router)
│   ├── page.tsx            # Tela de Login
│   ├── cadastro/           # Página de Cadastro
│   ├── dashboard/          # Painel principal
│   └── esqueceu-senha/     # Recuperação de senha
├── components/              # Componentes reutilizáveis
│   ├── auth/               # Formulários de autenticação
│   └── ui/                 # Componentes do shadcn/ui
├── lib/                     # Funções utilitárias
│   ├── api.ts              # Comunicação com o backend
│   └── auth.ts             # Funções de autenticação JWT
├── public/                  # Arquivos estáticos
└── styles/                  # Estilos globais e customizados
```

🎨 Design System
```
Cores principais:
Verde: #10b981
Azul escuro: #0a1929
Componentes: shadcn/ui
Totalmente responsivo (desktop, tablet e mobile)
Ícones: Lucide React
```
📜 Licença
```
Este projeto não pode ser copiado, reproduzido ou utilizado sem autorização do autor.
Todos os direitos reservados a Matheus Martins (MartnsDev).
```
Feito com 💚 por Matheus Martins [Linkedin](https://www.linkedin.com/in/matheusmartnsdev/)
