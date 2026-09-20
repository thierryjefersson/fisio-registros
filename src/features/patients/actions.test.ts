import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  concluirAlta: vi.fn(),
  redirect: vi.fn(() => {
    throw { digest: "NEXT_REDIRECT;replace" };
  }),
  revalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("./discharge-service", () => ({ concluirAlta: mocks.concluirAlta }));

import { darAltaPacienteAction } from "./actions";

const PACIENTE_ID = "7be5c810-f35f-4ec3-a0b9-0eeabf7b10cb";

describe("ação de alta", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejeita data inválida antes de chamar o serviço", async () => {
    const formData = new FormData();
    formData.set("pacienteId", PACIENTE_ID);
    formData.set("dataAlta", "");

    await expect(darAltaPacienteAction({}, formData)).resolves.toEqual({
      fieldErrors: { dataAlta: ["Data da alta inválida."] },
    });
    expect(mocks.concluirAlta).not.toHaveBeenCalled();
  });

  it("devolve o alerta quando o servidor encontra sessões livres", async () => {
    mocks.concluirAlta.mockResolvedValue({
      status: "unbilled_sessions",
      count: 2,
    });
    const formData = new FormData();
    formData.set("pacienteId", PACIENTE_ID);
    formData.set("dataAlta", "2026-09-20");

    await expect(darAltaPacienteAction({}, formData)).resolves.toEqual({
      unbilledSessions: 2,
    });
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it("revalida dashboard e paciente depois de concluir", async () => {
    mocks.concluirAlta.mockResolvedValue({ status: "completed" });
    const formData = new FormData();
    formData.set("pacienteId", PACIENTE_ID);
    formData.set("dataAlta", "2026-09-20");

    await expect(darAltaPacienteAction({}, formData)).rejects.toMatchObject({
      digest: expect.stringContaining("NEXT_REDIRECT"),
    });
    expect(mocks.revalidatePath.mock.calls).toEqual([
      ["/"],
      ["/pacientes"],
      [`/pacientes/${PACIENTE_ID}`],
    ]);
  });
});
