import { describe, expect, it } from "vitest";

import { toPatientListItem } from "./list-view-model";

describe("toPatientListItem", () => {
  it("formata frequência, valor e status", () => {
    expect(
      toPatientListItem({
        id: "id",
        nome: "Maria",
        patologia: "Tendinite",
        diasAtendimento: ["SEGUNDA", "QUARTA"],
        valorSessao: "150.50",
        status: "EM_TRATAMENTO",
      }),
    ).toMatchObject({
      frequencia: "2x por semana",
      valor: "R$ 150,50",
      statusLabel: "Em tratamento",
    });
  });

  it("não conta dias repetidos e traduz Alta", () => {
    expect(
      toPatientListItem({
        id: "id",
        nome: "João",
        patologia: "Fratura",
        diasAtendimento: ["SEXTA", "SEXTA"],
        valorSessao: { toString: () => "100.00" },
        status: "ALTA",
      }),
    ).toMatchObject({ frequencia: "1x por semana", statusLabel: "Alta" });
  });
});
