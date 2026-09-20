import { beforeEach, describe, expect, it, vi } from "vitest";

import { BillingError } from "./errors";

const mocks = vi.hoisted(() => ({
  atualizarStatusCobranca: vi.fn(),
  excluirCobranca: vi.fn(),
  gerarCobranca: vi.fn(),
  redirect: vi.fn(() => {
    throw { digest: "NEXT_REDIRECT;replace" };
  }),
  revalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("./service", () => ({
  atualizarStatusCobranca: mocks.atualizarStatusCobranca,
  excluirCobranca: mocks.excluirCobranca,
  gerarCobranca: mocks.gerarCobranca,
}));

import { gerarCobrancaAction, marcarCobrancaPagaAction } from "./actions";

const PACIENTE_ID = "7be5c810-f35f-4ec3-a0b9-0eeabf7b10cb";

describe("ações financeiras", () => {
  beforeEach(() => vi.clearAllMocks());

  it("chama a transação, revalida somente páginas financeiras e redireciona", async () => {
    mocks.gerarCobranca.mockResolvedValue({});
    const formData = new FormData();
    formData.set("pacienteId", PACIENTE_ID);

    await expect(gerarCobrancaAction({}, formData)).rejects.toMatchObject({
      digest: expect.stringContaining("NEXT_REDIRECT"),
    });

    expect(mocks.gerarCobranca).toHaveBeenCalledWith(PACIENTE_ID);
    expect(mocks.revalidatePath.mock.calls).toEqual([
      [`/pacientes/${PACIENTE_ID}/financeiro`],
      ["/financeiro"],
    ]);
  });

  it("transforma conflito transacional em mensagem legível", async () => {
    mocks.gerarCobranca.mockRejectedValue(
      new BillingError(
        "CONFLITO_SESSOES",
        "As sessões disponíveis mudaram. Atualize a prévia e tente novamente.",
      ),
    );
    const formData = new FormData();
    formData.set("pacienteId", PACIENTE_ID);

    await expect(gerarCobrancaAction({}, formData)).resolves.toEqual({
      formError:
        "As sessões disponíveis mudaram. Atualize a prévia e tente novamente.",
    });
  });

  it("rejeita pagamento sem data antes de chamar o serviço", async () => {
    const formData = new FormData();
    formData.set("pacienteId", PACIENTE_ID);
    formData.set("cobrancaId", "8f90155d-66a4-4aa5-8e30-d8e4807759b5");
    formData.set("dataPagamento", "");

    await expect(marcarCobrancaPagaAction({}, formData)).resolves.toEqual({
      fieldErrors: { dataPagamento: ["Data de pagamento inválida."] },
    });
    expect(mocks.atualizarStatusCobranca).not.toHaveBeenCalled();
  });
});
