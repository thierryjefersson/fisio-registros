# Stack e dependências

## Stack definida

- Next.js App Router + TypeScript.
- React 19.
- pnpm.
- PostgreSQL 16 via Docker Compose.
- Prisma ORM com migrations versionadas.
- React Hook Form + Zod.
- shadcn/ui sobre Base UI, tema claro e cor Emerald.
- Tailwind CSS.
- `react-number-format` para entradas monetárias e telefones.
- Componentes shadcn/ui/Base UI para controles de formulário, calendário, diálogos e Sonner.
- `@mdxeditor/editor` para edição visual de Markdown.
- `react-markdown` para leitura segura.
- Vitest e Testing Library.

## Snapshot de versões

Versões estáveis consultadas no registro npm em **18/09/2026**. O início da implementação deve repetir a consulta e aceitar patch/minor mais recente compatível. Pré-lançamentos não são usados; por isso Prisma 8 RC foi descartado em favor da linha estável 7.10.

### Produção

| Pacote                | Versão consultada | Uso                              |
| --------------------- | ----------------: | -------------------------------- |
| `next`                |            16.3.5 | Framework full-stack             |
| `react`               |            19.3.0 | Interface                        |
| `react-dom`           |            19.3.0 | Renderização React               |
| `@prisma/client`      |            7.10.0 | Cliente ORM                      |
| `@prisma/adapter-pg`  |            7.10.0 | Adapter PostgreSQL do Prisma     |
| `pg`                  |            8.23.0 | Driver PostgreSQL                |
| `react-hook-form`     |            7.88.0 | Estado de formulários            |
| `zod`                 |             4.6.5 | Validação                        |
| `@hookform/resolvers` |             5.9.1 | Integração RHF/Zod               |
| `@mdxeditor/editor`   |             4.2.5 | Editor visual Markdown           |
| `react-markdown`      |            10.1.0 | Renderização Markdown            |
| `react-number-format` |             5.4.5 | Campos monetário e de telefone   |
| `date-fns`            |             4.4.0 | Operações com datas civis        |
| `react-day-picker`    |            10.0.1 | Calendário do DatePicker         |
| `sonner`              |             2.0.8 | Toasts de confirmação            |
| `next-themes`         |             0.4.6 | Provedor de tema claro           |
| `lucide-react`        |            1.47.0 | Ícones                           |
| `@base-ui/react`      |             1.8.0 | Primitivos usados pelo shadcn/ui |

### Desenvolvimento

| Pacote                      | Versão consultada | Uso                               |
| --------------------------- | ----------------: | --------------------------------- |
| `typescript`                |             6.0.3 | Tipagem/compilação                |
| `prisma`                    |            7.10.0 | CLI, geração e migrations         |
| `tsx`                       |           4.23.13 | Execução de scripts TypeScript    |
| `dotenv`                    |            18.0.0 | Variáveis no Prisma config        |
| `tailwindcss`               |             4.3.3 | Estilos                           |
| `shadcn`                    |            4.21.0 | CLI de componentes                |
| `vitest`                    |             5.0.1 | Testes                            |
| `@vitejs/plugin-react`      |             6.1.1 | React no Vitest/Vite              |
| `jsdom`                     |            30.1.0 | DOM nos testes de componentes     |
| `@testing-library/react`    |            16.3.3 | Testes de componentes             |
| `@testing-library/jest-dom` |             7.0.1 | Matchers de DOM                   |
| `testcontainers`            |            12.1.0 | Integração com PostgreSQL efêmero |
| `eslint`                    |            9.39.5 | Lint                              |
| `eslint-config-next`        |            16.3.5 | Regras do Next.js                 |
| `prettier`                  |             3.9.8 | Formatação                        |

Tipos `@types/node`, `@types/react`, `@types/react-dom` e `@types/pg` devem acompanhar as versões efetivamente instaladas.

TypeScript 7.0.2 e ESLint 10.10.0 foram consultados, mas não adotados na Etapa 0 porque as versões atuais de `typescript-eslint` e `eslint-plugin-react` usadas pelo Next.js ainda não são compatíveis com essas linhas. O projeto fica nas versões estáveis compatíveis acima até que o ecossistema do Next suporte a atualização sem desabilitar regras.

## Inicialização do shadcn/ui

Usar o CLI atual com:

- base: Base UI;
- cor visual da aplicação: Emerald (a base neutra do registry é usada para gerar os componentes Base UI);
- tema: somente claro;
- CSS variables: sim;
- App Router e diretório `src/`.

Base UI é o padrão atual do shadcn/ui. O projeto usa o estilo `base-nova` em `components.json` e mantém os componentes gerados em `src/components/ui`; novos controles devem ser adicionados pelo CLI antes de qualquer implementação local.

## Política de atualização

- Usar versões estáveis, sem `alpha`, `beta` ou `rc`.
- Manter `prisma`, `@prisma/client` e `@prisma/adapter-pg` na mesma versão.
- Atualizar Next.js e `eslint-config-next` em conjunto.
- Antes de aceitar uma major nova, executar build, migrations e testes financeiros.
- O lockfile `pnpm-lock.yaml` é versionado e define as versões reproduzíveis.

## Dependências evitadas inicialmente

- Biblioteca de estado global.
- Camada de API cliente/cache como TanStack Query.
- Biblioteca de tabela avançada.
- Biblioteca de datas pesadas com timezone global.
- Serviço de autenticação.
- Observabilidade externa.
- Gerador de PDF ou biblioteca de upload.
- Test runner E2E.

Elas só devem ser adicionadas quando um requisito concreto justificar o custo.
