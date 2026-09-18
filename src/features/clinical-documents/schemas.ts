import { z } from "zod";

const documentoBaseSchema = z.object({
  pacienteId: z.uuid("Paciente inválido."),
});

export const avaliacaoSchema = documentoBaseSchema.extend({
  conteudoMarkdown: z.string(),
});

export const planoTerapeuticoSchema = documentoBaseSchema.extend({
  objetivosMarkdown: z.string(),
  condutasMarkdown: z.string(),
});

export type AvaliacaoInput = z.infer<typeof avaliacaoSchema>;
export type PlanoTerapeuticoInput = z.infer<typeof planoTerapeuticoSchema>;
