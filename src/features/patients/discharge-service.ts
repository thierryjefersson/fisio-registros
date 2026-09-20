import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import { dataCivilParaDate } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

import { decidirFluxoAlta, normalizarEstadoPaciente } from "./discharge";
import { idPacienteValido } from "./queries";

export type DischargeResult =
  | { status: "completed" }
  | { status: "not_found" }
  | { status: "unbilled_sessions"; count: number };

export async function concluirAlta(
  {
    confirmarSessoesNaoCobradas,
    dataAlta,
    pacienteId,
  }: {
    confirmarSessoesNaoCobradas: boolean;
    dataAlta: string;
    pacienteId: string;
  },
  db: PrismaClient = prisma,
): Promise<DischargeResult> {
  if (!idPacienteValido(pacienteId)) return { status: "not_found" };
  const estado = normalizarEstadoPaciente({ status: "ALTA", dataAlta });

  return db.$transaction(
    async (tx) => {
      const paciente = await tx.paciente.findUnique({
        where: { id: pacienteId },
        select: { id: true },
      });
      if (!paciente) return { status: "not_found" };

      const sessoesNaoCobradas = await tx.evolucao.count({
        where: { pacienteId, itemCobranca: null },
      });
      if (
        decidirFluxoAlta(sessoesNaoCobradas) === "ALERTAR" &&
        !confirmarSessoesNaoCobradas
      ) {
        return {
          status: "unbilled_sessions",
          count: sessoesNaoCobradas,
        };
      }

      await tx.paciente.update({
        where: { id: pacienteId },
        data: {
          status: estado.status,
          dataAlta: dataCivilParaDate(dataAlta),
        },
      });
      return { status: "completed" };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}
