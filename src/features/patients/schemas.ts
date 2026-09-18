import { hojeCivil, validarDataCivil } from "@/lib/dates";

import { z } from "zod";

export const SEXOS = [
  "FEMININO",
  "MASCULINO",
  "OUTRO",
  "NAO_INFORMADO",
] as const;

export const DIAS_SEMANA = [
  { value: "DOMINGO", label: "Domingo" },
  { value: "SEGUNDA", label: "Segunda-feira" },
  { value: "TERCA", label: "Terça-feira" },
  { value: "QUARTA", label: "Quarta-feira" },
  { value: "QUINTA", label: "Quinta-feira" },
  { value: "SEXTA", label: "Sexta-feira" },
  { value: "SABADO", label: "Sábado" },
] as const;

export const SEXO_LABELS: Record<(typeof SEXOS)[number], string> = {
  FEMININO: "Feminino",
  MASCULINO: "Masculino",
  OUTRO: "Outro",
  NAO_INFORMADO: "Não informado",
};

const diaValues = DIAS_SEMANA.map(({ value }) => value) as [
  (typeof DIAS_SEMANA)[number]["value"],
  ...(typeof DIAS_SEMANA)[number]["value"][],
];

const textoObrigatorio = (campo: string) =>
  z
    .string({ error: `${campo} é obrigatório.` })
    .trim()
    .min(1, `${campo} é obrigatório.`);

const dataCivilSchema = (campo: string) =>
  z
    .string({ error: `${campo} é obrigatório.` })
    .trim()
    .min(1, `${campo} é obrigatório.`)
    .refine(validarDataCivil, `${campo} inválida.`);

const telefoneSchema = textoObrigatorio("Telefone").refine((telefone) => {
  const digitos = normalizarTelefone(telefone);
  return digitos.length === 10 || digitos.length === 11;
}, "Informe um telefone válido com DDD.");

const moedaSchema = z
  .string({ error: "Valor por sessão é obrigatório." })
  .trim()
  .min(1, "Valor por sessão é obrigatório.")
  .refine((valor) => {
    try {
      normalizarValorMonetario(valor);
      return true;
    } catch {
      return false;
    }
  }, "Informe um valor em BRL com no máximo duas casas decimais.")
  .refine((valor) => {
    try {
      return Number(normalizarValorMonetario(valor)) > 0;
    } catch {
      return false;
    }
  }, "O valor por sessão deve ser maior que zero.");

const previsaoSchema = z
  .string({ error: "Previsão de sessões é obrigatória." })
  .trim()
  .min(1, "Previsão de sessões é obrigatória.")
  .regex(/^\d+$/, "A previsão de sessões deve ser um número inteiro.")
  .refine(
    (valor) => Number(valor) > 0,
    "A previsão de sessões deve ser positiva.",
  );

export const pacienteInputSchema = z.object({
  nome: textoObrigatorio("Nome"),
  dataNascimento: dataCivilSchema("Data de nascimento"),
  sexo: z.enum(SEXOS, { error: "Sexo é obrigatório." }),
  telefone: telefoneSchema,
  endereco: textoObrigatorio("Endereço"),
  nomeResponsavel: z.string().trim(),
  patologia: textoObrigatorio("Patologia"),
  queixaPrincipal: textoObrigatorio("Queixa principal"),
  valorSessao: moedaSchema,
  dataInicio: dataCivilSchema("Data de início"),
  previsaoSessoes: previsaoSchema,
  diasAtendimento: z
    .array(z.enum(diaValues))
    .min(1, "Selecione pelo menos um dia de atendimento.")
    .refine(
      (dias) => new Set(dias).size === dias.length,
      "Os dias não podem se repetir.",
    ),
});

export const pacienteSchema = pacienteInputSchema
  .superRefine((dados, contexto) => {
    const hoje = hojeCivil();
    if (dados.dataNascimento > hoje) {
      contexto.addIssue({
        code: "custom",
        path: ["dataNascimento"],
        message: "A data de nascimento não pode estar no futuro.",
      });
    }
  })
  .transform((dados) => ({
    ...dados,
    nome: dados.nome.trim(),
    telefone: normalizarTelefone(dados.telefone),
    endereco: dados.endereco.trim(),
    nomeResponsavel: dados.nomeResponsavel.trim() || null,
    patologia: dados.patologia.trim(),
    queixaPrincipal: dados.queixaPrincipal.trim(),
    valorSessao: normalizarValorMonetario(dados.valorSessao),
    previsaoSessoes: Number(dados.previsaoSessoes),
  }));

export type PacienteFormValues = z.input<typeof pacienteInputSchema>;
export type PacienteInput = z.output<typeof pacienteSchema>;

export function normalizarValorMonetario(valor: string | number): string {
  const texto = String(valor)
    .trim()
    .replace(/^R\$\s*/i, "")
    .replace(/\s/g, "");
  const normalizado = texto.includes(",")
    ? texto.replace(/\./g, "").replace(",", ".")
    : texto;

  if (!/^\d+(?:\.\d{1,2})?$/.test(normalizado)) {
    throw new TypeError("Valor monetário inválido.");
  }

  const [inteiro, centavos = ""] = normalizado.split(".");
  const inteiroSemZeros = inteiro.replace(/^0+(?=\d)/, "");
  return `${inteiroSemZeros}.${centavos.padEnd(2, "0")}`;
}

export function normalizarTelefone(telefone: string): string {
  return telefone.replace(/\D/g, "");
}

export function calcularFrequenciaSemanal(dias: readonly string[]): number {
  return new Set(dias).size;
}

export function obterErrosDeValidacao(
  error: z.ZodError,
): Record<string, string[]> {
  return error.issues.reduce<Record<string, string[]>>((erros, issue) => {
    const campo = issue.path[0]?.toString() ?? "_form";
    erros[campo] ??= [];
    erros[campo].push(issue.message);
    return erros;
  }, {});
}
