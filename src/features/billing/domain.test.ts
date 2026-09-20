import { describe, expect, it } from "vitest";

import {
  calcularTotalCobranca,
  contarSessoes,
  formatarListaDeDatas,
  gerarMensagemCobranca,
  marcarCobrancaComoPaga,
  voltarCobrancaParaPendente,
} from "./domain";

describe("domínio financeiro", () => {
  it("calcula quantidade e total para uma ou várias sessões", () => {
    expect(contarSessoes([{}])).toBe(1);
    expect(contarSessoes([{}, {}, {}])).toBe(3);
    expect(calcularTotalCobranca(1, "100.00").toFixed(2)).toBe("100.00");
    expect(calcularTotalCobranca(3, "100.00").toFixed(2)).toBe("300.00");
  });

  it("mantém precisão decimal com centavos e rejeita zero sessões", () => {
    expect(calcularTotalCobranca(3, "0.10").toFixed(2)).toBe("0.30");
    expect(calcularTotalCobranca(7, "123.45").toFixed(2)).toBe("864.15");
    expect(() => calcularTotalCobranca(0, "100.00")).toThrow(
      "ao menos uma sessão",
    );
  });

  it("ordena datas, preserva repetições e usa conjunção em pt-BR", () => {
    expect(formatarListaDeDatas(["2026-09-24"])).toBe("24/09");
    expect(formatarListaDeDatas(["2026-09-24", "2026-09-18"])).toBe(
      "18/09 e 24/09",
    );
    expect(
      formatarListaDeDatas(["2026-09-25", "2026-09-18", "2026-09-18"]),
    ).toBe("18/09, 18/09 e 25/09");
  });

  it("gera mensagem no singular sem incluir o nome do paciente", () => {
    const mensagem = gerarMensagemCobranca({
      datas: ["2026-09-18"],
      valorUnitario: "100.00",
      valorTotal: "100.00",
    });

    expect(mensagem).toContain("foi realizado 1 atendimento");
    expect(mensagem).toContain("R$\u00a0100,00 por sessão");
    expect(mensagem).not.toContain("Maria");
  });

  it("gera mensagem no plural para duas e três datas", () => {
    const duas = gerarMensagemCobranca({
      datas: ["2026-09-24", "2026-09-18"],
      valorUnitario: "80.50",
      valorTotal: "161.00",
    });
    const tres = gerarMensagemCobranca({
      datas: ["2026-09-25", "2026-09-18", "2026-09-24"],
      valorUnitario: "100.00",
      valorTotal: "300.00",
    });

    expect(duas).toContain("18/09 e 24/09, foram realizados 2 atendimentos");
    expect(tres).toBe(
      "Olá! Referente aos atendimentos fisioterapêuticos realizados nos dias 18/09, 24/09 e 25/09, foram realizados 3 atendimentos, no valor de R$\u00a0100,00 por sessão, totalizando R$\u00a0300,00.",
    );
  });

  it("mantém status e data de pagamento consistentes nas transições", () => {
    expect(
      marcarCobrancaComoPaga(
        { id: "cobranca", status: "PENDENTE", dataPagamento: null },
        "2026-09-18",
      ),
    ).toEqual({
      id: "cobranca",
      status: "PAGA",
      dataPagamento: "2026-09-18",
    });
    expect(
      voltarCobrancaParaPendente({
        id: "cobranca",
        status: "PAGA",
        dataPagamento: "2026-09-18",
      }),
    ).toEqual({
      id: "cobranca",
      status: "PENDENTE",
      dataPagamento: null,
    });
  });
});
