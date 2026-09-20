import Link from "next/link";
import { notFound } from "next/navigation";

import { CopyContentActions } from "@/components/clinical/copy-content-actions";
import { MarkdownViewer } from "@/components/clinical/markdown-viewer";
import { DeleteEvolutionDialog } from "@/components/evolutions/delete-evolution-dialog";
import { SuccessToast } from "@/components/feedback/success-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { excluirEvolucaoAction } from "@/features/evolutions/actions";
import { listarEvolucoes } from "@/features/evolutions/queries";
import { obterPaciente } from "@/features/patients/queries";
import { dateParaHorarioCivil, formatarDataCivil } from "@/lib/dates";

export default async function EvolutionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    erro?: string;
    excluido?: string;
    salvo?: string;
  }>;
}) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const [paciente, evolucoes] = await Promise.all([
    obterPaciente(id),
    listarEvolucoes(id),
  ]);
  if (!paciente) notFound();

  return (
    <section aria-labelledby="page-title">
      {query.salvo === "1" ? (
        <SuccessToast message="Evolução salva com sucesso." />
      ) : null}
      {query.excluido === "1" ? (
        <SuccessToast message="Evolução excluída com sucesso." />
      ) : null}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            className="text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href="/pacientes"
          >
            ← Voltar para pacientes
          </Link>
          <h1
            className="mt-4 text-2xl font-semibold tracking-tight"
            id="page-title"
          >
            Evoluções
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sessões realizadas por {paciente.nome}, da mais recente para a mais
            antiga.
          </p>
        </div>
        <Button
          className="min-h-11 px-5"
          nativeButton={false}
          render={<Link href={`/pacientes/${paciente.id}/evolucoes/nova`} />}
        >
          Nova evolução
        </Button>
      </header>

      {query.erro ? (
        <p
          aria-live="polite"
          className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {query.erro === "sessao-cobrada"
            ? "Esta evolução já pertence a uma cobrança. Exclua a cobrança antes de remover a evolução."
            : "Não foi possível concluir a exclusão da evolução."}
        </p>
      ) : null}

      {evolucoes.length === 0 ? (
        <Card className="mt-8 items-center border-dashed px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhuma sessão foi registrada para este tratamento.
          </p>
          <Button
            className="min-h-11 px-5"
            nativeButton={false}
            render={<Link href={`/pacientes/${paciente.id}/evolucoes/nova`} />}
          >
            Registrar primeira evolução
          </Button>
        </Card>
      ) : (
        <div className="mt-8 space-y-5">
          {evolucoes.map((evolucao) => (
            <Card className="gap-0 py-0" key={evolucao.id}>
              <CardHeader className="flex-row flex-wrap items-start justify-between gap-3 border-b border-border py-5">
                <div>
                  <CardTitle>
                    {formatarDataCivil(
                      evolucao.data.toISOString().slice(0, 10),
                    )}
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {dateParaHorarioCivil(evolucao.horario)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    nativeButton={false}
                    render={
                      <Link
                        href={`/pacientes/${paciente.id}/evolucoes/${evolucao.id}/editar`}
                      />
                    }
                    variant="outline"
                  >
                    Editar
                  </Button>
                  <DeleteEvolutionDialog
                    action={excluirEvolucaoAction}
                    evolutionId={evolucao.id}
                    patientId={paciente.id}
                  />
                </div>
              </CardHeader>
              <CardContent className="py-5">
                <MarkdownViewer markdown={evolucao.conteudoMarkdown} />
              </CardContent>
              <CardFooter className="pb-5">
                <CopyContentActions markdown={evolucao.conteudoMarkdown} />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
