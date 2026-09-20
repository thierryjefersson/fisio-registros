import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ExportDataLink } from "./export-data-link";

describe("ExportDataLink", () => {
  it("inicia o download pela rota de exportação", () => {
    render(<ExportDataLink />);

    const link = screen.getByRole("link", { name: "Exportar dados" });
    expect(link).toHaveAttribute("href", "/api/exportar");
    expect(link).toHaveAttribute("download");
  });
});
