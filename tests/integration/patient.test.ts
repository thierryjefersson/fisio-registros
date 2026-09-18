import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { PrismaPg } from "@prisma/adapter-pg";
import { GenericContainer, type StartedTestContainer } from "testcontainers";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { DiaSemana } from "@/generated/prisma/client";
import { PrismaClient } from "@/generated/prisma/client";

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
});
