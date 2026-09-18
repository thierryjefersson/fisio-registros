import { prisma } from "@/lib/prisma";
import { idPacienteValido } from "@/features/patients/queries";

export function obterAvaliacaoInicial(pacienteId: string) {
  if (!idPacienteValido(pacienteId)) return null;
  return prisma.avaliacao.findFirst({
    where: { pacienteId, tipo: "INICIAL" },
    orderBy: { createdAt: "asc" },
  });
}

export function obterPlanoTerapeutico(pacienteId: string) {
  if (!idPacienteValido(pacienteId)) return null;
  return prisma.planoTerapeutico.findUnique({ where: { pacienteId } });
}
