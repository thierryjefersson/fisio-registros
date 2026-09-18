import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CopyContentActions } from "./copy-content-actions";

const { toastSuccess, toastError } = vi.hoisted(() => ({
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: toastSuccess, error: toastError },
}));

class ClipboardItemMock {
  constructor(public data: Record<string, Blob>) {}
}

describe("CopyContentActions", () => {
  const writeText = vi.fn();
  const write = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, { clipboard: { writeText, write } });
    vi.stubGlobal("ClipboardItem", ClipboardItemMock);
  });

  it("copia o Markdown como texto puro", async () => {
    writeText.mockResolvedValue(undefined);
    render(<CopyContentActions markdown="**Dor**" />);

    fireEvent.click(screen.getByRole("button", { name: "Copiar Markdown" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith("**Dor**"));
    expect(toastSuccess).toHaveBeenCalledWith("Markdown copiado.");
  });

  it("copia HTML e fallback de texto no modo formatado", async () => {
    write.mockResolvedValue(undefined);
    render(<CopyContentActions markdown="**Dor**" />);

    fireEvent.click(screen.getByRole("button", { name: "Copiar formatado" }));

    await waitFor(() => expect(write).toHaveBeenCalledOnce());
    const item = write.mock.calls[0][0][0] as ClipboardItemMock;
    expect(Object.keys(item.data).sort()).toEqual(["text/html", "text/plain"]);
    expect(toastSuccess).toHaveBeenCalledWith("Conteúdo formatado copiado.");
  });

  it("informa erro quando o navegador recusa a cópia", async () => {
    writeText.mockRejectedValue(new Error("sem permissão"));
    render(<CopyContentActions markdown="conteúdo" />);

    fireEvent.click(screen.getByRole("button", { name: "Copiar Markdown" }));

    await waitFor(() => expect(toastError).toHaveBeenCalledOnce());
  });
});
