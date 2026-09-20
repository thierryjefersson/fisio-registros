import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calcularResumoFinanceiro } from "@/features/billing/domain";
import { listarCobrancasGerais } from "@/features/billing/queries";
import { criarCobrancaViewModel } from "@/features/billing/view-model";
import { hojeCivil } from "@/lib/dates";
import { formatarBRL } from "@/lib/formatters";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const cobrancas = await listarCobrancasGerais();
  const resumo = calcularResumoFinanceiro(cobrancas, hojeCivil());
  const pendentes = cobrancas.filter(({ status }) => status === "PENDENTE");
  const pagas = cobrancas.filter(({ status }) => status === "PAGA");

  return (
    <section aria-labelledby="page-title">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight" id="page-title">
          Financeiro
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Acompanhe valores pendentes e pagamentos recebidos.
        </p>
      </header>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <SummaryCard
          label="Total a receber"
          value={formatarBRL(resumo.aReceber.toFixed(2))}
        />
        <SummaryCard
          label="Recebido no mês"
          value={formatarBRL(resumo.recebidoNoMes.toFixed(2))}
        />
      </div>

      <BillingSection
        billings={pendentes}
        emptyMessage="Nenhuma cobrança pendente."
        title="Pendências"
      />
      <BillingSection
        billings={pagas}
        emptyMessage="Nenhum pagamento registrado."
        title="Histórico pago"
      />
    </section>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}

function BillingSection({
  billings,
  emptyMessage,
  title,
}: {
  billings: Awaited<ReturnType<typeof listarCobrancasGerais>>;
  emptyMessage: string;
  title: string;
}) {
  return (
    <section className="mt-10" aria-labelledby={`section-${title}`}>
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold" id={`section-${title}`}>
          {title}
        </h2>
        <Badge variant="outline">{billings.length}</Badge>
      </div>
      {billings.length === 0 ? (
        <p className="mt-5 rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          {billings.map((billing) => {
            const viewModel = criarCobrancaViewModel(billing);
            return (
              <Card key={billing.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-5">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{billing.paciente.nome}</p>
                      <Badge
                        variant={
                          billing.status === "PAGA" ? "success" : "secondary"
                        }
                      >
                        {billing.status === "PAGA" ? "Paga" : "Pendente"}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {viewModel.quantidade} sessões • {viewModel.valorTotal} •{" "}
                      {viewModel.datas.join(", ")}
                    </p>
                  </div>
                  <Button
                    nativeButton={false}
                    render={
                      <Link
                        href={`/pacientes/${billing.paciente.id}/financeiro`}
                      />
                    }
                    variant="outline"
                  >
                    Ver financeiro do paciente
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
