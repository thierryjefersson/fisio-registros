import Link from "next/link";
import { notFound } from "next/navigation";

import { EvolutionForm } from "@/components/evolutions/evolution-form";
import { atualizarEvolucaoAction } from "@/features/evolutions/actions";
import { obterEvolucao } from "@/features/evolutions/queries";
import { obterPaciente } from "@/features/patients/queries";
import { dateParaHorarioCivil } from "@/lib/dates";

export default async function EditEvolutionPage({
  params,
}: {
  params: Promise<{ id: string; evolucaoId: string }>;
}) {
  const { id, evolucaoId } = await params;
  const [paciente, evolucao] = await Promise.all([
    obterPaciente(id),
    obterEvolucao(id, evolucaoId),
  ]);
  if (!paciente || !evolucao) notFound();

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
          Editar evolução
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Atualize o registro da sessão de {paciente.nome}.
        </p>
      </header>
      <EvolutionForm
        action={atualizarEvolucaoAction}
        defaultValues={{
          conteudoMarkdown: evolucao.conteudoMarkdown,
          data: evolucao.data.toISOString().slice(0, 10),
          evolucaoId: evolucao.id,
          horario: dateParaHorarioCivil(evolucao.horario),
        }}
        patientId={paciente.id}
        submitLabel="Salvar alterações"
      />
    </section>
  );
}
