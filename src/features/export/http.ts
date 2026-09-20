import { criarExportacao } from "./service";
import {
  criarNomeArquivoExportacao,
  criarRespostaExportacao,
} from "./serialize";

type ExportLoader = typeof criarExportacao;

export async function responderExportacao(
  carregar: ExportLoader = criarExportacao,
  agora: () => Date = () => new Date(),
) {
  const exportedAt = agora();

  try {
    const backup = await carregar(exportedAt);
    return criarRespostaExportacao(
      backup,
      criarNomeArquivoExportacao(exportedAt),
    );
  } catch {
    return Response.json(
      { error: "Não foi possível exportar os dados." },
      {
        status: 500,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
