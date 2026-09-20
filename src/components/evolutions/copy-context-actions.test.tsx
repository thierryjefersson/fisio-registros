import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CopyContextActions } from "./copy-context-actions";

const { success, error } = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}));
vi.mock("sonner", () => ({ toast: { success, error } }));

describe("CopyContextActions", () => {
  const writeText = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, { clipboard: { writeText } });
    writeText.mockResolvedValue(undefined);
  });

  it("copia separadamente o contexto recente e o completo", async () => {
    render(
      <CopyContextActions
        completeContext="todas"
        recentContext="últimas cinco"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Copiar contexto/ }));
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "Últimas 5 evoluções" }),
    );
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith("últimas cinco"),
    );

    fireEvent.click(screen.getByRole("button", { name: /Copiar contexto/ }));
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "Contexto completo" }),
    );
    await waitFor(() => expect(writeText).toHaveBeenCalledWith("todas"));
  });
});
