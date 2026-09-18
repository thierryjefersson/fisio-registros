-- CreateEnum
CREATE TYPE "TipoAvaliacao" AS ENUM ('INICIAL', 'REAVALIACAO');

-- CreateTable
CREATE TABLE "Avaliacao" (
    "id" UUID NOT NULL,
    "pacienteId" UUID NOT NULL,
    "tipo" "TipoAvaliacao" NOT NULL DEFAULT 'INICIAL',
    "data" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "conteudoMarkdown" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Avaliacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanoTerapeutico" (
    "id" UUID NOT NULL,
    "pacienteId" UUID NOT NULL,
    "objetivosMarkdown" TEXT NOT NULL DEFAULT '',
    "condutasMarkdown" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "PlanoTerapeutico_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Avaliacao_pacienteId_tipo_data_idx" ON "Avaliacao"("pacienteId", "tipo", "data");

-- CreateIndex
CREATE UNIQUE INDEX "PlanoTerapeutico_pacienteId_key" ON "PlanoTerapeutico"("pacienteId");

-- AddForeignKey
ALTER TABLE "Avaliacao" ADD CONSTRAINT "Avaliacao_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanoTerapeutico" ADD CONSTRAINT "PlanoTerapeutico_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
