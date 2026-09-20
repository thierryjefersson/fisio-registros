import type { StatusPaciente } from "@/generated/prisma/client";
import { validarDataCivil } from "@/lib/dates";

export function decidirFluxoAlta(sessoesNaoCobradas: number) {
  if (!Number.isSafeInteger(sessoesNaoCobradas) || sessoesNaoCobradas < 0) {
    throw new RangeError("A quantidade de sessões não cobradas é inválida.");
  }

  return sessoesNaoCobradas === 0 ? "CONCLUIR" : "ALERTAR";
}

export function normalizarEstadoPaciente({
  dataAlta,
  status,
}: {
  dataAlta?: string | null;
  status: StatusPaciente;
}) {
  if (status === "ALTA") {
    if (!dataAlta || !validarDataCivil(dataAlta)) {
      throw new TypeError("A alta exige uma data válida.");
    }
    return { dataAlta, status } as const;
  }

  return { dataAlta: null, status } as const;
}
