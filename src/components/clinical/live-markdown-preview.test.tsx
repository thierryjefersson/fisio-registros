import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LiveMarkdownPreview } from "./live-markdown-preview";

describe("LiveMarkdownPreview", () => {
  it("mostra uma orientação quando o documento está vazio", () => {
    render(<LiveMarkdownPreview markdown="" />);

    expect(
      screen.getByText(
        "O conteúdo formatado aparecerá aqui enquanto você digita.",
      ),
    ).toBeInTheDocument();
  });

  it("atualiza o conteúdo Markdown renderizado", () => {
    const { rerender } = render(<LiveMarkdownPreview markdown="# Primeiro" />);
    expect(
      screen.getByRole("heading", { name: "Primeiro" }),
    ).toBeInTheDocument();

    rerender(<LiveMarkdownPreview markdown="## Atualizado" />);

    expect(
      screen.getByRole("heading", { name: "Atualizado" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Primeiro" }),
    ).not.toBeInTheDocument();
  });
});
