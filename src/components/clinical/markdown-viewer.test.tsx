import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MarkdownViewer } from "./markdown-viewer";

describe("MarkdownViewer", () => {
  it("renderiza a estrutura permitida e ignora HTML bruto", () => {
    const { container } = render(
      <MarkdownViewer
        markdown={'# Título\n\n**Importante**\n\n<script>alert("x")</script>'}
      />,
    );

    expect(screen.getByRole("heading", { name: "Título" })).toBeInTheDocument();
    expect(screen.getByText("Importante").tagName).toBe("STRONG");
    expect(container.querySelector("script")).toBeNull();
    expect(container).not.toHaveTextContent('alert("x")');
  });
});
