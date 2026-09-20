import { Prisma } from "@/generated/prisma/client";
import { formatarDataCivil, validarDataCivil } from "@/lib/dates";
import { formatarBRL } from "@/lib/formatters";

type ValorDecimal = Prisma.Decimal | string;

export function contarSessoes(sessoes: readonly unknown[]): number {
  return sessoes.length;
}

export function calcularTotalCobranca(
  quantidade: number,
  valorUnitario: ValorDecimal,
): Prisma.Decimal {
  if (!Number.isSafeInteger(quantidade) || quantidade <= 0) {
    throw new RangeError("A cobrança deve conter ao menos uma sessão.");
  }

  const valor = new Prisma.Decimal(valorUnitario);
  if (!valor.isPositive()) {
    throw new RangeError("O valor unitário deve ser positivo.");
  }

  return valor.mul(quantidade);
}

export function formatarListaDeDatas(datas: readonly (Date | string)[]) {
  if (datas.length === 0) {
    throw new RangeError("A lista de datas não pode estar vazia.");
  }

  const formatadas = datas
    .map(normalizarData)
    .sort((a, b) => a.localeCompare(b))
    .map((data) => formatarDataCivil(data).slice(0, 5));

  if (formatadas.length === 1) return formatadas[0];
  if (formatadas.length === 2) return formatadas.join(" e ");

  return `${formatadas.slice(0, -1).join(", ")} e ${formatadas.at(-1)}`;
}

export function gerarMensagemCobranca({
  datas,
  valorTotal,
  valorUnitario,
}: {
  datas: readonly (Date | string)[];
  valorTotal: ValorDecimal;
  valorUnitario: ValorDecimal;
}) {
  const quantidade = contarSessoes(datas);
  if (quantidade === 0) {
    throw new RangeError("A cobrança deve conter ao menos uma sessão.");
  }

  const realizacao =
    quantidade === 1
      ? "foi realizado 1 atendimento"
      : `foram realizados ${quantidade} atendimentos`;

  return `Olá! Referente aos atendimentos fisioterapêuticos realizados nos dias ${formatarListaDeDatas(datas)}, ${realizacao}, no valor de ${formatarBRL(new Prisma.Decimal(valorUnitario).toFixed(2))} por sessão, totalizando ${formatarBRL(new Prisma.Decimal(valorTotal).toFixed(2))}.`;
}

export function marcarCobrancaComoPaga<T extends object>(
  cobranca: T,
  dataPagamento: string,
) {
  if (!validarDataCivil(dataPagamento)) {
    throw new TypeError("A data de pagamento é inválida.");
  }

  return { ...cobranca, status: "PAGA" as const, dataPagamento };
}

export function voltarCobrancaParaPendente<T extends object>(cobranca: T) {
  return { ...cobranca, status: "PENDENTE" as const, dataPagamento: null };
}

function normalizarData(data: Date | string) {
  const valor = data instanceof Date ? data.toISOString().slice(0, 10) : data;
  if (!validarDataCivil(valor)) {
    throw new TypeError("A data de atendimento é inválida.");
  }
  return valor;
}
