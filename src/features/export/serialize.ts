import type { PacienteParaExportacao } from "./data";

export const EXPORT_SCHEMA_VERSION = 1 as const;
export const EXPORT_TIME_ZONE = "America/Fortaleza";

function dataCivil(data: Date | null) {
  return data ? data.toISOString().slice(0, 10) : null;
}

function horarioCivil(data: Date) {
  return data.toISOString().slice(11, 19);
}

function instante(data: Date) {
  return data.toISOString();
}

export function serializarExportacao(
  pacientes: readonly PacienteParaExportacao[],
  exportedAt: Date,
) {
  return {
    schemaVersion: EXPORT_SCHEMA_VERSION,
    exportedAt: instante(exportedAt),
    data: {
      pacientes: pacientes.map((paciente) => ({
        id: paciente.id,
        nome: paciente.nome,
        dataNascimento: dataCivil(paciente.dataNascimento),
        sexo: paciente.sexo,
        telefone: paciente.telefone,
        endereco: paciente.endereco,
        nomeResponsavel: paciente.nomeResponsavel,
        patologia: paciente.patologia,
        queixaPrincipal: paciente.queixaPrincipal,
        valorSessao: paciente.valorSessao.toFixed(2),
        dataInicio: dataCivil(paciente.dataInicio),
        previsaoSessoes: paciente.previsaoSessoes,
        diasAtendimento: paciente.diasAtendimento,
        status: paciente.status,
        dataAlta: dataCivil(paciente.dataAlta),
        createdAt: instante(paciente.createdAt),
        updatedAt: instante(paciente.updatedAt),
        avaliacoes: paciente.avaliacoes.map((avaliacao) => ({
          id: avaliacao.id,
          pacienteId: avaliacao.pacienteId,
          tipo: avaliacao.tipo,
          data: dataCivil(avaliacao.data),
          conteudoMarkdown: avaliacao.conteudoMarkdown,
          createdAt: instante(avaliacao.createdAt),
          updatedAt: instante(avaliacao.updatedAt),
        })),
        planoTerapeutico: paciente.planoTerapeutico
          ? {
              id: paciente.planoTerapeutico.id,
              pacienteId: paciente.planoTerapeutico.pacienteId,
              objetivosMarkdown: paciente.planoTerapeutico.objetivosMarkdown,
              condutasMarkdown: paciente.planoTerapeutico.condutasMarkdown,
              createdAt: instante(paciente.planoTerapeutico.createdAt),
              updatedAt: instante(paciente.planoTerapeutico.updatedAt),
            }
          : null,
        evolucoes: paciente.evolucoes.map((evolucao) => ({
          id: evolucao.id,
          pacienteId: evolucao.pacienteId,
          data: dataCivil(evolucao.data),
          horario: horarioCivil(evolucao.horario),
          conteudoMarkdown: evolucao.conteudoMarkdown,
          createdAt: instante(evolucao.createdAt),
          updatedAt: instante(evolucao.updatedAt),
        })),
        cobrancas: paciente.cobrancas.map((cobranca) => ({
          id: cobranca.id,
          pacienteId: cobranca.pacienteId,
          status: cobranca.status,
          valorUnitarioSnapshot: cobranca.valorUnitarioSnapshot.toFixed(2),
          valorTotalSnapshot: cobranca.valorTotalSnapshot.toFixed(2),
          dataPagamento: dataCivil(cobranca.dataPagamento),
          createdAt: instante(cobranca.createdAt),
          updatedAt: instante(cobranca.updatedAt),
          sessoes: cobranca.sessoes.map((sessao) => ({
            id: sessao.id,
            cobrancaId: sessao.cobrancaId,
            evolucaoId: sessao.evolucaoId,
            createdAt: instante(sessao.createdAt),
          })),
        })),
      })),
    },
  };
}

export type BackupExportacao = ReturnType<typeof serializarExportacao>;

export function criarNomeArquivoExportacao(instanteAtual: Date) {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: EXPORT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instanteAtual);
  const valores = Object.fromEntries(
    partes
      .filter(({ type }) => type !== "literal")
      .map(({ type, value }) => [type, value]),
  );

  return `fisio-backup-${valores.year}-${valores.month}-${valores.day}-${valores.hour}${valores.minute}${valores.second}.json`;
}

export function criarRespostaExportacao(
  backup: BackupExportacao,
  nomeArquivo: string,
) {
  return new Response(`${JSON.stringify(backup, null, 2)}\n`, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="${nomeArquivo}"`,
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
