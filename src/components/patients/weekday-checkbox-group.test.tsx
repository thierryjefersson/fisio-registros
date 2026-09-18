import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { WeekdayCheckboxGroup } from "./weekday-checkbox-group";

function TestWeekdayCheckboxGroup() {
  const [value, setValue] = useState<string[]>([]);
  return <WeekdayCheckboxGroup onChange={setValue} value={value} />;
}

describe("WeekdayCheckboxGroup", () => {
  it("atualiza a frequência exibida ao marcar e desmarcar dias", () => {
    render(<TestWeekdayCheckboxGroup />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Frequência: 0 dias por semana",
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "Segunda-feira" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "Frequência: 1 dia por semana",
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "Quarta-feira" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "Frequência: 2 dias por semana",
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "Segunda-feira" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "Frequência: 1 dia por semana",
    );
  });
});
