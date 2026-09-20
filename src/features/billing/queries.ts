import type { PrismaClient } from "@/generated/prisma/client";
import { idPacienteValido } from "@/features/patients/queries";
import { prisma } from "@/lib/prisma";

type BillingDatabase = Pick<PrismaClient, "cobranca" | "paciente">;

export function obterFinanceiroPaciente(
  pacienteId: string,
  db: BillingDatabase = prisma,
) {
  if (!idPacienteValido(pacienteId)) return null;

  return db.paciente.findUnique({
    where: { id: pacienteId },
    select: {
      id: true,
      nome: true,
      valorSessao: true,
      evolucoes: {
        where: { itemCobranca: null },
        orderBy: [{ data: "asc" }, { horario: "asc" }, { createdAt: "asc" }],
        select: { data: true, horario: true, id: true },
      },
      cobrancas: {
        orderBy: { createdAt: "desc" },
        include: {
          sessoes: {
            include: { evolucao: true },
            orderBy: { evolucao: { data: "asc" } },
          },
        },
      },
    },
  });
}

export function listarCobrancasGerais(db: BillingDatabase = prisma) {
  return db.cobranca.findMany({
    orderBy: [
      { status: "asc" },
      { dataPagamento: "desc" },
      { createdAt: "desc" },
    ],
    include: {
      paciente: { select: { id: true, nome: true } },
      sessoes: {
        include: { evolucao: true },
        orderBy: { evolucao: { data: "asc" } },
      },
    },
  });
}
