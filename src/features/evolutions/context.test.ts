import { describe, expect, it } from "vitest";

import { gerarContextoClinico, ordenarEvolucoes } from "./context";

function evolution(
  data: string,
  horario: string,
  createdAt: string,
  conteudoMarkdown = `${data} ${horario}`,
) {
  return { data, horario, createdAt, conteudoMarkdown };
}

describe("contexto clínico", () => {
  it("ordena por data, horário e criação, todos decrescentes", () => {
    const items = [
      evolution("2026-09-17", "18:00", "2026-09-17T20:00:00.000Z"),
      evolution("2026-09-18", "09:00", "2026-09-18T10:00:00.000Z", "A"),
      evolution("2026-09-18", "09:00", "2026-09-18T11:00:00.000Z", "B"),
      evolution("2026-09-18", "08:00", "2026-09-18T12:00:00.000Z"),
    ];
    expect(
      ordenarEvolucoes(items).map((item) => item.conteudoMarkdown),
    ).toEqual(["B", "A", "2026-09-18 08:00", "2026-09-17 18:00"]);
  });

  it("mantém a ordem documentada das seções e explicita vazios", () => {
    const context = gerarContextoClinico({ evolucoes: [] });
    const headings = [
      "## Patologia",
      "## Queixa principal",
      "## Avaliação inicial",
      "## Objetivos",
      "## Condutas",
      "## Evoluções",
    ];
    expect(headings.map((heading) => context.indexOf(heading))).toEqual(
      [...headings.map((heading) => context.indexOf(heading))].sort(
        (a, b) => a - b,
      ),
    );
    expect(context.match(/Não informado\./g)).toHaveLength(6);
  });

  it("limita o contexto recente a cinco evoluções e preserva todas no completo", () => {
    const evolucoes = Array.from({ length: 7 }, (_, index) =>
      evolution(
        `2026-09-${String(index + 1).padStart(2, "0")}`,
        "10:00",
        `2026-09-${String(index + 1).padStart(2, "0")}T12:00:00.000Z`,
        `Evolução ${index + 1}`,
      ),
    );
    const recent = gerarContextoClinico({ evolucoes });
    const complete = gerarContextoClinico({ evolucoes }, true);

    expect(recent).toContain("Evolução 7");
    expect(recent).not.toContain("Evolução 2");
    expect(complete).toContain("Evolução 1");
    expect(complete.match(/### /g)).toHaveLength(7);
  });
});
