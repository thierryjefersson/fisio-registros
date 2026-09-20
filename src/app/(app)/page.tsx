import Link from "next/link";
import {
  BanknoteArrowDown,
  CalendarCheck2,
  CircleDollarSign,
  UsersRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { obterDashboard } from "@/features/dashboard/queries";
import {
  dateParaHorarioCivil,
  formatarDataCivil,
  hojeCivil,
} from "@/lib/dates";
import { formatarBRL } from "@/lib/formatters";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const dashboard = await obterDashboard(hojeCivil());
  const indicators = [
    {
      label: "Pacientes em tratamento",
      value: String(dashboard.pacientesEmTratamento),
      icon: UsersRound,
    },
    {
      label: "Atendimentos no mês",
      value: String(dashboard.atendimentosNoMes),
      icon: CalendarCheck2,
    },
    {
      label: "A receber",
      value: formatarBRL(dashboard.aReceber.toFixed(2)),
      icon: CircleDollarSign,
    },
    {
      label: "Recebido no mês",
      value: formatarBRL(dashboard.recebidoNoMes.toFixed(2)),
      icon: BanknoteArrowDown,
    },
  ];

  return (
    <section aria-labelledby="page-title">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight" id="page-title">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Visão geral dos tratamentos, atendimentos e recebimentos.
        </p>
      </header>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {indicators.map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <CardHeader className="flex items-center justify-between gap-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <span className="rounded-lg bg-primary/10 p-2 text-primary">
                <Icon aria-hidden className="size-5" />
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tracking-tight">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <section aria-labelledby="recent-title" className="mt-10">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold" id="recent-title">
            Atendimentos recentes
          </h2>
          <Badge variant="outline">{dashboard.recentes.length}</Badge>
        </div>
        {dashboard.recentes.length === 0 ? (
          <Card className="mt-5 border-dashed shadow-none">
            <CardContent className="text-center text-sm text-muted-foreground">
              Nenhum atendimento registrado ainda.
            </CardContent>
          </Card>
        ) : (
          <div className="mt-5 space-y-3">
            {dashboard.recentes.map((atendimento) => (
              <Card className="py-4" key={atendimento.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">{atendimento.paciente.nome}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatarDataCivil(
                        atendimento.data.toISOString().slice(0, 10),
                      )}{" "}
                      às {dateParaHorarioCivil(atendimento.horario)}
                    </p>
                  </div>
                  <Button
                    nativeButton={false}
                    render={
                      <Link
                        href={`/pacientes/${atendimento.paciente.id}/evolucoes/${atendimento.id}/editar`}
                      />
                    }
                    variant="outline"
                  >
                    Ver registro
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
