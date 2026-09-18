import { prisma } from "@/lib/prisma";

export function obterPaciente(id: string) {
  return prisma.paciente.findUnique({ where: { id } });
}
