import { describe, expect, it } from "vitest";

import { formatarDataCivil } from "./dates";

describe("formatarDataCivil", () => {
  it("formata uma data civil sem deslocá-la por fuso", () => {
    expect(formatarDataCivil("2026-09-18")).toBe("18/09/2026");
  });

  it("preserva a data mesmo no limite em que UTC difere de Fortaleza", () => {
    expect(formatarDataCivil("2026-01-01")).toBe("01/01/2026");
  });

  it("rejeita datas civis inválidas", () => {
    expect(() => formatarDataCivil("2026-02-30")).toThrow("inválida");
  });
});
