import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { BillingActionState } from "@/features/billing/action-state";

import { UnbilledSessionsSummary } from "./unbilled-sessions-summary";

const action = vi.fn(async (): Promise<BillingActionState> => ({}));

describe("UnbilledSessionsSummary", () => {
  it("mostra datas, quantidade, valor unitário e total", () => {
    render(
      <UnbilledSessionsSummary
        action={action}
        patientId="paciente"
        preview={{
          datas: ["18/09/2026", "20/09/2026"],
          quantidade: 2,
          valorTotal: "R$ 200,00",
          valorUnitario: "R$ 100,00",
        }}
      />,
    );

    expect(screen.getByText("18/09/2026, 20/09/2026")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("R$ 100,00")).toBeInTheDocument();
    expect(screen.getByText("R$ 200,00")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Gerar cobrança" }),
    ).toBeEnabled();
  });

  it("desabilita a geração quando não há sessões livres", () => {
    render(
      <UnbilledSessionsSummary
        action={action}
        patientId="paciente"
        preview={{
          datas: [],
          quantidade: 0,
          valorTotal: "R$ 0,00",
          valorUnitario: "R$ 100,00",
        }}
      />,
    );

    expect(screen.getByText(/Não há atendimentos/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Gerar cobrança" }),
    ).toBeDisabled();
  });
});
