import type { PrismaClient } from "@/generated/prisma/client";
import {
  calcularResumoFinanceiro,
  limitesMesCivil,
} from "@/features/billing/domain";
import { dataCivilParaDate } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

type DashboardDatabase = Pick<
  PrismaClient,
  "cobranca" | "evolucao" | "paciente"
>;

export async function obterDashboard(
  referenciaCivil: string,
  db: DashboardDatabase = prisma,
) {
  const { inicio, proximoMes } = limitesMesCivil(referenciaCivil);
  const [pacientesEmTratamento, atendimentosNoMes, cobrancas, recentes] =
    await Promise.all([
      db.paciente.count({ where: { status: "EM_TRATAMENTO" } }),
      db.evolucao.count({
        where: {
          data: {
            gte: dataCivilParaDate(inicio),
            lt: dataCivilParaDate(proximoMes),
          },
        },
      }),
      db.cobranca.findMany({
        select: {
          dataPagamento: true,
          status: true,
          valorTotalSnapshot: true,
        },
      }),
      db.evolucao.findMany({
        take: 5,
        orderBy: [{ data: "desc" }, { horario: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          data: true,
          horario: true,
          paciente: { select: { id: true, nome: true } },
        },
      }),
    ]);
  const financeiro = calcularResumoFinanceiro(cobrancas, referenciaCivil);

  return {
    pacientesEmTratamento,
    atendimentosNoMes,
    aReceber: financeiro.aReceber,
    recebidoNoMes: financeiro.recebidoNoMes,
    recentes,
  };
}
