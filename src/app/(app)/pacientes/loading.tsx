export default function PatientsLoading() {
  return (
    <section aria-busy="true" aria-label="Carregando pacientes">
      <div className="h-8 w-40 animate-pulse rounded bg-muted" />
      <div className="mt-8 h-28 animate-pulse rounded-xl bg-muted" />
      <div className="mt-6 h-64 animate-pulse rounded-xl bg-muted" />
    </section>
  );
}
