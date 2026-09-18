import { describe, expect, it } from "vitest";

import { parsePatientListParams, patientListUrl } from "./list-params";

describe("parsePatientListParams", () => {
  it("aplica Em tratamento por padrão", () => {
    expect(parsePatientListParams({})).toEqual({
      busca: "",
      filtro: "em-tratamento",
    });
  });

  it.each(["em-tratamento", "alta", "todos"] as const)(
    "aceita o filtro conhecido %s",
    (filtro) => {
      expect(parsePatientListParams({ filtro }).filtro).toBe(filtro);
    },
  );

  it("ignora filtros desconhecidos, arrays extras e espaços na busca", () => {
    expect(
      parsePatientListParams({
        busca: ["  Maria  ", "ignorada"],
        filtro: "arquivados",
      }),
    ).toEqual({ busca: "Maria", filtro: "em-tratamento" });
  });
});

describe("patientListUrl", () => {
  it("mantém busca e filtro na URL e omite o filtro padrão", () => {
    expect(patientListUrl({ busca: "Ana Maria", filtro: "alta" })).toBe(
      "/pacientes?busca=Ana+Maria&filtro=alta",
    );
    expect(patientListUrl({ busca: "Ana", filtro: "em-tratamento" })).toBe(
      "/pacientes?busca=Ana",
    );
  });
});
