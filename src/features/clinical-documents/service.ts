import { prisma } from "@/lib/prisma";

import type { PrismaClient } from "@/generated/prisma/client";

export async function salvarAvaliacaoInicial(
  pacienteId: string,
  conteudoMarkdown: string,
  db: PrismaClient = prisma,
) {
  return db.$transaction(async (tx) => {
    // O lock por paciente mantém a invariante mesmo com dois salvamentos simultâneos.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${pacienteId}))`;

    const existente = await tx.avaliacao.findFirst({
      where: { pacienteId, tipo: "INICIAL" },
      orderBy: { createdAt: "asc" },
    });

    if (existente) {
      return tx.avaliacao.update({
        where: { id: existente.id },
        data: { conteudoMarkdown },
      });
    }

    return tx.avaliacao.create({
      data: { pacienteId, tipo: "INICIAL", conteudoMarkdown },
    });
  });
}

export function salvarPlanoTerapeutico(
  pacienteId: string,
  objetivosMarkdown: string,
  condutasMarkdown: string,
  db: PrismaClient = prisma,
) {
  return db.planoTerapeutico.upsert({
    where: { pacienteId },
    create: { pacienteId, objetivosMarkdown, condutasMarkdown },
    update: { objetivosMarkdown, condutasMarkdown },
  });
}
