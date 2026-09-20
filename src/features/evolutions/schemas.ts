import { z } from "zod";

import { validarDataCivil, validarHorarioCivil } from "@/lib/dates";

const uuid = z.uuid("Identificador inválido.");

export const evolucaoSchema = z.object({
  pacienteId: uuid,
  data: z
    .string()
    .min(1, "Data é obrigatória.")
    .refine(validarDataCivil, "Data inválida."),
  horario: z
    .string()
    .min(1, "Horário é obrigatório.")
    .refine(validarHorarioCivil, "Horário inválido."),
  conteudoMarkdown: z
    .string()
    .trim()
    .min(1, "Conteúdo da evolução é obrigatório."),
});

export const edicaoEvolucaoSchema = evolucaoSchema.extend({
  evolucaoId: uuid,
});

export function errosEvolucao(error: z.ZodError) {
  return error.issues.reduce<Record<string, string[]>>((acc, issue) => {
    const field = issue.path[0]?.toString() ?? "_form";
    acc[field] ??= [];
    acc[field].push(issue.message);
    return acc;
  }, {});
}

export type EvolucaoInput = z.infer<typeof evolucaoSchema>;
