import { describe, expect, it, vi } from "vitest";

import type { PacienteParaExportacao } from "./data";
import { buscarDadosParaExportacao } from "./data";
import {
  criarNomeArquivoExportacao,
  criarRespostaExportacao,
  serializarExportacao,
} from "./serialize";

const exportedAt = new Date("2026-09-20T03:04:05.000Z");

describe("exportação", () => {
  it("serializa decimais, datas, horários e timestamps explicitamente", () => {
    const backup = serializarExportacao([criarPacienteCompleto()], exportedAt);
    const paciente = backup.data.pacientes[0];

    expect(backup).toMatchObject({
      schemaVersion: 1,
      exportedAt: "2026-09-20T03:04:05.000Z",
    });
    expect(paciente).toMatchObject({
      valorSessao: "123.45",
      dataNascimento: "1990-02-03",
      dataAlta: null,
      createdAt: "2026-09-18T10:11:12.000Z",
      evolucoes: [{ data: "2026-09-19", horario: "14:30:45" }],
      cobrancas: [
        {
          valorUnitarioSnapshot: "123.45",
          valorTotalSnapshot: "123.45",
          dataPagamento: "2026-09-20",
        },
      ],
    });
  });

  it("produz um backup vazio válido e uma saída determinística", () => {
    expect(serializarExportacao([], exportedAt)).toEqual({
      schemaVersion: 1,
      exportedAt: "2026-09-20T03:04:05.000Z",
      data: { pacientes: [] },
    });

    const dados = [criarPacienteCompleto()];
    expect(JSON.stringify(serializarExportacao(dados, exportedAt))).toBe(
      JSON.stringify(serializarExportacao(dados, exportedAt)),
    );
  });

  it("consulta entidades e relações em ordem determinística", async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    await buscarDadosParaExportacao({ paciente: { findMany } } as never);

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        include: expect.objectContaining({
          avaliacoes: expect.objectContaining({ orderBy: expect.any(Array) }),
          evolucoes: expect.objectContaining({ orderBy: expect.any(Array) }),
          cobrancas: expect.objectContaining({
            orderBy: expect.any(Array),
            include: expect.objectContaining({
              sessoes: expect.objectContaining({
                orderBy: expect.any(Array),
              }),
            }),
          }),
        }),
      }),
    );
  });

  it("gera o nome no fuso local e os cabeçalhos de download", async () => {
    const nome = criarNomeArquivoExportacao(exportedAt);
    const response = criarRespostaExportacao(
      serializarExportacao([], exportedAt),
      nome,
    );

    expect(nome).toBe("fisio-backup-2026-09-20-000405.json");
    expect(response.headers.get("Content-Type")).toBe(
      "application/json; charset=utf-8",
    );
    expect(response.headers.get("Content-Disposition")).toBe(
      `attachment; filename="${nome}"`,
    );
    await expect(response.json()).resolves.toMatchObject({ schemaVersion: 1 });
  });
});

function decimal(valor: string) {
  return { toFixed: () => valor };
}

function criarPacienteCompleto() {
  const createdAt = new Date("2026-09-18T10:11:12.000Z");
  const updatedAt = new Date("2026-09-19T10:11:12.000Z");

  return {
    id: "paciente-1",
    nome: "Paciente",
    dataNascimento: new Date("1990-02-03T00:00:00.000Z"),
    sexo: "NAO_INFORMADO",
    telefone: "85999990000",
    endereco: "Rua A",
    nomeResponsavel: null,
    patologia: "Patologia",
    queixaPrincipal: "Queixa",
    valorSessao: decimal("123.45"),
    dataInicio: new Date("2026-09-01T00:00:00.000Z"),
    previsaoSessoes: 10,
    diasAtendimento: ["SEGUNDA"],
    status: "EM_TRATAMENTO",
    dataAlta: null,
    createdAt,
    updatedAt,
    avaliacoes: [
      {
        id: "avaliacao-1",
        pacienteId: "paciente-1",
        tipo: "INICIAL",
        data: new Date("2026-09-01T00:00:00.000Z"),
        conteudoMarkdown: "# Avaliação",
        createdAt,
        updatedAt,
      },
    ],
    planoTerapeutico: {
      id: "plano-1",
      pacienteId: "paciente-1",
      objetivosMarkdown: "Objetivos",
      condutasMarkdown: "Condutas",
      createdAt,
      updatedAt,
    },
    evolucoes: [
      {
        id: "evolucao-1",
        pacienteId: "paciente-1",
        data: new Date("2026-09-19T00:00:00.000Z"),
        horario: new Date("1970-01-01T14:30:45.000Z"),
        conteudoMarkdown: "Evolução",
        createdAt,
        updatedAt,
      },
    ],
    cobrancas: [
      {
        id: "cobranca-1",
        pacienteId: "paciente-1",
        status: "PAGA",
        valorUnitarioSnapshot: decimal("123.45"),
        valorTotalSnapshot: decimal("123.45"),
        dataPagamento: new Date("2026-09-20T00:00:00.000Z"),
        createdAt,
        updatedAt,
        sessoes: [
          {
            id: "sessao-1",
            cobrancaId: "cobranca-1",
            evolucaoId: "evolucao-1",
            createdAt,
          },
        ],
      },
    ],
  } as unknown as PacienteParaExportacao;
}
