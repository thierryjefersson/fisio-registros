-- CreateTable
CREATE TABLE "Evolucao" (
    "id" UUID NOT NULL,
    "pacienteId" UUID NOT NULL,
    "data" DATE NOT NULL,
    "horario" TIME(0) NOT NULL,
    "conteudoMarkdown" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Evolucao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Evolucao_pacienteId_data_horario_idx" ON "Evolucao"("pacienteId", "data", "horario");

-- AddForeignKey
ALTER TABLE "Evolucao" ADD CONSTRAINT "Evolucao_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Paciente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
