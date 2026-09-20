-- CreateEnum
CREATE TYPE "StatusCobranca" AS ENUM ('PENDENTE', 'PAGA');

-- CreateTable
CREATE TABLE "Cobranca" (
    "id" UUID NOT NULL,
    "pacienteId" UUID NOT NULL,
    "status" "StatusCobranca" NOT NULL DEFAULT 'PENDENTE',
    "valorUnitarioSnapshot" DECIMAL(12,2) NOT NULL,
    "valorTotalSnapshot" DECIMAL(12,2) NOT NULL,
    "dataPagamento" DATE,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Cobranca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CobrancaSessao" (
    "id" UUID NOT NULL,
    "cobrancaId" UUID NOT NULL,
    "evolucaoId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CobrancaSessao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Cobranca_pacienteId_status_idx" ON "Cobranca"("pacienteId", "status");

-- CreateIndex
CREATE INDEX "Cobranca_status_dataPagamento_idx" ON "Cobranca"("status", "dataPagamento");

-- CreateIndex
CREATE UNIQUE INDEX "CobrancaSessao_evolucaoId_key" ON "CobrancaSessao"("evolucaoId");

-- CreateIndex
CREATE INDEX "CobrancaSessao_cobrancaId_idx" ON "CobrancaSessao"("cobrancaId");

-- AddForeignKey
ALTER TABLE "Cobranca" ADD CONSTRAINT "Cobranca_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CobrancaSessao" ADD CONSTRAINT "CobrancaSessao_cobrancaId_fkey" FOREIGN KEY ("cobrancaId") REFERENCES "Cobranca"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CobrancaSessao" ADD CONSTRAINT "CobrancaSessao_evolucaoId_fkey" FOREIGN KEY ("evolucaoId") REFERENCES "Evolucao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
