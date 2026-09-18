import Link from "next/link";

import { PatientForm } from "@/components/patients/patient-form";
import { Button } from "@/components/ui/button";
import { criarPaciente } from "@/features/patients/actions";

export default function NewPatientPage() {
  return (
    <section aria-labelledby="page-title">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
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
            Novo paciente
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Cadastre os dados do tratamento. Campos marcados são obrigatórios.
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/pacientes" />}
          variant="outline"
        >
          Cancelar
        </Button>
      </div>
      <PatientForm action={criarPaciente} submitLabel="Cadastrar tratamento" />
    </section>
  );
}
