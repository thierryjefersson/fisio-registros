import Link from "next/link";
import { notFound } from "next/navigation";

import { EvolutionForm } from "@/components/evolutions/evolution-form";
import { criarEvolucaoAction } from "@/features/evolutions/actions";
import { obterPaciente } from "@/features/patients/queries";

export default async function NewEvolutionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const paciente = await obterPaciente(id);
  if (!paciente) notFound();

  return (
    <section aria-labelledby="page-title">
      <header className="mb-8">
        <Link
          className="text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href={`/pacientes/${paciente.id}/evolucoes`}
        >
          ← Voltar para evoluções
        </Link>
        <h1
          className="mt-4 text-2xl font-semibold tracking-tight"
          id="page-title"
        >
          Nova evolução
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Registre uma sessão realizada por {paciente.nome}.
        </p>
      </header>
      <EvolutionForm
        action={criarEvolucaoAction}
        patientId={paciente.id}
        submitLabel="Salvar evolução"
      />
    </section>
  );
}
