# IFINOS

Site do **IFINOS**, grupo de pesquisa do IFPR – Campus Assis Chateaubriand (originado do Grupo de Estudos em Computação Física e Sistemas Embarcados e unido ao grupo **gesin** – Energias, Sustentabilidade, Inovação e Mobilidades). O sistema divulga notícias, projetos e demandas do grupo, gerencia usuários e permissões e possui uma loja de produtos (**Shoppinos**).

## Sumário

- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Configuração do ambiente](#configuração-do-ambiente)
- [Scripts disponíveis](#scripts-disponíveis)
- [Autenticação e permissões](#autenticação-e-permissões)
- [Rotas de API](#rotas-de-api)
- [CI/CD](#cicd)
- [Versionamento](#versionamento)
- [Como contribuir](#como-contribuir)

## Funcionalidades

- **Notícias** (`/home`): listagem, detalhes, publicação e edição de notícias por meio de um formulário em etapas (`MultiStepForm`).
- **Projetos e demandas** (`/projetos`, `/demandas`): cadastro, edição, integrantes, tags, linhas de pesquisa, tipo e status.
- **Shoppinos** (`/shoppinos`): catálogo de produtos com carrinho, envio de pedidos por e-mail, página "Meus pedidos" e painel de gerenciamento de produtos e pedidos.
- **Contas de usuário**: cadastro/login com e-mail e senha ou Google, confirmação de e-mail, recuperação de senha, edição e exclusão do próprio perfil (`/meu-perfil`).
- **Administração** (`/sistema`): gerenciamento de usuários/grupos e configurações do sistema (ex.: e-mail responsável pelos produtos).
- **Fale conosco** (`/fale-conosco`): envio de mensagens por e-mail (Brevo).
- **Acessibilidade e UX**: tema claro/escuro (`next-themes`), widget do VLibras, notificações com `sonner`.
- **SEO**: `manifest`, `sitemap` e `robots` gerados pelo Next.js.

## Tecnologias

| Camada | Tecnologia |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router) + [React 19](https://react.dev) com React Compiler |
| Linguagem | JavaScript (JSX) |
| Estilos | CSS Modules + `globals.css` |
| Banco de dados / Auth | [Supabase](https://supabase.com) (PostgreSQL, Auth, RLS) via `@supabase/ssr` |
| Upload de imagens | [Cloudinary](https://cloudinary.com) (upload assinado) |
| E-mails | [Brevo](https://www.brevo.com) (API SMTP) |
| Ícones | Font Awesome |
| Lint | ESLint 9 + `eslint-config-next` |

## Estrutura do projeto

```
.
├── .github/workflows/      # CI (lint + build) e keep-alive do Brevo
├── public/                 # Ícones e favicon
├── src/
│   ├── _lib/               # Código compartilhado (sem UI)
│   │   ├── auth/           # roles.js (hierarquia) e permissions.js (permissão por rota)
│   │   ├── constants/      # Constantes (status de pedidos, temas)
│   │   ├── hooks/          # Hooks customizados
│   │   ├── supabase/       # Clientes Supabase para browser (client.js) e servidor (server.js)
│   │   └── utils/          # Funções utilitárias (paginação, telefone, ...)
│   ├── app/                # App Router do Next.js
│   │   ├── (app)/          # Páginas principais (home, projetos, demandas, shoppinos, sistema, ...)
│   │   ├── (auth)/         # Login, cadastro, confirmação de e-mail, recuperação de senha
│   │   ├── (coming_soon)/  # Layout de "em desenvolvimento"
│   │   ├── api/            # Route handlers (rotas de API)
│   │   ├── auth/           # Callback OAuth e logout
│   │   ├── components/     # Componentes reutilizáveis (Componente/Componente.jsx + .module.css)
│   │   └── providers/      # Providers (tema)
│   ├── context/            # Contexto do usuário logado (userContext)
│   ├── imgs/               # Imagens importadas pelos componentes
│   └── proxy.js            # Proteção de rotas (antigo middleware do Next.js)
├── supabase_scripts.sql    # Script completo do schema do banco (tabelas, RLS, triggers, seed)
├── next.config.mjs         # Configuração do Next.js (CSP, imagens remotas, versão do site)
└── eslint.config.mjs
```

O alias `@/` aponta para `src/` (veja `jsconfig.json`).

## Pré-requisitos

- [Node.js](https://nodejs.org) **22** (mesma versão usada no CI) e npm
- Um projeto no [Supabase](https://supabase.com)
- (Opcional) Contas no [Cloudinary](https://cloudinary.com) — upload de imagens — e no [Brevo](https://www.brevo.com) — envio de e-mails

## Configuração do ambiente

### 1. Clonar e instalar dependências

```bash
git clone https://github.com/Mateus-Rosler/sistema_ifinos.git
cd sistema_ifinos
npm ci
```

### 2. Configurar o banco de dados (Supabase)

1. Crie um projeto no Supabase.
2. No **SQL Editor**, execute o conteúdo de [`supabase_scripts.sql`](./supabase_scripts.sql) em um banco novo. O script cria as tabelas, funções auxiliares, políticas de RLS, a view `usuarios_completos`, o trigger que cadastra novos usuários no grupo "Visitantes" e os grupos iniciais.
3. Em **Authentication → Providers**, habilite e-mail/senha e, se desejar, o provedor **Google**.
4. Em **Authentication → URL Configuration**, adicione `http://localhost:3000/auth/callback` (e a URL de produção) às URLs de redirecionamento.
5. Cadastre os registros de referência que o sistema usa (ex.: `status_projeto`, `tipo_projeto`, `tags`, `linha_de_pesquisa`) e uma linha em `configuracoes_sistema`.
6. Para ter acesso de administrador, crie sua conta pelo site e associe seu usuário ao grupo **Administradores** na tabela `usuarios_grupos`.

### 3. Variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto (arquivos `.env*` são ignorados pelo git):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<seu-projeto>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<chave-publishable/anon>
SUPABASE_SERVICE_ROLE_KEY=<chave-service-role>

# URL pública do site (usada em redirecionamentos de auth, sitemap, robots, ...)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Cloudinary (upload de imagens)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<cloud-name>
NEXT_PUBLIC_CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>

# Brevo (envio de e-mails: fale conosco e pedidos)
BREVO_API_KEY=<api-key>
```

| Variável | Obrigatória | Uso |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Sim | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Sim | Chave pública do Supabase (browser e servidor) |
| `SUPABASE_SERVICE_ROLE_KEY` | Sim | Rotas de API administrativas (usuários, exclusão de perfil, pedidos). **Nunca exponha no cliente.** |
| `NEXT_PUBLIC_SITE_URL` | Sim | URL base do site |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Para upload | Nome da conta Cloudinary |
| `NEXT_PUBLIC_CLOUDINARY_API_KEY` | Para upload | Chave da API Cloudinary |
| `CLOUDINARY_API_SECRET` | Para upload | Assinatura dos uploads (somente servidor) |
| `BREVO_API_KEY` | Para e-mails | Envio de e-mails transacionais |

`NEXT_PUBLIC_SITE_VERSION` é definida automaticamente em `next.config.mjs` a partir do campo `version` do `package.json` e exibida no rodapé.

### 4. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) — a raiz redireciona para `/home`.

## Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção |
| `npm run start` | Inicia o servidor de produção (após o build) |
| `npm run lint` | Executa o ESLint |

## Autenticação e permissões

A autenticação é feita pelo Supabase Auth. Cada usuário pertence a um ou mais **grupos** (tabela `grupos`), que são convertidos em um **role** em `src/_lib/auth/roles.js`. Vale sempre o role de maior nível:

| Grupo | Role | Nível |
| --- | --- | --- |
| Visitantes (padrão ao se cadastrar) | `visitor` | 0 |
| Membros de Projetos | `member` | 1 |
| Professores | `professor` | 2 |
| Administradores | `admin` | 3 |

O role mínimo exigido por rota é definido em `ROUTE_PERMISSIONS` (`src/_lib/auth/permissions.js`) e verificado em `src/proxy.js`, que roda antes de cada requisição. Rotas que não estão no mapa são públicas. No banco, as políticas de **Row Level Security** (em `supabase_scripts.sql`) garantem as mesmas regras do lado dos dados.

Para proteger uma nova rota, adicione-a em `ROUTE_PERMISSIONS` com o role mínimo.

## Rotas de API

| Rota | Métodos | Descrição |
| --- | --- | --- |
| `/api/admin/usuarios` | `GET`, `PATCH`, `DELETE` | Listar usuários, alterar grupo e excluir usuários (admin) |
| `/api/perfil/deletar` | `DELETE` | Excluir a própria conta |
| `/api/contact` | `POST` | Enviar mensagem do "Fale conosco" via Brevo |
| `/api/merchandise/pedido` | `POST` | Registrar pedido e notificar o responsável por e-mail |
| `/api/upload` | `POST` | Gerar assinatura para upload no Cloudinary |
| `/api/upload/produto` | `POST` | Gerar assinatura para upload de imagem de produto |
| `/auth/callback` | `GET` | Callback do login OAuth / confirmação de e-mail |
| `/auth/logout` | `POST` | Encerrar a sessão |

## CI/CD

- **CI** (`.github/workflows/ci.yml`): em todo PR e push para `main`, roda `npm ci`, `npm run lint` e `npm run build` com Node 22. Os secrets `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL` e `SUPABASE_SERVICE_ROLE_KEY` precisam estar configurados no repositório.
- **Brevo Keep Alive** (`.github/workflows/brevo-keep-alive.yml`): envia um e-mail automático a cada dois meses para manter a conta do Brevo ativa (requer o secret `BREVO_API_KEY`).

## Versionamento

O projeto segue [Versionamento Semântico](https://semver.org/lang/pt-BR/). A versão fica no campo `version` do `package.json` e aparece no rodapé do site.

## Como contribuir

Contribuições são bem-vindas! Leia o [guia de contribuição](./CONTRIBUTING.md) antes de abrir uma issue ou pull request.

## Créditos

O site é resultado do trabalho de estudantes participantes dos projetos do grupo IFINOS. A versão atual (2026) foi idealizada e desenvolvida por **Arthur Gehlen**, **Marcelo Gergen Urban** e **Mateus Vinicios Rosler**. Veja o histórico completo na página [`/sobre`](./src/app/%28app%29/sobre/page.jsx).