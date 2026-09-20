import { describe, expect, it } from "vitest";

import { evolucaoSchema } from "./schemas";

const base = {
  pacienteId: "7be5c810-f35f-4ec3-a0b9-0eeabf7b10cb",
  data: "2026-09-18",
  horario: "14:30",
  conteudoMarkdown: "Sessão realizada.",
};

describe("evolucaoSchema", () => {
  it("exige horário e conteúdo", () => {
    const result = evolucaoSchema.safeParse({
      ...base,
      horario: "",
      conteudoMarkdown: "   ",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.horario).toBeDefined();
      expect(result.error.flatten().fieldErrors.conteudoMarkdown).toBeDefined();
    }
  });

  it("aceita data, horário e Markdown válidos", () => {
    expect(evolucaoSchema.parse(base)).toEqual(base);
  });
});
