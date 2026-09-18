import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/form", () => ({
  default: (props: React.ComponentProps<"form">) => <form {...props} />,
}));

import { PatientListFilters } from "./patient-list-filters";

describe("PatientListFilters", () => {
  it("leva busca e filtro atual para a URL esperada", () => {
    render(<PatientListFilters busca="Maria" filtro="alta" />);

    expect(screen.getByLabelText("Buscar por nome")).toHaveValue("Maria");
    expect(screen.getByRole("link", { name: "Todos" })).toHaveAttribute(
      "href",
      "/pacientes?busca=Maria&filtro=todos",
    );
    expect(screen.getByRole("link", { name: "Alta" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("button", { name: "Limpar" })).toHaveAttribute(
      "href",
      "/pacientes?filtro=alta",
    );
  });

  it("submete o termo informado e preserva o filtro", () => {
    const { container } = render(
      <PatientListFilters busca="" filtro="todos" />,
    );

    const form = container.querySelector("form");
    expect(form).toHaveAttribute("action", "/pacientes");
    expect(form?.querySelector('input[name="busca"]')).toBeInTheDocument();
    expect(form?.querySelector('input[name="filtro"]')).toHaveValue("todos");
  });
});
