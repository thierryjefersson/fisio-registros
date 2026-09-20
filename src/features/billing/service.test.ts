import { describe, expect, it, vi } from "vitest";

import { Prisma, type PrismaClient } from "@/generated/prisma/client";

import { gerarCobranca } from "./service";

const PACIENTE_ID = "7be5c810-f35f-4ec3-a0b9-0eeabf7b10cb";

describe("serviço de cobrança", () => {
  it("inclui todas as sessões livres e persiste os snapshots", async () => {
    const { create, db } = criarBancoFalso({
      sessoes: [{ id: "sessao-1" }, { id: "sessao-2" }],
      valorSessao: "123.45",
    });

    await gerarCobranca(PACIENTE_ID, db);

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          pacienteId: PACIENTE_ID,
          valorUnitarioSnapshot: expect.objectContaining({}),
          valorTotalSnapshot: expect.objectContaining({}),
          sessoes: {
            create: [{ evolucaoId: "sessao-1" }, { evolucaoId: "sessao-2" }],
          },
        }),
      }),
    );
    const dados = create.mock.calls[0][0].data;
    expect(dados.valorUnitarioSnapshot.toFixed(2)).toBe("123.45");
    expect(dados.valorTotalSnapshot.toFixed(2)).toBe("246.90");
  });

  it("recusa cobrança vazia antes de criar qualquer registro", async () => {
    const { create, db } = criarBancoFalso({ sessoes: [] });

    await expect(gerarCobranca(PACIENTE_ID, db)).rejects.toMatchObject({
      code: "SEM_SESSOES_LIVRES",
    });
    expect(create).not.toHaveBeenCalled();
  });

  it("usa o preço atual sem alterar o snapshot já criado", async () => {
    let valorSessao = "100.00";
    const snapshots: string[] = [];
    const { db } = criarBancoFalso({
      obterValorSessao: () => valorSessao,
      onCreate: (args) => {
        snapshots.push(args.data.valorUnitarioSnapshot.toFixed(2));
        return args.data;
      },
      sessoes: [{ id: "sessao-1" }],
    });

    await gerarCobranca(PACIENTE_ID, db);
    valorSessao = "120.00";
    await gerarCobranca(PACIENTE_ID, db);

    expect(snapshots).toEqual(["100.00", "120.00"]);
  });

  it("propaga falha de vínculo sem produzir um resultado parcial", async () => {
    const erro = new Error("falha ao vincular sessão");
    const { db } = criarBancoFalso({
      onCreate: () => {
        throw erro;
      },
      sessoes: [{ id: "sessao-1" }],
    });

    await expect(gerarCobranca(PACIENTE_ID, db)).rejects.toBe(erro);
  });

  it("diferencia paciente inexistente de conflito de concorrência", async () => {
    const ausente = criarBancoFalso({ pacienteExiste: false });
    await expect(gerarCobranca(PACIENTE_ID, ausente.db)).rejects.toMatchObject({
      code: "PACIENTE_NAO_ENCONTRADO",
    });

    const conflito = criarBancoFalso({
      onCreate: () => {
        throw new Prisma.PrismaClientKnownRequestError("conflito", {
          clientVersion: "7.10.0",
          code: "P2002",
        });
      },
      sessoes: [{ id: "sessao-1" }],
    });
    await expect(gerarCobranca(PACIENTE_ID, conflito.db)).rejects.toEqual(
      expect.objectContaining({ code: "CONFLITO_SESSOES" }),
    );
  });
});

type CreateArgs = {
  data: {
    pacienteId: string;
    sessoes: { create: { evolucaoId: string }[] };
    valorTotalSnapshot: Prisma.Decimal;
    valorUnitarioSnapshot: Prisma.Decimal;
  };
};

function criarBancoFalso({
  obterValorSessao,
  onCreate,
  pacienteExiste = true,
  sessoes = [{ id: "sessao-1" }],
  valorSessao = "100.00",
}: {
  obterValorSessao?: () => string;
  onCreate?: (args: CreateArgs) => unknown;
  pacienteExiste?: boolean;
  sessoes?: { id: string }[];
  valorSessao?: string;
}) {
  const create = vi.fn((args: CreateArgs) => onCreate?.(args) ?? args.data);
  const tx = {
    cobranca: { create },
    evolucao: { findMany: vi.fn(async () => sessoes) },
    paciente: {
      findUnique: vi.fn(async () =>
        pacienteExiste
          ? {
              id: PACIENTE_ID,
              valorSessao: new Prisma.Decimal(
                obterValorSessao?.() ?? valorSessao,
              ),
            }
          : null,
      ),
    },
  };
  const db = {
    $transaction: vi.fn(
      async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx),
    ),
  } as unknown as PrismaClient;

  return { create, db };
}
