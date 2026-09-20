import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { BillingActionState } from "@/features/billing/action-state";

import { BillingCard, type BillingCardData } from "./billing-card";

const billing: BillingCardData = {
  dataPagamento: "20/09/2026",
  datas: ["18/09/2026"],
  id: "cobranca",
  mensagem: "Mensagem exata da cobrança.",
  pacienteId: "paciente",
  quantidade: 1,
  status: "PAGA",
  valorTotal: "R$ 100,00",
  valorUnitario: "R$ 100,00",
};

describe("BillingCard", () => {
  const deleteAction = vi.fn(async (formData: FormData) => void formData);
  const paymentAction = vi.fn(async (): Promise<BillingActionState> => ({}));
  const reopenAction = vi.fn(async (formData: FormData) => void formData);
  const writeText = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    writeText.mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
  });

  it("copia exatamente a mensagem exibida", async () => {
    renderCard();

    expect(screen.getByText(billing.mensagem)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Copiar mensagem" }));

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith("Mensagem exata da cobrança."),
    );
  });

  it("pede confirmação antes de reabrir e remover a data", async () => {
    renderCard();

    fireEvent.click(
      screen.getByRole("button", { name: "Voltar para pendente" }),
    );
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "data de pagamento será removida",
    );
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(reopenAction).not.toHaveBeenCalled();

    fireEvent.click(
      screen.getByRole("button", { name: "Voltar para pendente" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Confirmar reabertura" }),
    );
    await waitFor(() => expect(reopenAction).toHaveBeenCalledOnce());
  });

  it("pede confirmação antes de excluir", async () => {
    renderCard();

    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "sessões voltarão a ficar disponíveis",
    );
    fireEvent.click(screen.getByRole("button", { name: "Excluir cobrança" }));
    await waitFor(() => expect(deleteAction).toHaveBeenCalledOnce());
  });

  function renderCard() {
    render(
      <BillingCard
        billing={billing}
        deleteAction={deleteAction}
        paymentAction={paymentAction}
        reopenAction={reopenAction}
      />,
    );
  }
});
