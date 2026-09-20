import { describe, expect, it } from "vitest";

import { criarCobrancaViewModel, criarPreviaFinanceira } from "./view-model";

describe("view models financeiros", () => {
  it("monta a prévia com datas, quantidade, valor e total", () => {
    expect(
      criarPreviaFinanceira({
        evolucoes: [{ data: "2026-09-18" }, { data: "2026-09-20" }],
        valorSessao: "100.25",
      }),
    ).toEqual({
      datas: ["18/09/2026", "20/09/2026"],
      quantidade: 2,
      valorTotal: "R$\u00a0200,50",
      valorUnitario: "R$\u00a0100,25",
    });
  });

  it("usa snapshots da cobrança mesmo quando o preço atual é diferente", () => {
    const precoAtualPaciente = "999.00";
    const viewModel = criarCobrancaViewModel({
      createdAt: new Date("2026-09-18T12:00:00.000Z"),
      dataPagamento: null,
      id: "cobranca",
      pacienteId: "paciente",
      sessoes: [{ evolucao: { data: "2026-09-18" } }],
      status: "PENDENTE",
      valorTotalSnapshot: "100.00",
      valorUnitarioSnapshot: "100.00",
    });

    expect(precoAtualPaciente).toBe("999.00");
    expect(viewModel.valorUnitario).toBe("R$\u00a0100,00");
    expect(viewModel.valorTotal).toBe("R$\u00a0100,00");
    expect(viewModel.mensagem).toContain("R$\u00a0100,00 por sessão");
  });
});
