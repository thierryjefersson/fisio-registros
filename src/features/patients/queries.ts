import { prisma } from "@/lib/prisma";

import type { PrismaClient } from "@/generated/prisma/client";
import type { PatientListParams } from "./list-params";

type PatientDatabase = Pick<PrismaClient, "paciente">;
type PatientDeleteDatabase = Pick<PrismaClient, "$transaction">;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function idPacienteValido(id: string) {
  return UUID_PATTERN.test(id);
}

export function obterPaciente(id: string, db: PatientDatabase = prisma) {
  if (!idPacienteValido(id)) return null;
  return db.paciente.findUnique({ where: { id } });
}

export function listarPacientes(
  { busca, filtro }: PatientListParams,
  db: PatientDatabase = prisma,
) {
  return db.paciente.findMany({
    where: {
      ...(busca
        ? { nome: { contains: busca, mode: "insensitive" as const } }
        : {}),
      ...(filtro === "todos"
        ? {}
        : { status: filtro === "alta" ? "ALTA" : "EM_TRATAMENTO" }),
    },
    orderBy: [{ nome: "asc" }, { createdAt: "desc" }],
  });
}

export async function excluirPacientePorId(
  id: string,
  db: PatientDeleteDatabase = prisma,
): Promise<"deleted" | "not_found"> {
  if (!idPacienteValido(id)) return "not_found";
  return db.$transaction(async (tx) => {
    await tx.cobranca.deleteMany({ where: { pacienteId: id } });
    const resultado = await tx.paciente.deleteMany({ where: { id } });
    return resultado.count === 1 ? "deleted" : "not_found";
  });
}
