import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
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

  it("fecha a navegação mobile com Escape e devolve o foco", async () => {
    render(
      <AppShell>
        <h1>Conteúdo</h1>
      </AppShell>,
    );
    const trigger = screen.getByRole("button", { name: "Abrir navegação" });

    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog", {
      name: "Navegação principal",
    });
    expect(dialog).toBeInTheDocument();
    expect(
      within(dialog).getByRole("link", { name: "Dashboard" }),
    ).toHaveFocus();

    fireEvent.keyDown(window, { key: "Escape" });

    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "Navegação principal" }),
      ).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
    });
  });
});
