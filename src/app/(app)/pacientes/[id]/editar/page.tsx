import Link from "next/link";
import { notFound } from "next/navigation";

import { PatientForm } from "@/components/patients/patient-form";
import { atualizarPaciente } from "@/features/patients/actions";
import { obterPaciente } from "@/features/patients/queries";

export default async function EditPatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const paciente = await obterPaciente(id);
  if (!paciente) notFound();

  return (
    <section aria-labelledby="page-title">
      <div className="mb-8">
        <Link
          className="text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href={`/pacientes/${paciente.id}`}
        >
          ← Voltar para o resumo
        </Link>
        <h1
          className="mt-4 text-2xl font-semibold tracking-tight"
          id="page-title"
        >
          Editar tratamento
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Atualize os dados cadastrais de {paciente.nome}.
        </p>
      </div>
      <PatientForm
        action={atualizarPaciente}
        defaultValues={{
          dataInicio: paciente.dataInicio.toISOString().slice(0, 10),
          dataNascimento: paciente.dataNascimento.toISOString().slice(0, 10),
          diasAtendimento: paciente.diasAtendimento,
          endereco: paciente.endereco,
          id: paciente.id,
          nome: paciente.nome,
          nomeResponsavel: paciente.nomeResponsavel,
          patologia: paciente.patologia,
          previsaoSessoes: String(paciente.previsaoSessoes),
          queixaPrincipal: paciente.queixaPrincipal,
          sexo: paciente.sexo,
          telefone: paciente.telefone,
          valorSessao: paciente.valorSessao.toString(),
        }}
        submitLabel="Salvar alterações"
      />
    </section>
  );
}
