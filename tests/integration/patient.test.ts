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
import { gerarContextoClinico } from "@/features/evolutions/context";
import {
  excluirEvolucao,
  listarEvolucoes,
  obterPacienteComContexto,
} from "@/features/evolutions/queries";
import {
  atualizarStatusCobranca,
  excluirCobranca,
  gerarCobranca,
} from "@/features/billing/service";
import { calcularResumoFinanceiro } from "@/features/billing/domain";
import {
  listarCobrancasGerais,
  obterFinanceiroPaciente,
} from "@/features/billing/queries";
import { obterDashboard } from "@/features/dashboard/queries";
import { concluirAlta } from "@/features/patients/discharge-service";

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

  it("cria, edita e exclui evolução sem afetar outro paciente", async () => {
    const paciente = await criarPacienteDeTeste(prisma, {
      nome: "Paciente com evolução",
    });
    const outro = await criarPacienteDeTeste(prisma, {
      nome: "Outro paciente com evolução",
    });
    const evolucao = await prisma.evolucao.create({
      data: {
        pacienteId: paciente.id,
        data: new Date("2026-09-18T00:00:00.000Z"),
        horario: new Date("1970-01-01T14:30:00.000Z"),
        conteudoMarkdown: "Conteúdo inicial",
      },
    });
    const preservada = await prisma.evolucao.create({
      data: {
        pacienteId: outro.id,
        data: new Date("2026-09-18T00:00:00.000Z"),
        horario: new Date("1970-01-01T15:30:00.000Z"),
        conteudoMarkdown: "Outro conteúdo",
      },
    });

    await prisma.evolucao.updateMany({
      where: { id: evolucao.id, pacienteId: paciente.id },
      data: { conteudoMarkdown: "Conteúdo atualizado" },
    });
    expect(
      await prisma.evolucao.findUniqueOrThrow({ where: { id: evolucao.id } }),
    ).toMatchObject({ conteudoMarkdown: "Conteúdo atualizado" });

    await expect(
      excluirEvolucao(paciente.id, evolucao.id, prisma),
    ).resolves.toBe("deleted");
    await expect(
      prisma.evolucao.findUnique({ where: { id: preservada.id } }),
    ).resolves.not.toBeNull();
  });

  it("lista evoluções na ordem decrescente de data, horário e criação", async () => {
    const paciente = await criarPacienteDeTeste(prisma, {
      nome: "Paciente para ordenar evoluções",
    });
    const common = {
      pacienteId: paciente.id,
      data: new Date("2026-09-18T00:00:00.000Z"),
      horario: new Date("1970-01-01T09:00:00.000Z"),
    };
    await prisma.evolucao.create({
      data: {
        ...common,
        conteudoMarkdown: "Primeira no empate",
        createdAt: new Date("2026-09-18T10:00:00.000Z"),
      },
    });
    await prisma.evolucao.create({
      data: {
        ...common,
        conteudoMarkdown: "Segunda no empate",
        createdAt: new Date("2026-09-18T11:00:00.000Z"),
      },
    });
    await prisma.evolucao.create({
      data: {
        ...common,
        horario: new Date("1970-01-01T10:00:00.000Z"),
        conteudoMarkdown: "Horário mais recente",
      },
    });
    await prisma.evolucao.create({
      data: {
        ...common,
        data: new Date("2026-09-19T00:00:00.000Z"),
        conteudoMarkdown: "Data mais recente",
      },
    });

    const list = await listarEvolucoes(paciente.id, prisma);
    expect(list.map((item) => item.conteudoMarkdown)).toEqual([
      "Data mais recente",
      "Horário mais recente",
      "Segunda no empate",
      "Primeira no empate",
    ]);
  });

  it("resume quantidade e última sessão e isola o contexto por paciente", async () => {
    const primeiro = await criarPacienteDeTeste(prisma, {
      nome: "Contexto primeiro",
      patologia: "Patologia primeiro",
    });
    const segundo = await criarPacienteDeTeste(prisma, {
      nome: "Contexto segundo",
      patologia: "Patologia segundo",
    });
    await prisma.evolucao.createMany({
      data: [
        {
          pacienteId: primeiro.id,
          data: new Date("2026-09-17T00:00:00.000Z"),
          horario: new Date("1970-01-01T09:00:00.000Z"),
          conteudoMarkdown: "Sessão antiga primeiro",
        },
        {
          pacienteId: primeiro.id,
          data: new Date("2026-09-18T00:00:00.000Z"),
          horario: new Date("1970-01-01T10:00:00.000Z"),
          conteudoMarkdown: "Sessão recente primeiro",
        },
        {
          pacienteId: segundo.id,
          data: new Date("2026-09-19T00:00:00.000Z"),
          horario: new Date("1970-01-01T11:00:00.000Z"),
          conteudoMarkdown: "Sessão exclusiva segundo",
        },
      ],
    });

    const dados = await obterPacienteComContexto(primeiro.id, prisma);
    expect(dados?.evolucoes).toHaveLength(2);
    expect(dados?.evolucoes[0].conteudoMarkdown).toBe(
      "Sessão recente primeiro",
    );
    const contexto = gerarContextoClinico({
      patologia: dados?.patologia,
      queixaPrincipal: dados?.queixaPrincipal,
      evolucoes: dados?.evolucoes ?? [],
    });
    expect(contexto).toContain("Patologia primeiro");
    expect(contexto).toContain("Sessão recente primeiro");
    expect(contexto).not.toContain("Sessão exclusiva segundo");
  });

  it("excluir paciente remove suas evoluções em cascata", async () => {
    const paciente = await criarPacienteDeTeste(prisma, {
      nome: "Paciente com evolução para excluir",
    });
    await prisma.evolucao.create({
      data: {
        pacienteId: paciente.id,
        data: new Date("2026-09-18T00:00:00.000Z"),
        horario: new Date("1970-01-01T14:30:00.000Z"),
        conteudoMarkdown: "Será removida",
      },
    });

    await excluirPacientePorId(paciente.id, prisma);

    await expect(
      prisma.evolucao.count({ where: { pacienteId: paciente.id } }),
    ).resolves.toBe(0);
  });

  it("gera cobrança com todas as sessões livres e preserva snapshots", async () => {
    const paciente = await criarPacienteDeTeste(prisma, {
      nome: "Paciente com cobrança",
      valorSessao: "100.25",
    });
    await criarEvolucaoDeTeste(prisma, paciente.id, "2026-09-18", "09:00");
    await criarEvolucaoDeTeste(prisma, paciente.id, "2026-09-19", "10:00");

    const cobranca = await gerarCobranca(paciente.id, prisma);

    expect(cobranca.status).toBe("PENDENTE");
    expect(cobranca.dataPagamento).toBeNull();
    expect(cobranca.sessoes).toHaveLength(2);
    expect(cobranca.valorUnitarioSnapshot.toFixed(2)).toBe("100.25");
    expect(cobranca.valorTotalSnapshot.toFixed(2)).toBe("200.50");

    await prisma.paciente.update({
      where: { id: paciente.id },
      data: { valorSessao: "120.00" },
    });
    const snapshot = await prisma.cobranca.findUniqueOrThrow({
      where: { id: cobranca.id },
    });
    expect(snapshot.valorUnitarioSnapshot.toFixed(2)).toBe("100.25");
    expect(snapshot.valorTotalSnapshot.toFixed(2)).toBe("200.50");

    await criarEvolucaoDeTeste(prisma, paciente.id, "2026-09-20", "11:00");
    const novaCobranca = await gerarCobranca(paciente.id, prisma);
    expect(novaCobranca.valorUnitarioSnapshot.toFixed(2)).toBe("120.00");
    expect(novaCobranca.valorTotalSnapshot.toFixed(2)).toBe("120.00");
  });

  it("não cria cobrança vazia", async () => {
    const paciente = await criarPacienteDeTeste(prisma, {
      nome: "Paciente sem sessão livre",
    });

    await expect(gerarCobranca(paciente.id, prisma)).rejects.toMatchObject({
      code: "SEM_SESSOES_LIVRES",
    });
    await expect(
      prisma.cobranca.count({ where: { pacienteId: paciente.id } }),
    ).resolves.toBe(0);
  });

  it("impede dupla cobrança e não deixa cobrança parcial em concorrência", async () => {
    const paciente = await criarPacienteDeTeste(prisma, {
      nome: "Paciente concorrente",
    });
    await criarEvolucaoDeTeste(prisma, paciente.id, "2026-09-18", "09:00");
    await criarEvolucaoDeTeste(prisma, paciente.id, "2026-09-19", "09:00");

    const resultados = await Promise.allSettled([
      gerarCobranca(paciente.id, prisma),
      gerarCobranca(paciente.id, prisma),
    ]);

    expect(
      resultados.filter(({ status }) => status === "fulfilled"),
    ).toHaveLength(1);
    expect(
      resultados.filter(({ status }) => status === "rejected"),
    ).toHaveLength(1);
    await expect(
      prisma.cobranca.count({ where: { pacienteId: paciente.id } }),
    ).resolves.toBe(1);
    await expect(
      prisma.cobrancaSessao.count({
        where: { cobranca: { pacienteId: paciente.id } },
      }),
    ).resolves.toBe(2);
  });

  it("aplica a unicidade de evolução entre cobranças", async () => {
    const paciente = await criarPacienteDeTeste(prisma, {
      nome: "Paciente para restrição única",
    });
    const evolucao = await criarEvolucaoDeTeste(
      prisma,
      paciente.id,
      "2026-09-18",
      "09:00",
    );
    await gerarCobranca(paciente.id, prisma);

    await expect(
      prisma.cobranca.create({
        data: {
          pacienteId: paciente.id,
          valorUnitarioSnapshot: "100.00",
          valorTotalSnapshot: "100.00",
          sessoes: { create: { evolucaoId: evolucao.id } },
        },
      }),
    ).rejects.toMatchObject({ code: "P2002" });
    await expect(
      prisma.cobranca.count({ where: { pacienteId: paciente.id } }),
    ).resolves.toBe(1);
  });

  it("mantém status e data consistentes ao pagar e reabrir", async () => {
    const paciente = await criarPacienteDeTeste(prisma, {
      nome: "Paciente para pagamento",
    });
    await criarEvolucaoDeTeste(prisma, paciente.id, "2026-09-18", "09:00");
    const cobranca = await gerarCobranca(paciente.id, prisma);

    await atualizarStatusCobranca(
      {
        cobrancaId: cobranca.id,
        dataPagamento: "2026-09-20",
        pacienteId: paciente.id,
        status: "PAGA",
      },
      prisma,
    );
    await expect(
      prisma.cobranca.findUniqueOrThrow({ where: { id: cobranca.id } }),
    ).resolves.toMatchObject({
      status: "PAGA",
      dataPagamento: new Date("2026-09-20T00:00:00.000Z"),
    });

    await atualizarStatusCobranca(
      {
        cobrancaId: cobranca.id,
        pacienteId: paciente.id,
        status: "PENDENTE",
      },
      prisma,
    );
    await expect(
      prisma.cobranca.findUniqueOrThrow({ where: { id: cobranca.id } }),
    ).resolves.toMatchObject({ status: "PENDENTE", dataPagamento: null });
  });

  it("bloqueia evolução cobrada e a libera ao excluir a cobrança", async () => {
    const paciente = await criarPacienteDeTeste(prisma, {
      nome: "Paciente para liberar sessão",
    });
    const evolucao = await criarEvolucaoDeTeste(
      prisma,
      paciente.id,
      "2026-09-18",
      "09:00",
    );
    const cobranca = await gerarCobranca(paciente.id, prisma);

    await expect(
      excluirEvolucao(paciente.id, evolucao.id, prisma),
    ).resolves.toBe("billed");
    await expect(
      excluirCobranca(paciente.id, cobranca.id, prisma),
    ).resolves.toBe("deleted");
    await expect(
      prisma.cobrancaSessao.count({ where: { evolucaoId: evolucao.id } }),
    ).resolves.toBe(0);
    await expect(
      excluirEvolucao(paciente.id, evolucao.id, prisma),
    ).resolves.toBe("deleted");
  });

  it("exclui paciente com cobranças na ordem transacional correta", async () => {
    const paciente = await criarPacienteDeTeste(prisma, {
      nome: "Paciente com agregado financeiro",
    });
    await criarEvolucaoDeTeste(prisma, paciente.id, "2026-09-18", "09:00");
    await gerarCobranca(paciente.id, prisma);

    await expect(excluirPacientePorId(paciente.id, prisma)).resolves.toBe(
      "deleted",
    );
    await expect(
      prisma.cobranca.count({ where: { pacienteId: paciente.id } }),
    ).resolves.toBe(0);
    await expect(
      prisma.evolucao.count({ where: { pacienteId: paciente.id } }),
    ).resolves.toBe(0);
  });

  it("mantém cobranças e sessões isoladas entre pacientes", async () => {
    const primeiro = await criarPacienteDeTeste(prisma, {
      nome: "Financeiro isolado A",
      valorSessao: "80.00",
    });
    const segundo = await criarPacienteDeTeste(prisma, {
      nome: "Financeiro isolado B",
      valorSessao: "150.00",
    });
    await criarEvolucaoDeTeste(prisma, primeiro.id, "2026-09-18", "09:00");
    await criarEvolucaoDeTeste(prisma, segundo.id, "2026-09-19", "10:00");
    const cobrancaPrimeiro = await gerarCobranca(primeiro.id, prisma);
    const cobrancaSegundo = await gerarCobranca(segundo.id, prisma);

    const financeiroPrimeiro = await obterFinanceiroPaciente(
      primeiro.id,
      prisma,
    );
    expect(financeiroPrimeiro?.cobrancas.map(({ id }) => id)).toEqual([
      cobrancaPrimeiro.id,
    ]);
    expect(financeiroPrimeiro?.cobrancas).not.toContainEqual(
      expect.objectContaining({ id: cobrancaSegundo.id }),
    );
  });

  it("atualiza totais gerais após pagar, reabrir e excluir", async () => {
    const paciente = await criarPacienteDeTeste(prisma, {
      nome: "Fluxo financeiro geral",
      valorSessao: "100.00",
    });
    await criarEvolucaoDeTeste(prisma, paciente.id, "2026-09-18", "09:00");
    await criarEvolucaoDeTeste(prisma, paciente.id, "2026-09-19", "09:00");
    const cobranca = await gerarCobranca(paciente.id, prisma);

    let cobrancas = await listarCobrancasGerais(prisma);
    let resumo = calcularResumoFinanceiro(
      cobrancas.filter(({ pacienteId }) => pacienteId === paciente.id),
      "2026-09-20",
    );
    expect(resumo.aReceber.toFixed(2)).toBe("200.00");
    expect(resumo.recebidoNoMes.toFixed(2)).toBe("0.00");

    await atualizarStatusCobranca(
      {
        cobrancaId: cobranca.id,
        dataPagamento: "2026-09-20",
        pacienteId: paciente.id,
        status: "PAGA",
      },
      prisma,
    );
    cobrancas = await listarCobrancasGerais(prisma);
    const cobrancasPaciente = cobrancas.filter(
      ({ pacienteId }) => pacienteId === paciente.id,
    );
    expect(cobrancasPaciente).toHaveLength(1);
    expect(cobrancasPaciente[0].status).toBe("PAGA");
    resumo = calcularResumoFinanceiro(cobrancasPaciente, "2026-09-20");
    expect(resumo.aReceber.toFixed(2)).toBe("0.00");
    expect(resumo.recebidoNoMes.toFixed(2)).toBe("200.00");

    await atualizarStatusCobranca(
      {
        cobrancaId: cobranca.id,
        pacienteId: paciente.id,
        status: "PENDENTE",
      },
      prisma,
    );
    cobrancas = await listarCobrancasGerais(prisma);
    resumo = calcularResumoFinanceiro(
      cobrancas.filter(({ pacienteId }) => pacienteId === paciente.id),
      "2026-09-20",
    );
    expect(resumo.aReceber.toFixed(2)).toBe("200.00");
    expect(resumo.recebidoNoMes.toFixed(2)).toBe("0.00");

    await excluirCobranca(paciente.id, cobranca.id, prisma);
    const financeiro = await obterFinanceiroPaciente(paciente.id, prisma);
    expect(financeiro?.cobrancas).toHaveLength(0);
    expect(financeiro?.evolucoes).toHaveLength(2);
  });

  it("verifica sessões livres no servidor e persiste status e data juntos", async () => {
    const paciente = await criarPacienteDeTeste(prisma, {
      nome: "Paciente para alta",
    });
    await criarEvolucaoDeTeste(prisma, paciente.id, "2026-09-20", "09:00");

    await expect(
      concluirAlta(
        {
          pacienteId: paciente.id,
          dataAlta: "2026-09-20",
          confirmarSessoesNaoCobradas: false,
        },
        prisma,
      ),
    ).resolves.toEqual({ status: "unbilled_sessions", count: 1 });
    await expect(
      prisma.paciente.findUniqueOrThrow({ where: { id: paciente.id } }),
    ).resolves.toMatchObject({ status: "EM_TRATAMENTO", dataAlta: null });

    await expect(
      concluirAlta(
        {
          pacienteId: paciente.id,
          dataAlta: "2026-09-20",
          confirmarSessoesNaoCobradas: true,
        },
        prisma,
      ),
    ).resolves.toEqual({ status: "completed" });
    await expect(
      prisma.paciente.findUniqueOrThrow({ where: { id: paciente.id } }),
    ).resolves.toMatchObject({
      status: "ALTA",
      dataAlta: new Date("2026-09-20T00:00:00.000Z"),
    });
  });

  it("permite gerar cobrança antes da alta e preserva seus vínculos", async () => {
    const paciente = await criarPacienteDeTeste(prisma, {
      nome: "Paciente que cobra antes da alta",
    });
    await criarEvolucaoDeTeste(prisma, paciente.id, "2026-09-21", "09:00");
    const cobranca = await gerarCobranca(paciente.id, prisma);

    await expect(
      concluirAlta(
        {
          pacienteId: paciente.id,
          dataAlta: "2026-09-21",
          confirmarSessoesNaoCobradas: false,
        },
        prisma,
      ),
    ).resolves.toEqual({ status: "completed" });
    await expect(
      prisma.cobrancaSessao.count({ where: { cobrancaId: cobranca.id } }),
    ).resolves.toBe(1);
  });

  it("calcula indicadores e limita o dashboard aos cinco atendimentos recentes", async () => {
    const antes = await obterDashboard("2030-02-15", prisma);
    const ativo = await criarPacienteDeTeste(prisma, {
      nome: "Dashboard ativo",
    });
    const pago = await criarPacienteDeTeste(prisma, {
      nome: "Dashboard recebido",
    });

    for (let dia = 1; dia <= 6; dia += 1) {
      await criarEvolucaoDeTeste(
        prisma,
        ativo.id,
        `2030-02-${String(dia).padStart(2, "0")}`,
        "09:00",
      );
    }
    await criarEvolucaoDeTeste(prisma, pago.id, "2030-02-07", "10:00");
    await gerarCobranca(ativo.id, prisma);
    const cobrancaPaga = await gerarCobranca(pago.id, prisma);
    await atualizarStatusCobranca(
      {
        cobrancaId: cobrancaPaga.id,
        dataPagamento: "2030-02-15",
        pacienteId: pago.id,
        status: "PAGA",
      },
      prisma,
    );

    const depois = await obterDashboard("2030-02-15", prisma);
    expect(depois.pacientesEmTratamento - antes.pacientesEmTratamento).toBe(2);
    expect(depois.atendimentosNoMes - antes.atendimentosNoMes).toBe(7);
    expect(depois.aReceber.sub(antes.aReceber).toFixed(2)).toBe("600.00");
    expect(depois.recebidoNoMes.sub(antes.recebidoNoMes).toFixed(2)).toBe(
      "100.00",
    );
    expect(depois.recentes).toHaveLength(5);
    expect(depois.recentes[0].paciente.id).toBe(pago.id);
    expect(
      depois.recentes.map(({ data }) => data.toISOString().slice(0, 10)),
    ).toEqual([
      "2030-02-07",
      "2030-02-06",
      "2030-02-05",
      "2030-02-04",
      "2030-02-03",
    ]);
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

function criarEvolucaoDeTeste(
  prisma: PrismaClient,
  pacienteId: string,
  data: string,
  horario: string,
) {
  return prisma.evolucao.create({
    data: {
      pacienteId,
      data: new Date(`${data}T00:00:00.000Z`),
      horario: new Date(`1970-01-01T${horario}:00.000Z`),
      conteudoMarkdown: `Sessão de ${data} às ${horario}`,
    },
  });
}
