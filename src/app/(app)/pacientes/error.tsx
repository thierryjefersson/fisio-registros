"use client";

import { Button } from "@/components/ui/button";

export default function PatientsError({ reset }: { reset: () => void }) {
  return (
    <section aria-labelledby="patients-error-title">
      <div className="rounded-xl border border-destructive/30 bg-card px-6 py-12 text-center shadow-sm">
        <h1 className="text-xl font-semibold" id="patients-error-title">
          Não foi possível carregar os pacientes
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Houve um problema ao consultar os tratamentos. Tente novamente.
        </p>
        <Button className="mt-5 min-h-11 px-5" onClick={reset}>
          Tentar novamente
        </Button>
      </div>
    </section>
  );
}
