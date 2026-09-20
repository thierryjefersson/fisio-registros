import { render, screen } from "@testing-library/react";
import Link from "next/link";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./button";

describe("Button", () => {
  it("mantém semântica nativa quando renderiza um botão", () => {
    render(<Button>Salvar</Button>);

    expect(screen.getByRole("button", { name: "Salvar" })).toHaveAttribute(
      "type",
      "button",
    );
  });

  it("desativa nativeButton automaticamente ao renderizar um link", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    render(<Button render={<Link href="/pacientes" />}>Ver pacientes</Button>);

    expect(
      screen.getByRole("button", { name: "Ver pacientes" }),
    ).toHaveAttribute("href", "/pacientes");
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
