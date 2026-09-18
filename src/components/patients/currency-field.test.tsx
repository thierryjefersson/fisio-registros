import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CurrencyField } from "./currency-field";

describe("CurrencyField", () => {
  it("exibe o prefixo de moeda no campo", () => {
    render(
      <CurrencyField
        aria-label="Valor"
        onValueChange={() => undefined}
        value="100"
      />,
    );

    expect(screen.getByRole("textbox", { name: "Valor" })).toHaveValue(
      "R$ 100",
    );
  });

  it("entrega o valor decimal normalizado", () => {
    const onValueChange = vi.fn();
    render(<CurrencyField aria-label="Valor" onValueChange={onValueChange} />);

    fireEvent.change(screen.getByRole("textbox", { name: "Valor" }), {
      target: { value: "1234,56" },
    });

    expect(onValueChange).toHaveBeenLastCalledWith("1234.56");
  });
});
