import { describe, expect, it } from "vitest";

import { formatarBRL, formatarTelefone } from "./formatters";

describe("formatarBRL", () => {
  it.each([
    [0, "R$ 0,00"],
    ["0.25", "R$ 0,25"],
    [1234.56, "R$ 1.234,56"],
  ])("formata %s em pt-BR", (valor, esperado) => {
    expect(formatarBRL(valor)).toBe(esperado);
  });
});

describe("formatarTelefone", () => {
  it("apresenta celulares e telefones fixos com DDD", () => {
    expect(formatarTelefone("85999990000")).toBe("(85) 99999-0000");
    expect(formatarTelefone("8533334444")).toBe("(85) 3333-4444");
  });
});
