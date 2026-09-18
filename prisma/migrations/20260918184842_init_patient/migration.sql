-- CreateEnum
CREATE TYPE "Sexo" AS ENUM ('FEMININO', 'MASCULINO', 'OUTRO', 'NAO_INFORMADO');

-- CreateEnum
CREATE TYPE "DiaSemana" AS ENUM ('DOMINGO', 'SEGUNDA', 'TERCA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO');

-- CreateEnum
CREATE TYPE "StatusPaciente" AS ENUM ('EM_TRATAMENTO', 'ALTA');

-- CreateTable
CREATE TABLE "Paciente" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "dataNascimento" DATE NOT NULL,
    "sexo" "Sexo" NOT NULL,
    "telefone" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "nomeResponsavel" TEXT,
    "patologia" TEXT NOT NULL,
    "queixaPrincipal" TEXT NOT NULL,
    "valorSessao" DECIMAL(12,2) NOT NULL,
    "dataInicio" DATE NOT NULL,
    "previsaoSessoes" INTEGER NOT NULL,
    "diasAtendimento" "DiaSemana"[],
    "status" "StatusPaciente" NOT NULL DEFAULT 'EM_TRATAMENTO',
    "dataAlta" DATE,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Paciente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Paciente_status_idx" ON "Paciente"("status");

-- CreateIndex
CREATE INDEX "Paciente_nome_idx" ON "Paciente"("nome");
