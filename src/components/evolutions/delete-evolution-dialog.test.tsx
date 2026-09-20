import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DeleteEvolutionDialog } from "./delete-evolution-dialog";

describe("DeleteEvolutionDialog", () => {
  it("só exclui depois da confirmação explícita", async () => {
    const action = vi.fn(async (formData: FormData) => void formData);
    render(
      <DeleteEvolutionDialog
        action={action}
        evolutionId="evolution-id"
        patientId="patient-id"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "removido permanentemente",
    );
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(action).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Excluir definitivamente" }),
    );
    await waitFor(() => expect(action).toHaveBeenCalledOnce());
  });
});
