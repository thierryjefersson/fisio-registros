import { describe, expect, it } from "vitest";

import {
  calcularFrequenciaSemanal,
  normalizarTelefone,
  normalizarValorMonetario,
  pacienteSchema,
} from "./schemas";

const dadosValidos = {
  nome: "  Ana da Silva  ",
  dataNascimento: "1990-02-03",
  sexo: "FEMININO" as const,
  telefone: "85999990000",
  endereco: "Rua das Flores, 10",
  nomeResponsavel: "   ",
  patologia: "Lombalgia",
  queixaPrincipal: "Dor lombar",
  valorSessao: "R$ 1.234,56",
  dataInicio: "2026-09-01",
  previsaoSessoes: "10",
  diasAtendimento: ["SEGUNDA", "QUARTA"] as const,
};

describe("pacienteSchema", () => {
  it("exige os campos cadastrais obrigatórios", () => {
    const resultado = pacienteSchema.safeParse({
      ...dadosValidos,
      nome: "",
      dataNascimento: "",
      telefone: "",
      endereco: "",
      patologia: "",
      queixaPrincipal: "",
    });

    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(resultado.error.issues.map((issue) => issue.path[0])).toEqual(
        expect.arrayContaining([
          "nome",
          "dataNascimento",
          "telefone",
          "endereco",
          "patologia",
          "queixaPrincipal",
        ]),
      );
    }
  });

  it("rejeita nascimento futuro", () => {
    const resultado = pacienteSchema.safeParse({
      ...dadosValidos,
      dataNascimento: "2999-01-01",
    });

    expect(resultado.success).toBe(false);
    if (!resultado.success) {
      expect(
        resultado.error.issues.some(
          (issue) => issue.path[0] === "dataNascimento",
        ),
      ).toBe(true);
    }
  });

  it.each(["0", "-1", "1.5"])(
    "rejeita previsão de sessões %s",
    (previsaoSessoes) => {
      expect(
        pacienteSchema.safeParse({ ...dadosValidos, previsaoSessoes }).success,
      ).toBe(false);
    },
  );

  it.each(["0", "-10", "10,999"])(
    "rejeita valor por sessão %s",
    (valorSessao) => {
      expect(
        pacienteSchema.safeParse({ ...dadosValidos, valorSessao }).success,
      ).toBe(false);
    },
  );

  it("normaliza responsável vazio para null", () => {
    const resultado = pacienteSchema.safeParse(dadosValidos);

    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data.nome).toBe("Ana da Silva");
      expect(resultado.data.nomeResponsavel).toBeNull();
      expect(resultado.data.valorSessao).toBe("1234.56");
      expect(resultado.data.previsaoSessoes).toBe(10);
    }
  });

  it("normaliza telefone mascarado para somente dígitos", () => {
    const resultado = pacienteSchema.safeParse({
      ...dadosValidos,
      telefone: "(85) 99999-0000",
    });

    expect(resultado.success).toBe(true);
    if (resultado.success) expect(resultado.data.telefone).toBe("85999990000");
    expect(normalizarTelefone("(85) 3333-4444")).toBe("8533334444");
  });

  it("rejeita dias vazios e aceita somente dias únicos", () => {
    expect(
      pacienteSchema.safeParse({ ...dadosValidos, diasAtendimento: [] })
        .success,
    ).toBe(false);
    expect(
      pacienteSchema.safeParse({
        ...dadosValidos,
        diasAtendimento: ["SEGUNDA", "SEGUNDA"],
      }).success,
    ).toBe(false);
  });
});

describe("regras derivadas do paciente", () => {
  it("calcula a frequência a partir dos dias únicos selecionados", () => {
    expect(calcularFrequenciaSemanal(["SEGUNDA", "SEGUNDA", "QUARTA"])).toBe(2);
  });

  it("normaliza moeda pt-BR para decimal sem usar ponto flutuante", () => {
    expect(normalizarValorMonetario("R$ 1.234,50")).toBe("1234.50");
    expect(normalizarValorMonetario("0,10")).toBe("0.10");
  });
});
