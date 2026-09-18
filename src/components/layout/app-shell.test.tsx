import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppShell } from "./app-shell";

describe("AppShell", () => {
  it("renderiza o conteúdo e todos os destinos da navegação", () => {
    render(
      <AppShell>
        <h1>Conteúdo da página</h1>
      </AppShell>,
    );

    expect(
      screen.getByRole("heading", { name: "Conteúdo da página" }),
    ).toBeInTheDocument();

    for (const nome of [
      "Dashboard",
      "Pacientes",
      "Financeiro",
      "Configurações",
    ]) {
      expect(screen.getByRole("link", { name: nome })).toBeInTheDocument();
    }

    fireEvent.click(screen.getByRole("button", { name: "Abrir navegação" }));

    for (const nome of [
      "Dashboard",
      "Pacientes",
      "Financeiro",
      "Configurações",
    ]) {
      expect(screen.getAllByRole("link", { name: nome })).toHaveLength(2);
    }
  });
});
