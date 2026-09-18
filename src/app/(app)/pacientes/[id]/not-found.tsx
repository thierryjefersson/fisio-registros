import Link from "next/link";

export default function PatientNotFound() {
  return (
    <section aria-labelledby="patient-not-found-title">
      <div className="rounded-xl border border-border bg-card px-6 py-12 text-center shadow-sm">
        <h1 className="text-xl font-semibold" id="patient-not-found-title">
          Tratamento não encontrado
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Este tratamento não existe ou já foi excluído.
        </p>
        <Link
          className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href="/pacientes"
        >
          Voltar para pacientes
        </Link>
      </div>
    </section>
  );
}
