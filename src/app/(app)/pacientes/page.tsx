import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function PatientsPage() {
  return (
    <section aria-labelledby="page-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" id="page-title">
            Pacientes
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Cadastre um tratamento para começar a organizar seus registros.
          </p>
        </div>
        <Button
          className="min-h-11 px-5"
          nativeButton={false}
          render={<Link href="/pacientes/novo" />}
          size="lg"
        >
          Novo paciente
        </Button>
      </div>
      <div className="mt-8 rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          A listagem e a busca serão adicionadas na próxima etapa.
        </p>
      </div>
    </section>
  );
}
