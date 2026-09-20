import { Prisma } from "@/generated/prisma/client";
import { formatarDataCivil } from "@/lib/dates";
import { formatarBRL } from "@/lib/formatters";

import { calcularTotalCobranca, gerarMensagemCobranca } from "./domain";

type SessaoFinanceira = { data: Date | string };

export function criarPreviaFinanceira({
  evolucoes,
  valorSessao,
}: {
  evolucoes: readonly SessaoFinanceira[];
  valorSessao: Prisma.Decimal | string;
}) {
  const quantidade = evolucoes.length;
  const valorUnitario = new Prisma.Decimal(valorSessao);
  const valorTotal =
    quantidade > 0
      ? calcularTotalCobranca(quantidade, valorUnitario)
      : new Prisma.Decimal(0);

  return {
    datas: evolucoes.map(({ data }) => formatarDataCompleta(data)),
    quantidade,
    valorTotal: formatarBRL(valorTotal.toFixed(2)),
    valorUnitario: formatarBRL(valorUnitario.toFixed(2)),
  };
}

export function criarCobrancaViewModel(cobranca: {
  createdAt: Date;
  dataPagamento: Date | null;
  id: string;
  pacienteId: string;
  sessoes: readonly { evolucao: SessaoFinanceira }[];
  status: "PAGA" | "PENDENTE";
  valorTotalSnapshot: Prisma.Decimal | string;
  valorUnitarioSnapshot: Prisma.Decimal | string;
}) {
  const datasCivis = cobranca.sessoes.map(({ evolucao }) =>
    normalizarData(evolucao.data),
  );
  const valorUnitario = new Prisma.Decimal(cobranca.valorUnitarioSnapshot);
  const valorTotal = new Prisma.Decimal(cobranca.valorTotalSnapshot);

  return {
    createdAt: cobranca.createdAt.toISOString(),
    dataPagamento: cobranca.dataPagamento
      ? formatarDataCompleta(cobranca.dataPagamento)
      : null,
    datas: datasCivis.map(formatarDataCivil),
    id: cobranca.id,
    mensagem: gerarMensagemCobranca({
      datas: datasCivis,
      valorTotal,
      valorUnitario,
    }),
    pacienteId: cobranca.pacienteId,
    quantidade: cobranca.sessoes.length,
    status: cobranca.status,
    valorTotal: formatarBRL(valorTotal.toFixed(2)),
    valorUnitario: formatarBRL(valorUnitario.toFixed(2)),
  };
}

function formatarDataCompleta(data: Date | string) {
  return formatarDataCivil(normalizarData(data));
}

function normalizarData(data: Date | string) {
  return data instanceof Date ? data.toISOString().slice(0, 10) : data;
}
