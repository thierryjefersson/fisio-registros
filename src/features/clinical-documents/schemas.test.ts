import { describe, expect, it } from "vitest";

import { avaliacaoSchema, planoTerapeuticoSchema } from "./schemas";

const pacienteId = "7be5c810-f35f-4ec3-a0b9-0eeabf7b10cb";

describe("schemas de documentos clínicos", () => {
  it("aceita avaliação ainda sem conteúdo", () => {
    expect(avaliacaoSchema.parse({ pacienteId, conteudoMarkdown: "" })).toEqual(
      { pacienteId, conteudoMarkdown: "" },
    );
  });

  it("aceita objetivos e condutas ainda sem conteúdo", () => {
    expect(
      planoTerapeuticoSchema.parse({
        pacienteId,
        objetivosMarkdown: "",
        condutasMarkdown: "",
      }),
    ).toEqual({ pacienteId, objetivosMarkdown: "", condutasMarkdown: "" });
  });
});
