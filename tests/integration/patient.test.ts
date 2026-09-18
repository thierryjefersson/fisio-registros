import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { PrismaPg } from "@prisma/adapter-pg";
import { GenericContainer, type StartedTestContainer } from "testcontainers";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { DiaSemana } from "@/generated/prisma/client";
import { PrismaClient } from "@/generated/prisma/client";
import {
  excluirPacientePorId,
  listarPacientes,
} from "@/features/patients/queries";
import {
  salvarAvaliacaoInicial,
  salvarPlanoTerapeutico,
} from "@/features/clinical-documents/service";

const execFileAsync = promisify(execFile);

describe("migration e agregado Paciente", () => {
  let container: StartedTestContainer;
  let prisma: PrismaClient;
  let connectionString: string;

  beforeAll(async () => {
    container = await new GenericContainer("postgres:16-alpine")
      .withEnvironment({
        POSTGRES_DB: "fisio_test",
        POSTGRES_USER: "fisio",
        POSTGRES_PASSWORD: "fisio_test",
      })
      .withExposedPorts(5432)
      .start();

    connectionString = `postgresql://fisio:fisio_test@${container.getHost()}:${container.getMappedPort(5432)}/fisio_test?schema=public`;
    await execFileAsync("./node_modules/.bin/prisma", ["migrate", "deploy"], {
      cwd: process.cwd(),
      env: { ...process.env, DATABASE_URL: connectionString },
    });

    prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  });

  afterAll(async () => {
    await prisma?.$disconnect();
    await container?.stop();
  });

  it("aplica a migration em banco limpo e cria o status padrão", async () => {
    const paciente = await prisma.paciente.create({
      data: {
        nome: "Maria de Souza",
        dataNascimento: new Date("1985-04-12T00:00:00.000Z"),
        sexo: "FEMININO",
        telefone: "85999990000",
        endereco: "Rua A, 10",
        nomeResponsavel: null,
        patologia: "Tendinite",
        queixaPrincipal: "Dor no ombro",
        valorSessao: "150.50",
        dataInicio: new Date("2026-09-01T00:00:00.000Z"),
        previsaoSessoes: 12,
        diasAtendimento: ["SEGUNDA", "QUARTA"],
      },
    });

    expect(paciente.status).toBe("EM_TRATAMENTO");
    expect(paciente.dataAlta).toBeNull();
    expect(paciente.valorSessao.toFixed(2)).toBe("150.50");
    expect(paciente.dataNascimento.toISOString().slice(0, 10)).toBe(
      "1985-04-12",
    );
    expect(paciente.diasAtendimento).toEqual(["SEGUNDA", "QUARTA"]);
  });

  it("permite dois tratamentos com o mesmo nome", async () => {
    const base = {
      dataNascimento: new Date("1990-01-01T00:00:00.000Z"),
      sexo: "NAO_INFORMADO" as const,
      telefone: "85000000000",
      endereco: "Rua B, 20",
      nomeResponsavel: null,
      patologia: "Patologia",
      queixaPrincipal: "Queixa",
      valorSessao: "100.00",
      dataInicio: new Date("2026-09-01T00:00:00.000Z"),
      previsaoSessoes: 5,
      diasAtendimento: [DiaSemana.SEXTA],
    };

    const primeiro = await prisma.paciente.create({
      data: { ...base, nome: "João Silva" },
    });
    const segundo = await prisma.paciente.create({
      data: { ...base, nome: "João Silva" },
    });

    expect(primeiro.id).not.toBe(segundo.id);
  });

  it("edita somente o paciente identificado pelo UUID", async () => {
    const base = {
      dataNascimento: new Date("1992-01-01T00:00:00.000Z"),
      sexo: "OUTRO" as const,
      telefone: "85111111111",
      endereco: "Rua C, 30",
      nomeResponsavel: null,
      patologia: "Patologia",
      queixaPrincipal: "Queixa",
      valorSessao: "90.00",
      dataInicio: new Date("2026-09-01T00:00:00.000Z"),
      previsaoSessoes: 3,
      diasAtendimento: [DiaSemana.TERCA],
    };
    const primeiro = await prisma.paciente.create({
      data: { ...base, nome: "Mesmo nome" },
    });
    const segundo = await prisma.paciente.create({
      data: { ...base, nome: "Mesmo nome" },
    });

    await prisma.paciente.update({
      where: { id: primeiro.id },
      data: { telefone: "85888888888", valorSessao: "125.75" },
    });

    const segundoAtualizado = await prisma.paciente.findUniqueOrThrow({
      where: { id: segundo.id },
    });
    expect(segundoAtualizado.telefone).toBe(base.telefone);
    expect(segundoAtualizado.valorSessao.toFixed(2)).toBe("90.00");
  });

  it("busca por nome sem diferenciar maiúsculas e minúsculas", async () => {
    const paciente = await criarPacienteDeTeste(prisma, {
      nome: "Busca CaSe InSeNsItIvE",
    });

    const encontrados = await listarPacientes(
      { busca: "case insensitive", filtro: "todos" },
      prisma,
    );

    expect(encontrados.map((item) => item.id)).toContain(paciente.id);
  });

  it("aplica os filtros de status e combina filtro com busca", async () => {
    const ativo = await criarPacienteDeTeste(prisma, {
      nome: "Filtro Combinado Ativo",
    });
    const alta = await criarPacienteDeTeste(prisma, {
      nome: "Filtro Combinado Alta",
      status: "ALTA",
      dataAlta: new Date("2026-09-18T00:00:00.000Z"),
    });

    const ativos = await listarPacientes(
      { busca: "Filtro Combinado", filtro: "em-tratamento" },
      prisma,
    );
    const altas = await listarPacientes(
      { busca: "Filtro Combinado", filtro: "alta" },
      prisma,
    );
    const todos = await listarPacientes(
      { busca: "Filtro Combinado", filtro: "todos" },
      prisma,
    );

    expect(ativos.map((item) => item.id)).toEqual([ativo.id]);
    expect(altas.map((item) => item.id)).toEqual([alta.id]);
    expect(todos.map((item) => item.id).sort()).toEqual(
      [ativo.id, alta.id].sort(),
    );
  });

  it("exclui somente o UUID indicado e trata UUID inexistente", async () => {
    const removido = await criarPacienteDeTeste(prisma, {
      nome: "Paciente a remover",
    });
    const preservado = await criarPacienteDeTeste(prisma, {
      nome: "Paciente preservado",
    });

    await expect(excluirPacientePorId(removido.id, prisma)).resolves.toBe(
      "deleted",
    );
    await expect(excluirPacientePorId(removido.id, prisma)).resolves.toBe(
      "not_found",
    );
    await expect(excluirPacientePorId("uuid-invalido", prisma)).resolves.toBe(
      "not_found",
    );
    await expect(
      prisma.paciente.findUnique({ where: { id: preservado.id } }),
    ).resolves.not.toBeNull();
  });

  it("cria e edita uma única avaliação inicial", async () => {
    const paciente = await criarPacienteDeTeste(prisma, {
      nome: "Paciente com avaliação",
    });

    await salvarAvaliacaoInicial(paciente.id, "# Inicial", prisma);
    await salvarAvaliacaoInicial(paciente.id, "# Atualizada", prisma);

    const avaliacoes = await prisma.avaliacao.findMany({
      where: { pacienteId: paciente.id, tipo: "INICIAL" },
    });
    expect(avaliacoes).toHaveLength(1);
    expect(avaliacoes[0].conteudoMarkdown).toBe("# Atualizada");
  });

  it("salva objetivos e condutas independentemente", async () => {
    const paciente = await criarPacienteDeTeste(prisma, {
      nome: "Paciente com plano",
    });

    await salvarPlanoTerapeutico(
      paciente.id,
      "Objetivo A",
      "Conduta A",
      prisma,
    );
    await salvarPlanoTerapeutico(
      paciente.id,
      "Objetivo B",
      "Conduta A",
      prisma,
    );

    const plano = await prisma.planoTerapeutico.findUniqueOrThrow({
      where: { pacienteId: paciente.id },
    });
    expect(plano.objetivosMarkdown).toBe("Objetivo B");
    expect(plano.condutasMarkdown).toBe("Conduta A");
  });

  it("excluir paciente remove avaliação e plano em cascata", async () => {
    const paciente = await criarPacienteDeTeste(prisma, {
      nome: "Paciente com documentos para excluir",
    });
    await salvarAvaliacaoInicial(paciente.id, "Avaliação", prisma);
    await salvarPlanoTerapeutico(paciente.id, "Objetivos", "Condutas", prisma);

    await excluirPacientePorId(paciente.id, prisma);

    await expect(
      prisma.avaliacao.count({ where: { pacienteId: paciente.id } }),
    ).resolves.toBe(0);
    await expect(
      prisma.planoTerapeutico.count({ where: { pacienteId: paciente.id } }),
    ).resolves.toBe(0);
  });
});

function criarPacienteDeTeste(
  prisma: PrismaClient,
  overrides: Partial<Parameters<PrismaClient["paciente"]["create"]>[0]["data"]>,
) {
  return prisma.paciente.create({
    data: {
      nome: "Paciente de teste",
      dataNascimento: new Date("1990-01-01T00:00:00.000Z"),
      sexo: "NAO_INFORMADO",
      telefone: "85999990000",
      endereco: "Rua dos Testes, 10",
      nomeResponsavel: null,
      patologia: "Patologia de teste",
      queixaPrincipal: "Queixa de teste",
      valorSessao: "100.00",
      dataInicio: new Date("2026-09-01T00:00:00.000Z"),
      previsaoSessoes: 5,
      diasAtendimento: ["SEGUNDA"],
      ...overrides,
    },
  });
}
