import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const pacienteExportInclude = {
  avaliacoes: { orderBy: [{ tipo: "asc" }, { data: "asc" }, { id: "asc" }] },
  planoTerapeutico: true,
  evolucoes: {
    orderBy: [
      { data: "asc" },
      { horario: "asc" },
      { createdAt: "asc" },
      { id: "asc" },
    ],
  },
  cobrancas: {
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    include: {
      sessoes: { orderBy: [{ createdAt: "asc" }, { id: "asc" }] },
    },
  },
} satisfies Prisma.PacienteInclude;

export type PacienteParaExportacao = Prisma.PacienteGetPayload<{
  include: typeof pacienteExportInclude;
}>;

type ExportDatabase = Pick<PrismaClient, "paciente">;

export function buscarDadosParaExportacao(db: ExportDatabase = prisma) {
  return db.paciente.findMany({
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    include: pacienteExportInclude,
  });
}
