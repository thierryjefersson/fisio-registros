import { describe, expect, it } from "vitest";

import { decidirFluxoAlta, normalizarEstadoPaciente } from "./discharge";

describe("domínio da alta", () => {
  it("exige data para alta e remove a data ao voltar ao tratamento", () => {
    expect(
      normalizarEstadoPaciente({ status: "ALTA", dataAlta: "2026-09-20" }),
    ).toEqual({ status: "ALTA", dataAlta: "2026-09-20" });
    expect(() =>
      normalizarEstadoPaciente({ status: "ALTA", dataAlta: null }),
    ).toThrow("exige uma data");
    expect(
      normalizarEstadoPaciente({
        status: "EM_TRATAMENTO",
        dataAlta: "2026-09-20",
      }),
    ).toEqual({ status: "EM_TRATAMENTO", dataAlta: null });
  });

  it("diferencia alta direta do fluxo com sessões livres", () => {
    expect(decidirFluxoAlta(0)).toBe("CONCLUIR");
    expect(decidirFluxoAlta(1)).toBe("ALERTAR");
    expect(decidirFluxoAlta(5)).toBe("ALERTAR");
  });
});
