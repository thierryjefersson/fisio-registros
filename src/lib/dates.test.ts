import { afterEach, describe, expect, it, vi } from "vitest";

import {
  dateParaHorarioCivil,
  formatarDataCivil,
  horarioCivilParaDate,
  hojeCivil,
} from "./dates";

afterEach(() => vi.useRealTimers());

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

describe("datas e horários clínicos", () => {
  it("calcula o dia atual no fuso America/Fortaleza", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-19T01:30:00.000Z"));
    expect(hojeCivil()).toBe("2026-09-18");
  });

  it("converte horário civil sem deslocamento", () => {
    expect(dateParaHorarioCivil(horarioCivilParaDate("14:35"))).toBe("14:35");
  });
});
