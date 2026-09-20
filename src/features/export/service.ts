import type { PrismaClient } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import { buscarDadosParaExportacao } from "./data";
import { serializarExportacao } from "./serialize";

type ExportDatabase = Pick<PrismaClient, "paciente">;

export async function criarExportacao(
  exportedAt: Date,
  db: ExportDatabase = prisma,
) {
  const pacientes = await buscarDadosParaExportacao(db);
  return serializarExportacao(pacientes, exportedAt);
}
