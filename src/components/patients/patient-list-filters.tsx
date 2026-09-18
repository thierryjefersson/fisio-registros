import Form from "next/form";
import Link from "next/link";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  patientListUrl,
  type FiltroPacientes,
  type PatientListParams,
} from "@/features/patients/list-params";

const filtros: { label: string; value: FiltroPacientes }[] = [
  { label: "Em tratamento", value: "em-tratamento" },
  { label: "Alta", value: "alta" },
  { label: "Todos", value: "todos" },
];

export function PatientListFilters({ busca, filtro }: PatientListParams) {
  return (
    <div className="grid gap-4 rounded-xl border border-border bg-card p-4 shadow-sm lg:grid-cols-[minmax(16rem,1fr)_auto] lg:items-end">
      <Form action="/pacientes" className="flex flex-col gap-2 sm:flex-row">
        <label className="flex-1 text-sm font-medium" htmlFor="busca-paciente">
          Buscar por nome
          <Input
            className="mt-2 min-h-11"
            defaultValue={busca}
            id="busca-paciente"
            key={busca}
            name="busca"
            placeholder="Digite o nome do paciente"
            type="search"
          />
        </label>
        {filtro !== "em-tratamento" ? (
          <input name="filtro" type="hidden" value={filtro} />
        ) : null}
        <div className="flex gap-2 sm:items-end">
          <Button className="min-h-11 px-4" type="submit">
            <Search aria-hidden="true" />
            Buscar
          </Button>
          {busca ? (
            <Button
              className="min-h-11 px-4"
              nativeButton={false}
              render={
                <Link href={patientListUrl({ busca: "", filtro })}>Limpar</Link>
              }
              variant="outline"
            />
          ) : null}
        </div>
      </Form>

      <nav aria-label="Filtrar pacientes por status" className="flex gap-1">
        {filtros.map((item) => (
          <Link
            aria-current={filtro === item.value ? "page" : undefined}
            className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground aria-[current=page]:bg-secondary aria-[current=page]:text-secondary-foreground"
            href={patientListUrl({ busca, filtro: item.value })}
            key={item.value}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
