import {
  Prisma,
  type PrismaClient,
  type StatusCobranca,
} from "@/generated/prisma/client";
import { idPacienteValido } from "@/features/patients/queries";
import { dataCivilParaDate, validarDataCivil } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

import { calcularTotalCobranca } from "./domain";
import { BillingError } from "./errors";

export async function gerarCobranca(
  pacienteId: string,
  db: PrismaClient = prisma,
) {
  if (!idPacienteValido(pacienteId)) {
    throw new BillingError(
      "PACIENTE_NAO_ENCONTRADO",
      "O paciente não foi encontrado.",
    );
  }

  try {
    return await db.$transaction(
      async (tx) => {
        const paciente = await tx.paciente.findUnique({
          where: { id: pacienteId },
          select: { id: true, valorSessao: true },
        });
        if (!paciente) {
          throw new BillingError(
            "PACIENTE_NAO_ENCONTRADO",
            "O paciente não foi encontrado.",
          );
        }

        const sessoes = await tx.evolucao.findMany({
          where: { pacienteId, itemCobranca: null },
          orderBy: [{ data: "asc" }, { horario: "asc" }, { createdAt: "asc" }],
          select: { id: true },
        });
        if (sessoes.length === 0) {
          throw new BillingError(
            "SEM_SESSOES_LIVRES",
            "Não existem sessões livres para gerar uma cobrança.",
          );
        }

        const valorTotal = calcularTotalCobranca(
          sessoes.length,
          paciente.valorSessao,
        );

        return tx.cobranca.create({
          data: {
            pacienteId,
            valorUnitarioSnapshot: paciente.valorSessao,
            valorTotalSnapshot: valorTotal,
            sessoes: {
              create: sessoes.map(({ id }) => ({ evolucaoId: id })),
            },
          },
          include: {
            sessoes: {
              include: { evolucao: true },
              orderBy: { evolucao: { data: "asc" } },
            },
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (error) {
    if (error instanceof BillingError) throw error;
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error.code === "P2002" || error.code === "P2034")
    ) {
      throw new BillingError(
        "CONFLITO_SESSOES",
        "As sessões disponíveis mudaram. Atualize a prévia e tente novamente.",
        { cause: error },
      );
    }
    throw error;
  }
}

export async function atualizarStatusCobranca(
  {
    cobrancaId,
    dataPagamento,
    pacienteId,
    status,
  }: {
    cobrancaId: string;
    dataPagamento?: string;
    pacienteId: string;
    status: StatusCobranca;
  },
  db: PrismaClient = prisma,
) {
  if (
    !idPacienteValido(cobrancaId) ||
    !idPacienteValido(pacienteId) ||
    (status === "PAGA" && (!dataPagamento || !validarDataCivil(dataPagamento)))
  ) {
    throw new TypeError("Os dados da atualização da cobrança são inválidos.");
  }

  const resultado = await db.cobranca.updateMany({
    where: { id: cobrancaId, pacienteId },
    data: {
      status,
      dataPagamento:
        status === "PAGA" ? dataCivilParaDate(dataPagamento!) : null,
    },
  });
  if (resultado.count === 0) {
    throw new BillingError(
      "COBRANCA_NAO_ENCONTRADA",
      "A cobrança não foi encontrada.",
    );
  }
}

export async function excluirCobranca(
  pacienteId: string,
  cobrancaId: string,
  db: PrismaClient = prisma,
) {
  if (!idPacienteValido(pacienteId) || !idPacienteValido(cobrancaId)) {
    return "not_found" as const;
  }
  const resultado = await db.cobranca.deleteMany({
    where: { id: cobrancaId, pacienteId },
  });
  return resultado.count === 1 ? ("deleted" as const) : ("not_found" as const);
}
