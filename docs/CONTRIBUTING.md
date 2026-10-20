# Guia de contribuição
 
Obrigado pelo interesse em contribuir com o site do **IFINOS**! Este guia descreve o fluxo de trabalho e as convenções do projeto. Para configurar o ambiente local, veja o [README](./README.md#configuração-do-ambiente).
 
## Sumário
 
- [Como posso contribuir?](#como-posso-contribuir)
- [Reportando bugs e sugerindo melhorias](#reportando-bugs-e-sugerindo-melhorias)
- [Fluxo de trabalho](#fluxo-de-trabalho)
- [Padrão de branches](#padrão-de-branches)
- [Padrão de commits](#padrão-de-commits)
- [Pull requests](#pull-requests)
- [Padrões de código](#padrões-de-código)
- [Banco de dados](#banco-de-dados)
- [Segurança](#segurança)
 
## Como posso contribuir?
 
- Reportando bugs ou problemas de acessibilidade.
- Sugerindo novas funcionalidades ou melhorias.
- Corrigindo bugs ou implementando funcionalidades.
- Melhorando a documentação.
 
## Reportando bugs e sugerindo melhorias
 
Antes de abrir uma issue, verifique se já não existe uma parecida. Ao reportar um bug, inclua:
 
- **Descrição** do problema e do comportamento esperado.
- **Passos para reproduzir** (página/rota, ações executadas).
- **Ambiente**: navegador, sistema operacional, tema (claro/escuro), tipo de usuário (visitante, membro, professor, admin).
- **Capturas de tela** ou mensagens de erro do console, se houver.
 
Para sugestões, descreva o problema que a funcionalidade resolve e, se possível, uma proposta de solução.
 
## Fluxo de trabalho
 
1. **Fork** o repositório (ou, se você faz parte da equipe, clone-o diretamente).
2. Atualize sua `main` local:
   ```bash
   git checkout main
   git pull origin main
   ```
3. Crie uma branch a partir da `main` seguindo o [padrão de branches](#padrão-de-branches):
   ```bash
   git checkout -b feat/nome-da-funcionalidade
   ```
4. Faça suas alterações em commits pequenos e descritivos.
5. Antes de enviar, verifique localmente que o lint e o build passam (são os mesmos passos do CI):
   ```bash
   npm run lint
   npm run build
   ```
6. Envie a branch e abra um **pull request para a `main`**:
   ```bash
   git push origin feat/nome-da-funcionalidade
   ```
 
## Padrão de branches
 
Use o formato `tipo/descricao_curta`, com o mesmo tipo usado nos commits:
 
| Prefixo | Uso | Exemplo |
| --- | --- | --- |
| `feat/` | Nova funcionalidade | `feat/merchandise_system` |
| `fix/` | Correção de bug | `fix/bug_fixing` |
| `docs/` | Documentação | `docs/readme` |
| `chore/` | Manutenção, dependências, versão | `chore/update_deps` |
| `ci/` | Workflows do GitHub Actions | `ci/build_workflow` |
 
## Padrão de commits
 
O projeto segue o [Conventional Commits](https://www.conventionalcommits.org/pt-br/), com a descrição **em português**, iniciando com verbo no presente e letra maiúscula:
 
```
<tipo>: <descrição>
```
 
Tipos usados no projeto:
 
| Tipo | Quando usar |
| --- | --- |
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug ou ajuste |
| `chore` | Tarefas de manutenção (versão, dependências, scripts SQL) |
| `ci` | Alterações em workflows de CI |
| `seo` | Melhorias de SEO (manifest, sitemap, robots, metadados) |
| `docs` | Documentação |
| `refactor` | Refatoração sem mudança de comportamento |
| `style` | Ajustes visuais/CSS sem mudança de lógica |
 
Exemplos reais do histórico:
 
```
feat: Adiciona dark theme ao site
fix: Ajusta as políticas CSP para o VLibras
chore: Atualiza o supabase_scripts.sql
ci: Adiciona workflow de build automático em PRs
```
 
## Pull requests
 
- Abra o PR contra a branch `main`.
- Use um título no mesmo padrão dos commits (ex.: `feat: Adiciona página de meus pedidos`).
- Na descrição, explique **o que** foi alterado e **por quê**, relacione a issue (ex.: `Closes #12`) e inclua capturas de tela para mudanças visuais (inclusive no tema escuro).
- O **CI precisa passar** (`npm run lint` e `npm run build`).
- Mantenha o PR focado em um único assunto; PRs menores são revisados mais rápido.
- Se a mudança altera o banco de dados, atualize o `supabase_scripts.sql` no mesmo PR (veja [Banco de dados](#banco-de-dados)).
- **Versão**: ao preparar um release, atualize o campo `version` do `package.json` seguindo o [SemVer](https://semver.org/lang/pt-BR/) (`MAJOR.MINOR.PATCH`) em um commit `chore`, por exemplo `chore: Adiciona a versão 1.0.1`. A versão é exibida no rodapé do site.
- Aguarde a revisão de outro integrante antes do merge.
 
## Padrões de código
 
### Geral
 
- JavaScript/JSX com o **App Router** do Next.js. Não há TypeScript no projeto.
- Rode `npm run lint` e corrija todos os avisos antes de abrir o PR.
- Formatação: aspas duplas, ponto e vírgula, vírgula final e indentação de 2 espaços (padrão do Prettier). Mantenha o estilo dos arquivos existentes.
- Use o alias `@/` para importar a partir de `src/` (ex.: `import { createClient } from "@/_lib/supabase/client";`).
- Comentários e textos da interface são escritos **em português**.
 
### Organização de imports
 
Agrupe os imports com comentários, como nos arquivos existentes:
 
```jsx
"use client";
// Utils
import styles from "./Header.module.css";
 
// Components
import Link from "next/link";
 
// Hooks
import { useState } from "react";
import { createClient } from "@/_lib/supabase/client";
 
// Images
import logo from "@/imgs/logo.svg";
```
 
### Componentes e estilos
 
- Componentes reutilizáveis ficam em `src/app/components/NomeDoComponente/`, com `NomeDoComponente.jsx` e `NomeDoComponente.module.css`.
- Use **CSS Modules** para estilos de páginas e componentes; estilos globais e variáveis de cor (incluindo o tema escuro) ficam em `src/app/globals.css`. Use as variáveis de cor existentes para manter a compatibilidade com os temas claro/escuro.
- Páginas seguem a estrutura de pastas do App Router (`page.jsx` + `page.module.css`), agrupadas por *route groups* (`(app)`, `(auth)`, ...).
- Lógica compartilhada sem UI vai para `src/_lib/` (utilitários, hooks, constantes).
- Validadores de etapas do formulário em etapas ficam em `src/app/components/MultiStepForm/validators/`.
- Pense em **acessibilidade**: textos alternativos em imagens, `label` em campos de formulário, contraste adequado nos dois temas.
 
### Supabase
 
- Em Client Components (`"use client"`), use `createClient` de `@/_lib/supabase/client`.
- Em Server Components e Route Handlers, use o cliente de `@/_lib/supabase/server`.
- A `SUPABASE_SERVICE_ROLE_KEY` só pode ser usada em código de servidor (rotas em `src/app/api/`), nunca em componentes cliente.
 
### Rotas protegidas
 
- Ao criar uma página ou rota de API que exige login ou um role específico, registre-a em `ROUTE_PERMISSIONS` em `src/_lib/auth/permissions.js`.
- Verifique também as permissões no servidor/banco (RLS), não apenas na interface.
- Se a rota carrega recursos de um novo domínio externo (scripts, imagens, iframes), atualize a **Content-Security-Policy** e `images.remotePatterns` em `next.config.mjs`.
 
## Banco de dados
 
- O arquivo `supabase_scripts.sql` é a fonte de verdade do schema (tabelas, funções, políticas de RLS, view e dados iniciais).
- Toda alteração no banco (nova tabela, coluna, policy, função) deve ser refletida nesse arquivo no mesmo PR.
- Novas tabelas devem ter **RLS habilitado** e policies explícitas.
- Descreva no PR os comandos SQL necessários para aplicar a mudança em um banco já existente.
 
## Segurança
 
- **Nunca** faça commit de chaves, senhas ou arquivos `.env*`.
- Se encontrar uma vulnerabilidade, **não** abra uma issue pública; entre em contato diretamente com os mantenedores pelo e-mail ifinos.ifpr@gmail.com.