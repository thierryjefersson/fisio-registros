import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import { idPacienteValido } from "@/features/patients/queries";
import { prisma } from "@/lib/prisma";

type EvolutionDatabase = Pick<
  PrismaClient,
  "cobrancaSessao" | "evolucao" | "paciente"
>;

export const ordemEvolucoes = [
  { data: "desc" as const },
  { horario: "desc" as const },
  { createdAt: "desc" as const },
];

export function listarEvolucoes(
  pacienteId: string,
  db: EvolutionDatabase = prisma,
) {
  if (!idPacienteValido(pacienteId)) return Promise.resolve([]);
  return db.evolucao.findMany({
    where: { pacienteId },
    orderBy: ordemEvolucoes,
  });
}

export function obterEvolucao(
  pacienteId: string,
  evolucaoId: string,
  db: EvolutionDatabase = prisma,
) {
  if (!idPacienteValido(pacienteId) || !idPacienteValido(evolucaoId)) {
    return null;
  }
  return db.evolucao.findFirst({ where: { id: evolucaoId, pacienteId } });
}

export function obterPacienteComContexto(
  pacienteId: string,
  db: EvolutionDatabase = prisma,
) {
  if (!idPacienteValido(pacienteId)) return null;
  return db.paciente.findUnique({
    where: { id: pacienteId },
    include: {
      avaliacoes: {
        where: { tipo: "INICIAL" },
        orderBy: { createdAt: "asc" },
        take: 1,
      },
      planoTerapeutico: true,
      evolucoes: { orderBy: ordemEvolucoes },
    },
  });
}

export async function excluirEvolucao(
  pacienteId: string,
  evolucaoId: string,
  db: EvolutionDatabase = prisma,
): Promise<"billed" | "deleted" | "not_found"> {
  if (!idPacienteValido(pacienteId) || !idPacienteValido(evolucaoId)) {
    return "not_found";
  }
  const vinculada = await db.cobrancaSessao.findUnique({
    where: { evolucaoId },
    select: { id: true },
  });
  if (vinculada) return "billed";

  try {
    const result = await db.evolucao.deleteMany({
      where: { id: evolucaoId, pacienteId },
    });
    return result.count === 1 ? "deleted" : "not_found";
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return "billed";
    }
    throw error;
  }
}
