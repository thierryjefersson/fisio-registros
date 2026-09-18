import Link from "next/link";

import { DeletePatientDialog } from "@/components/patients/delete-patient-dialog";
import { PatientListFilters } from "@/components/patients/patient-list-filters";
import { Button } from "@/components/ui/button";
import { excluirPacienteAction } from "@/features/patients/actions";
import { parsePatientListParams } from "@/features/patients/list-params";
import { toPatientListItem } from "@/features/patients/list-view-model";
import { listarPacientes } from "@/features/patients/queries";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const rawSearchParams = await searchParams;
  const params = parsePatientListParams(rawSearchParams);
  const pacientes = (await listarPacientes(params)).map(toPatientListItem);
  const excluido = rawSearchParams.excluido === "1";
  const erro = Array.isArray(rawSearchParams.erro)
    ? rawSearchParams.erro[0]
    : rawSearchParams.erro;

  return (
    <section aria-labelledby="page-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight" id="page-title">
            Pacientes
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Localize e administre os tratamentos cadastrados.
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

      {excluido ? (
        <p
          className="mt-6 rounded-lg border border-primary/30 bg-secondary px-4 py-3 text-sm text-secondary-foreground"
          role="status"
        >
          Tratamento excluído com sucesso.
        </p>
      ) : null}
      {erro ? (
        <p
          className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {erro === "nao-encontrado"
            ? "O tratamento informado não foi encontrado."
            : "Não foi possível excluir o tratamento. Tente novamente."}
        </p>
      ) : null}

      <div className="mt-8">
        <PatientListFilters {...params} />
      </div>

      {pacientes.length === 0 ? (
        <EmptyPatients busca={params.busca} filtro={params.filtro} />
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="border-b border-border bg-muted/60 text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium" scope="col">
                  Paciente
                </th>
                <th className="px-4 py-3 font-medium" scope="col">
                  Patologia
                </th>
                <th className="px-4 py-3 font-medium" scope="col">
                  Frequência
                </th>
                <th className="px-4 py-3 font-medium" scope="col">
                  Valor
                </th>
                <th className="px-4 py-3 font-medium" scope="col">
                  Status
                </th>
                <th className="px-4 py-3 text-right font-medium" scope="col">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pacientes.map((paciente) => (
                <tr
                  className="align-middle hover:bg-muted/30"
                  key={paciente.id}
                >
                  <td className="px-4 py-4 font-semibold">
                    <Link
                      className="text-foreground hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      href={`/pacientes/${paciente.id}`}
                    >
                      {paciente.nome}
                    </Link>
                  </td>
                  <td className="max-w-64 px-4 py-4 text-muted-foreground">
                    <span className="line-clamp-2">{paciente.patologia}</span>
                  </td>
                  <td className="px-4 py-4">{paciente.frequencia}</td>
                  <td className="px-4 py-4 tabular-nums">{paciente.valor}</td>
                  <td className="px-4 py-4">
                    <span
                      className={
                        paciente.status === "ALTA"
                          ? "inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                          : "inline-flex rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                      }
                    >
                      {paciente.statusLabel}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        className="min-h-10"
                        nativeButton={false}
                        render={
                          <Link href={`/pacientes/${paciente.id}/editar`} />
                        }
                        variant="outline"
                      >
                        Editar
                      </Button>
                      <DeletePatientDialog
                        action={excluirPacienteAction}
                        compact
                        id={paciente.id}
                        name={paciente.nome}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function EmptyPatients({
  busca,
  filtro,
}: {
  busca: string;
  filtro: "em-tratamento" | "alta" | "todos";
}) {
  const temConsulta = Boolean(busca) || filtro !== "em-tratamento";
  return (
    <div className="mt-6 rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
      <h2 className="font-semibold">
        {temConsulta
          ? "Nenhum tratamento encontrado"
          : "Nenhum paciente em tratamento"}
      </h2>
      <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
        {temConsulta
          ? "Ajuste a busca ou o filtro para encontrar outros tratamentos."
          : "Cadastre o primeiro tratamento para começar a organizar seus registros."}
      </p>
      {temConsulta ? (
        <Link
          className="mt-5 inline-flex min-h-11 items-center rounded-lg px-4 text-sm font-semibold text-primary hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href="/pacientes"
        >
          Limpar busca e filtros
        </Link>
      ) : null}
    </div>
  );
}
