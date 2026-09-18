# Modelo de dados e schema Prisma

## Visão relacional

```text
Paciente 1 ─── N Avaliacao
Paciente 1 ─── 0..1 PlanoTerapeutico
Paciente 1 ─── N Evolucao
Paciente 1 ─── N Cobranca
Cobranca 1 ─── N CobrancaSessao N ─── 1 Evolucao
```

`CobrancaSessao.evolucaoId` é único. Essa restrição no banco impede que a mesma sessão seja incluída em duas cobranças, mesmo se duas requisições tentarem cobrar simultaneamente.

## Decisões de modelagem

- UUIDs internos evitam qualquer dependência do nome do paciente.
- Dinheiro usa `Decimal(12, 2)`, nunca `float`.
- Datas clínicas usam `date`; o horário da evolução usa `time` separado.
- A frequência semanal é calculada por `diasAtendimento.length`.
- `Cobranca` guarda os snapshots de valor unitário e total.
- `CobrancaSessao` mantém o vínculo auditável entre cobrança e sessão.
- Excluir uma cobrança apaga seus vínculos por cascade e libera as evoluções automaticamente.
- Excluir paciente apaga todo o agregado do tratamento. Como a FK que protege evoluções cobradas usa `Restrict`, o serviço remove primeiro as cobranças e seus vínculos e só então o paciente, tudo na mesma transação; as demais relações usam cascade.
- Excluir uma evolução cobrada é bloqueado pela FK (`Restrict`).

## Schema proposto

Compatível com a linha estável do Prisma 7, com URL do banco configurada em `prisma.config.ts`.

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

enum Sexo {
  FEMININO
  MASCULINO
  OUTRO
  NAO_INFORMADO
}

enum DiaSemana {
  DOMINGO
  SEGUNDA
  TERCA
  QUARTA
  QUINTA
  SEXTA
  SABADO
}

enum StatusPaciente {
  EM_TRATAMENTO
  ALTA
}

enum TipoAvaliacao {
  INICIAL
  REAVALIACAO
}

enum StatusCobranca {
  PENDENTE
  PAGA
}

model Paciente {
  id                String          @id @default(uuid()) @db.Uuid
  nome              String
  dataNascimento    DateTime        @db.Date
  sexo              Sexo
  telefone          String
  endereco          String          @db.Text
  nomeResponsavel   String?
  patologia         String          @db.Text
  queixaPrincipal   String          @db.Text
  valorSessao       Decimal         @db.Decimal(12, 2)
  dataInicio        DateTime        @db.Date
  previsaoSessoes   Int
  diasAtendimento   DiaSemana[]
  status            StatusPaciente  @default(EM_TRATAMENTO)
  dataAlta          DateTime?       @db.Date
  createdAt         DateTime        @default(now()) @db.Timestamptz(3)
  updatedAt         DateTime        @updatedAt @db.Timestamptz(3)

  avaliacoes        Avaliacao[]
  planoTerapeutico  PlanoTerapeutico?
  evolucoes         Evolucao[]
  cobrancas         Cobranca[]

  @@index([status])
  @@index([nome])
}

model Avaliacao {
  id                String          @id @default(uuid()) @db.Uuid
  pacienteId        String          @db.Uuid
  tipo              TipoAvaliacao   @default(INICIAL)
  data              DateTime        @default(now()) @db.Date
  conteudoMarkdown  String          @default("") @db.Text
  createdAt         DateTime        @default(now()) @db.Timestamptz(3)
  updatedAt         DateTime        @updatedAt @db.Timestamptz(3)

  paciente          Paciente        @relation(fields: [pacienteId], references: [id], onDelete: Cascade)

  @@index([pacienteId, tipo, data])
}

model PlanoTerapeutico {
  id                 String    @id @default(uuid()) @db.Uuid
  pacienteId         String    @unique @db.Uuid
  objetivosMarkdown  String    @default("") @db.Text
  condutasMarkdown   String    @default("") @db.Text
  createdAt          DateTime  @default(now()) @db.Timestamptz(3)
  updatedAt          DateTime  @updatedAt @db.Timestamptz(3)

  paciente           Paciente  @relation(fields: [pacienteId], references: [id], onDelete: Cascade)
}

model Evolucao {
  id                 String             @id @default(uuid()) @db.Uuid
  pacienteId         String             @db.Uuid
  data               DateTime           @db.Date
  horario            DateTime           @db.Time(0)
  conteudoMarkdown   String             @db.Text
  createdAt          DateTime           @default(now()) @db.Timestamptz(3)
  updatedAt          DateTime           @updatedAt @db.Timestamptz(3)

  paciente           Paciente           @relation(fields: [pacienteId], references: [id], onDelete: Cascade)
  itemCobranca       CobrancaSessao?

  @@index([pacienteId, data, horario])
}

model Cobranca {
  id                    String             @id @default(uuid()) @db.Uuid
  pacienteId            String             @db.Uuid
  status                StatusCobranca     @default(PENDENTE)
  valorUnitarioSnapshot Decimal            @db.Decimal(12, 2)
  valorTotalSnapshot    Decimal            @db.Decimal(12, 2)
  dataPagamento         DateTime?          @db.Date
  createdAt             DateTime           @default(now()) @db.Timestamptz(3)
  updatedAt             DateTime           @updatedAt @db.Timestamptz(3)

  paciente              Paciente           @relation(fields: [pacienteId], references: [id], onDelete: Cascade)
  sessoes               CobrancaSessao[]

  @@index([pacienteId, status])
  @@index([status, dataPagamento])
}

model CobrancaSessao {
  id          String    @id @default(uuid()) @db.Uuid
  cobrancaId  String    @db.Uuid
  evolucaoId  String    @unique @db.Uuid
  createdAt   DateTime  @default(now()) @db.Timestamptz(3)

  cobranca    Cobranca  @relation(fields: [cobrancaId], references: [id], onDelete: Cascade)
  evolucao    Evolucao  @relation(fields: [evolucaoId], references: [id], onDelete: Restrict)

  @@index([cobrancaId])
}
```

## Configuração Prisma

```ts
// prisma.config.ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: env("DATABASE_URL") },
});
```

## Invariantes que ficam na aplicação

Algumas regras não são expressas diretamente pelo schema:

- somente uma avaliação inicial por paciente no MVP;
- `dataAlta` obrigatória apenas quando o status é Alta;
- cobrança deve conter ao menos uma sessão;
- todas as sessões de uma cobrança pertencem ao mesmo paciente da cobrança;
- total deve ser `quantidade × valorUnitarioSnapshot`;
- cobrança Paga exige `dataPagamento`; cobrança Pendente exige `dataPagamento = null`;
- dias habituais não podem ser vazios;
- valores e contagens devem ser positivos.

Essas invariantes devem ser validadas por Zod e pelas funções de domínio, dentro de transações quando houver mais de uma gravação.

## Formato de exportação

O JSON tem envelope versionado para permitir uma futura importação sem prometer compatibilidade implícita:

```json
{
  "schemaVersion": 1,
  "exportedAt": "2026-09-18T17:35:22.000Z",
  "data": {
    "pacientes": []
  }
}
```

Cada paciente é exportado com avaliação, plano, evoluções e cobranças aninhados. Decimais são strings (`"100.00"`), datas civis usam `YYYY-MM-DD`, horários usam `HH:mm:ss` e timestamps técnicos usam ISO 8601.
