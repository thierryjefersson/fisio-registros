import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DeletePatientDialog } from "./delete-patient-dialog";

describe("DeletePatientDialog", () => {
  it("descreve a ação destrutiva e só confirma pela ação explícita", async () => {
    const action = vi.fn(async (formData: FormData) => {
      void formData;
    });
    render(
      <DeletePatientDialog action={action} id="patient-id" name="Maria" />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Excluir tratamento" }));
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "Avaliações, evoluções e cobranças vinculadas também serão removidas",
    );
    expect(screen.getByRole("button", { name: "Cancelar" })).toHaveClass(
      "min-h-10",
    );
    expect(
      screen.getByRole("button", { name: "Excluir definitivamente" }),
    ).toHaveClass("min-h-10");

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(action).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Excluir tratamento" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Excluir definitivamente" }),
    );
    await waitFor(() => expect(action).toHaveBeenCalledOnce());
    expect(action.mock.calls[0]?.[0]).toBeInstanceOf(FormData);
  });
});
