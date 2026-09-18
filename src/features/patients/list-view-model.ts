import { formatarBRL } from "@/lib/formatters";

type PatientListSource = {
  id: string;
  nome: string;
  patologia: string;
  diasAtendimento: readonly string[];
  valorSessao: { toString(): string } | string;
  status: "EM_TRATAMENTO" | "ALTA";
};

export type PatientListItem = {
  id: string;
  nome: string;
  patologia: string;
  frequencia: string;
  valor: string;
  status: "EM_TRATAMENTO" | "ALTA";
  statusLabel: string;
};

export function toPatientListItem(
  paciente: PatientListSource,
): PatientListItem {
  const quantidade = new Set(paciente.diasAtendimento).size;

  return {
    id: paciente.id,
    nome: paciente.nome,
    patologia: paciente.patologia,
    frequencia: `${quantidade}x por semana`,
    valor: formatarBRL(paciente.valorSessao.toString()),
    status: paciente.status,
    statusLabel: paciente.status === "ALTA" ? "Alta" : "Em tratamento",
  };
}
