import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PatientForm } from "./patient-form";
import type { PatientActionState } from "@/features/patients/action-state";

describe("PatientForm", () => {
  it("aplica máscara de telefone com react-number-format", () => {
    const action = vi.fn(
      async (
        ...args: [PatientActionState, FormData]
      ): Promise<PatientActionState> => {
        void args;
        return {};
      },
    );
    render(<PatientForm action={action} submitLabel="Salvar" />);

    const telefone = screen.getByLabelText("Telefone");
    fireEvent.change(telefone, { target: { value: "85999990000" } });

    expect(telefone).toHaveValue("(85) 99999-0000");
  });

  it("usa inputs para os campos objetivos", () => {
    const action = vi.fn(
      async (
        ...args: [PatientActionState, FormData]
      ): Promise<PatientActionState> => {
        void args;
        return {};
      },
    );
    render(<PatientForm action={action} submitLabel="Salvar" />);

    expect(screen.getByLabelText("Endereço").tagName).toBe("INPUT");
    expect(screen.getByLabelText("Patologia").tagName).toBe("INPUT");
    expect(screen.getByLabelText("Queixa principal").tagName).toBe("INPUT");
  });

  it("associa mensagens de validação aos campos inválidos", async () => {
    const action = vi.fn(
      async (
        ...args: [PatientActionState, FormData]
      ): Promise<PatientActionState> => {
        void args;
        return {};
      },
    );
    render(<PatientForm action={action} submitLabel="Salvar" />);

    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

    await waitFor(() =>
      expect(screen.getByText("Nome é obrigatório.")).toBeInTheDocument(),
    );
    expect(screen.getByLabelText("Nome")).toHaveAttribute(
      "aria-describedby",
      "nome-error",
    );
  });
});
