# Estrutura inicial e arquitetura

## Abordagem

Aplicação full-stack única em Next.js App Router. Server Components fazem leituras; Server Actions validam e executam mutações. Route Handler é usado apenas quando uma resposta HTTP específica é necessária, como o download do backup.

Não haverá monorepo, API separada, fila, cache distribuído, eventos de domínio, repository pattern genérico ou camada GraphQL/REST interna.

## Estrutura sugerida

```text
fisio-registros/
├── docs/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── (app)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── financeiro/page.tsx
│   │   │   ├── configuracoes/page.tsx
│   │   │   └── pacientes/
│   │   │       ├── page.tsx
│   │   │       ├── novo/page.tsx
│   │   │       └── [id]/
│   │   │           ├── layout.tsx
│   │   │           ├── page.tsx
│   │   │           ├── avaliacao/page.tsx
│   │   │           ├── plano/page.tsx
│   │   │           ├── evolucoes/
│   │   │           └── financeiro/page.tsx
│   │   ├── api/exportar/route.ts
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── patients/
│   │   ├── clinical/
│   │   └── billing/
│   ├── features/
│   │   ├── patients/
│   │   │   ├── actions.ts
│   │   │   ├── queries.ts
│   │   │   └── schemas.ts
│   │   ├── clinical/
│   │   │   ├── actions.ts
│   │   │   ├── context.ts
│   │   │   ├── queries.ts
│   │   │   └── schemas.ts
│   │   ├── billing/
│   │   │   ├── actions.ts
│   │   │   ├── domain.ts
│   │   │   ├── queries.ts
│   │   │   ├── schemas.ts
│   │   │   └── service.ts
│   │   └── export/
│   │       └── service.ts
│   ├── lib/
│   │   ├── clipboard.ts
│   │   ├── dates.ts
│   │   ├── formatters.ts
│   │   ├── prisma.ts
│   │   └── utils.ts
│   └── generated/prisma/
├── tests/
│   ├── integration/
│   └── setup.ts
├── .env.example
├── components.json
├── compose.yaml
├── next.config.ts
├── package.json
├── prisma.config.ts
├── tsconfig.json
└── vitest.config.ts
```

Subpastas devem ser criadas conforme os arquivos aparecerem, não antecipadamente.

## Limites das camadas

- `app/`: composição de rotas e carregamento de dados.
- `components/`: interface reutilizável; não acessa Prisma.
- `features/*/schemas.ts`: schemas Zod compartilhados entre formulário e servidor.
- `features/*/queries.ts`: consultas Prisma específicas da tela.
- `features/*/actions.ts`: fronteira de mutação, autorização futura, validação e revalidação.
- `features/billing/domain.ts`: cálculos, estados e mensagem em funções puras.
- `features/billing/service.ts`: transações financeiras.
- `lib/prisma.ts`: singleton do Prisma Client com adapter PostgreSQL.

Evitar uma classe `Repository<T>` ou DTOs duplicados. Usar os tipos gerados pelo Prisma e criar tipos de view somente quando uma tela realmente precisar.

## Banco local

`compose.yaml` contém apenas PostgreSQL 16:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: fisio_registros
      POSTGRES_USER: fisio
      POSTGRES_PASSWORD: fisio_local
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U fisio -d fisio_registros"]
      interval: 5s
      timeout: 5s
      retries: 10

volumes:
  postgres_data:
```

A senha é apenas para desenvolvimento local e fica documentada no `.env.example`. O volume nomeado preserva os dados entre reinícios do container.

## Mutações e transações

- Toda Server Action revalida input com Zod; validação no cliente não é uma barreira de confiança.
- Criação/exclusão de cobrança, mudança de status/data e exclusão completa do paciente são operações atômicas.
- Erros esperados retornam estados tipados para o formulário; erros inesperados são registrados no servidor.
- Após mutação, usar `revalidatePath` apenas nas rotas afetadas.
- Não adicionar gerenciador global de estado; estado de servidor vem da rota e estado de formulário fica no React Hook Form.

## Markdown

- `@mdxeditor/editor` é carregado dinamicamente com SSR desabilitado dentro de um componente `"use client"`.
- Plugins habilitados: headings, listas, negrito/itálico e toolbar mínima.
- MDX, JSX embutido, imagens, tabelas e HTML bruto não são necessários.
- `react-markdown` renderiza leitura de forma segura, sem `rehype-raw`.
- Para cópia rica, um nó renderizado pelo React fornece HTML e texto ao `ClipboardItem`.

## Convenções

- Código e nomes internos em português ou inglês de forma consistente; o schema proposto usa português para refletir o domínio.
- Interface sempre em pt-BR.
- Datas de formulário trafegam como `YYYY-MM-DD` e horário como `HH:mm`.
- Valores monetários trafegam pelo formulário como string decimal normalizada, não `number`.
- IDs nunca são derivados de nome, data ou telefone.

## Migrações

- Usar `prisma migrate dev` durante o desenvolvimento.
- Versionar toda pasta de migration.
- Não usar `db push` como fluxo normal.
- Nomear migrations pelo efeito, por exemplo `init`, `add_billing`.
- Gerar e revisar o SQL antes de considerar a migration concluída.

## Execução local esperada

```bash
docker compose up -d
pnpm install
pnpm prisma migrate dev
pnpm dev
```

O PostgreSQL roda no Docker; o Next.js e os testes rodam diretamente na máquina.
