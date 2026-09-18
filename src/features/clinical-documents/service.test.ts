import { describe, expect, it, vi } from "vitest";

import type { PrismaClient } from "@/generated/prisma/client";

import { salvarAvaliacaoInicial } from "./service";

describe("serviço da avaliação inicial", () => {
  it("edita a avaliação existente em vez de criar uma segunda", async () => {
    let avaliacao: { id: string; conteudoMarkdown: string } | null = null;
    const create = vi.fn(async ({ data }) => {
      avaliacao = {
        id: "avaliacao-1",
        conteudoMarkdown: data.conteudoMarkdown,
      };
      return avaliacao;
    });
    const update = vi.fn(async ({ data }) => {
      avaliacao = {
        id: "avaliacao-1",
        conteudoMarkdown: data.conteudoMarkdown,
      };
      return avaliacao;
    });
    const tx = {
      $executeRaw: vi.fn(async () => 1),
      avaliacao: {
        findFirst: vi.fn(async () => avaliacao),
        create,
        update,
      },
    };
    const db = {
      $transaction: vi.fn(async (callback) => callback(tx)),
    } as unknown as PrismaClient;

    await salvarAvaliacaoInicial("paciente-1", "Primeira", db);
    await salvarAvaliacaoInicial("paciente-1", "Revisada", db);

    expect(create).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledTimes(1);
    expect(avaliacao).toEqual({
      id: "avaliacao-1",
      conteudoMarkdown: "Revisada",
    });
  });
});
