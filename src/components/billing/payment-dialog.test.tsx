import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { BillingActionState } from "@/features/billing/action-state";

import { PaymentDialog } from "./payment-dialog";

describe("PaymentDialog", () => {
  it("solicita uma data obrigatória para marcar como paga", () => {
    const action = vi.fn(async (): Promise<BillingActionState> => ({}));
    render(
      <PaymentDialog
        action={action}
        billingId="cobranca"
        patientId="paciente"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Marcar como paga" }));
    const input = screen.getByLabelText("Data do pagamento");
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("type", "date");

    fireEvent.change(input, { target: { value: "" } });
    fireEvent.click(
      screen.getByRole("button", { name: "Confirmar pagamento" }),
    );
    expect(action).not.toHaveBeenCalled();
  });
});
