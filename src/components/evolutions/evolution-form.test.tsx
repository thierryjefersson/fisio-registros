import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { EvolutionActionState } from "@/features/evolutions/action-state";

import { EvolutionForm } from "./evolution-form";

vi.mock("@/components/clinical/markdown-editor", () => ({
  MarkdownEditor: ({ onChange }: { onChange: (value: string) => void }) => (
    <button onClick={() => onChange("**Sessão atual**")} type="button">
      Preencher evolução
    </button>
  ),
}));

afterEach(() => vi.useRealTimers());

describe("EvolutionForm", () => {
  it("inicia com o dia local e exige horário e conteúdo", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-19T01:30:00.000Z"));
    const action = vi.fn(async (): Promise<EvolutionActionState> => ({}));
    render(
      <EvolutionForm
        action={action}
        patientId="7be5c810-f35f-4ec3-a0b9-0eeabf7b10cb"
        submitLabel="Salvar evolução"
      />,
    );

    expect(screen.getByLabelText("Data")).toHaveValue("2026-09-18");
    expect(screen.getByLabelText("Horário")).toBeRequired();
    fireEvent.submit(
      screen.getByRole("button", { name: "Salvar evolução" }).closest("form")!,
    );

    expect(
      screen.getByText("Conteúdo da evolução é obrigatório."),
    ).toBeInTheDocument();
    expect(action).not.toHaveBeenCalled();
  });

  it("envia o conteúdo atual do editor", async () => {
    const action = vi.fn(
      async (
        state: EvolutionActionState,
        formData: FormData,
      ): Promise<EvolutionActionState> => {
        void state;
        void formData;
        return {};
      },
    );
    render(
      <EvolutionForm
        action={action}
        defaultValues={{ horario: "10:30" }}
        patientId="7be5c810-f35f-4ec3-a0b9-0eeabf7b10cb"
        submitLabel="Salvar evolução"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Preencher evolução" }));
    fireEvent.click(screen.getByRole("button", { name: "Salvar evolução" }));

    await waitFor(() => expect(action).toHaveBeenCalledOnce());
    expect((action.mock.calls[0][1] as FormData).get("conteudoMarkdown")).toBe(
      "**Sessão atual**",
    );
  });
});
