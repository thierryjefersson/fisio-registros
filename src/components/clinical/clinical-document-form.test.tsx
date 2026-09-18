import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AssessmentForm } from "./clinical-document-form";
import type { ClinicalDocumentActionState } from "@/features/clinical-documents/action-state";

vi.mock("@/components/clinical/markdown-editor", () => ({
  MarkdownEditor: ({ onChange }: { onChange: (value: string) => void }) => (
    <button onClick={() => onChange("# Conteúdo atual")} type="button">
      Editar conteúdo
    </button>
  ),
}));

vi.mock("@/components/clinical/copy-content-actions", () => ({
  CopyContentActions: () => <div>Ações de cópia</div>,
}));

describe("AssessmentForm", () => {
  it("salva o conteúdo atual do editor", async () => {
    const action = vi.fn(
      async (
        state: ClinicalDocumentActionState,
        formData: FormData,
      ): Promise<ClinicalDocumentActionState> => {
        void state;
        void formData;
        return {};
      },
    );
    render(
      <AssessmentForm
        action={action}
        initialMarkdown="Inicial"
        patientId="7be5c810-f35f-4ec3-a0b9-0eeabf7b10cb"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Editar conteúdo" }));
    expect(
      screen.getByRole("heading", { name: "Conteúdo atual" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Salvar avaliação" }));

    await waitFor(() => expect(action).toHaveBeenCalledOnce());
    const formData = action.mock.calls[0][1] as FormData;
    expect(formData.get("conteudoMarkdown")).toBe("# Conteúdo atual");
  });
});
