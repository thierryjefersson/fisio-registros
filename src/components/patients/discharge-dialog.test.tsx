import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { BillingActionState } from "@/features/billing/action-state";
import type { DischargeActionState } from "@/features/patients/discharge-action-state";

import { DischargeDialog } from "./discharge-dialog";

function setup(unbilledSessions: number) {
  const billingAction = vi.fn(
    async (
      _state: BillingActionState,
      _formData: FormData,
    ): Promise<BillingActionState> => {
      void _state;
      void _formData;
      return {};
    },
  );
  const dischargeAction = vi.fn(
    async (
      _state: DischargeActionState,
      _formData: FormData,
    ): Promise<DischargeActionState> => {
      void _state;
      void _formData;
      return {};
    },
  );
  render(
    <DischargeDialog
      billingAction={billingAction}
      dischargeAction={dischargeAction}
      patientId="paciente"
      unbilledSessions={unbilledSessions}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Dar alta" }));
  return { billingAction, dischargeAction };
}

describe("DischargeDialog", () => {
  it("permite concluir diretamente quando não há sessões livres", async () => {
    const { dischargeAction } = setup(0);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Confirmar alta" }));

    await waitFor(() => expect(dischargeAction).toHaveBeenCalledOnce());
    const formData = dischargeAction.mock.calls[0]?.[1] as FormData;
    expect(formData.get("confirmarSessoesNaoCobradas")).toBe("false");
  });

  it("oferece gerar cobrança ou dar alta mesmo assim quando necessário", async () => {
    const { billingAction, dischargeAction } = setup(2);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "2 sessões ainda não foram cobradas",
    );
    fireEvent.click(screen.getByRole("button", { name: "Gerar cobrança" }));
    await waitFor(() => expect(billingAction).toHaveBeenCalledOnce());
    expect(dischargeAction).not.toHaveBeenCalled();

    fireEvent.click(
      screen.getByRole("button", { name: "Dar alta mesmo assim" }),
    );
    await waitFor(() => expect(dischargeAction).toHaveBeenCalledOnce());
    const formData = dischargeAction.mock.calls[0]?.[1] as FormData;
    expect(formData.get("confirmarSessoesNaoCobradas")).toBe("true");
  });
});
