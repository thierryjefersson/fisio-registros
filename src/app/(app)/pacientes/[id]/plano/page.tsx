import Link from "next/link";
import { notFound } from "next/navigation";

import { TreatmentPlanForm } from "@/components/clinical/clinical-document-form";
import { SuccessToast } from "@/components/feedback/success-toast";
import { salvarPlanoAction } from "@/features/clinical-documents/actions";
import { obterPlanoTerapeutico } from "@/features/clinical-documents/queries";
import { obterPaciente } from "@/features/patients/queries";

export default async function TreatmentPlanPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ salvo?: string }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const [paciente, plano] = await Promise.all([
    obterPaciente(id),
    obterPlanoTerapeutico(id),
  ]);
  if (!paciente) notFound();

  return (
    <section aria-labelledby="page-title">
      {resolvedSearchParams.salvo === "1" ? (
        <SuccessToast message="Plano terapêutico salvo com sucesso." />
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
          Plano terapêutico
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Defina objetivos e condutas independentes para {paciente.nome}.
        </p>
      </header>
      <TreatmentPlanForm
        action={salvarPlanoAction}
        initialConducts={plano?.condutasMarkdown ?? ""}
        initialObjectives={plano?.objetivosMarkdown ?? ""}
        patientId={paciente.id}
      />
    </section>
  );
}
