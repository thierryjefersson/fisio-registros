import { formatarDataCivil } from "@/lib/dates";

export type ContextEvolution = {
  conteudoMarkdown: string;
  createdAt: Date | string;
  data: Date | string;
  horario: Date | string;
};

export type ClinicalContextInput = {
  avaliacao?: string | null;
  condutas?: string | null;
  evolucoes: ContextEvolution[];
  objetivos?: string | null;
  patologia?: string | null;
  queixaPrincipal?: string | null;
};

export function ordenarEvolucoes<T extends ContextEvolution>(
  evolucoes: T[],
): T[] {
  return [...evolucoes].sort((a, b) =>
    chaveOrdenacao(b).localeCompare(chaveOrdenacao(a)),
  );
}

export function gerarContextoClinico(
  input: ClinicalContextInput,
  completo = false,
): string {
  const evolucoesOrdenadas = ordenarEvolucoes(input.evolucoes);
  const evolucoes = completo
    ? evolucoesOrdenadas
    : evolucoesOrdenadas.slice(0, 5);

  return [
    secao("Patologia", input.patologia),
    secao("Queixa principal", input.queixaPrincipal),
    secao("Avaliação inicial", input.avaliacao),
    secao("Objetivos", input.objetivos),
    secao("Condutas", input.condutas),
    `## Evoluções\n\n${formatarEvolucoes(evolucoes)}`,
  ].join("\n\n");
}

function secao(titulo: string, conteudo?: string | null) {
  return `## ${titulo}\n\n${conteudo?.trim() || "Não informado."}`;
}

function formatarEvolucoes(evolucoes: ContextEvolution[]) {
  if (evolucoes.length === 0) return "Não informado.";
  return evolucoes
    .map((evolucao) => {
      const data = valorDataCivil(evolucao.data);
      const horario = valorHorario(evolucao.horario);
      return `### ${formatarDataCivil(data)} às ${horario}\n\n${evolucao.conteudoMarkdown.trim()}`;
    })
    .join("\n\n");
}

function chaveOrdenacao(evolucao: ContextEvolution) {
  return `${valorDataCivil(evolucao.data)}T${valorHorario(evolucao.horario)}:${valorInstante(evolucao.createdAt)}`;
}

function valorDataCivil(value: Date | string) {
  return value instanceof Date
    ? value.toISOString().slice(0, 10)
    : value.slice(0, 10);
}

function valorHorario(value: Date | string) {
  if (value instanceof Date) return value.toISOString().slice(11, 16);
  return value.includes("T") ? value.slice(11, 16) : value.slice(0, 5);
}

function valorInstante(value: Date | string) {
  return value instanceof Date ? value.toISOString() : value;
}
