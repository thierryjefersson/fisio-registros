import Link from "next/link";
import { notFound } from "next/navigation";

import { AssessmentForm } from "@/components/clinical/clinical-document-form";
import { SuccessToast } from "@/components/feedback/success-toast";
import { salvarAvaliacaoAction } from "@/features/clinical-documents/actions";
import { obterAvaliacaoInicial } from "@/features/clinical-documents/queries";
import { obterPaciente } from "@/features/patients/queries";

export default async function AssessmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ salvo?: string }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const [paciente, avaliacao] = await Promise.all([
    obterPaciente(id),
    obterAvaliacaoInicial(id),
  ]);
  if (!paciente) notFound();

  return (
    <section aria-labelledby="page-title">
      {resolvedSearchParams.salvo === "1" ? (
        <SuccessToast message="Avaliação salva com sucesso." />
      ) : null}
      <header className="mb-6">
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
          Avaliação inicial
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Registre a avaliação clínica de {paciente.nome}. O conteúdo é salvo em
          Markdown.
        </p>
      </header>
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <AssessmentForm
          action={salvarAvaliacaoAction}
          initialMarkdown={avaliacao?.conteudoMarkdown ?? ""}
          patientId={paciente.id}
        />
      </div>
    </section>
  );
}
