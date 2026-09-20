import Link from "next/link";
import { notFound } from "next/navigation";

import { BillingCard } from "@/components/billing/billing-card";
import { UnbilledSessionsSummary } from "@/components/billing/unbilled-sessions-summary";
import { SuccessToast } from "@/components/feedback/success-toast";
import {
  excluirCobrancaAction,
  gerarCobrancaAction,
  marcarCobrancaPagaAction,
  reabrirCobrancaAction,
} from "@/features/billing/actions";
import { obterFinanceiroPaciente } from "@/features/billing/queries";
import {
  criarCobrancaViewModel,
  criarPreviaFinanceira,
} from "@/features/billing/view-model";

export default async function PatientFinancePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    criada?: string;
    erro?: string;
    excluida?: string;
    paga?: string;
    reaberta?: string;
  }>;
}) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const paciente = await obterFinanceiroPaciente(id);
  if (!paciente) notFound();

  const preview = criarPreviaFinanceira({
    evolucoes: paciente.evolucoes,
    valorSessao: paciente.valorSessao,
  });
  const cobrancas = paciente.cobrancas.map(criarCobrancaViewModel);
  const successMessage = query.criada
    ? "Cobrança gerada com sucesso."
    : query.paga
      ? "Pagamento registrado com sucesso."
      : query.reaberta
        ? "Cobrança reaberta com sucesso."
        : query.excluida
          ? "Cobrança excluída e sessões liberadas."
          : null;

  return (
    <section aria-labelledby="page-title">
      {successMessage ? <SuccessToast message={successMessage} /> : null}
      <header>
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
          Financeiro
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Cobranças e atendimentos realizados por {paciente.nome}.
        </p>
      </header>

      {query.erro ? (
        <p
          aria-live="polite"
          className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          Não foi possível concluir a alteração da cobrança. Tente novamente.
        </p>
      ) : null}

      <div className="mt-8">
        <UnbilledSessionsSummary
          action={gerarCobrancaAction}
          patientId={paciente.id}
          preview={preview}
        />
      </div>

      <section aria-labelledby="billing-history-title" className="mt-10">
        <h2 className="text-xl font-semibold" id="billing-history-title">
          Histórico de cobranças
        </h2>
        {cobrancas.length === 0 ? (
          <p className="mt-5 rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Nenhuma cobrança foi gerada para este tratamento.
          </p>
        ) : (
          <div className="mt-5 space-y-5">
            {cobrancas.map((cobranca) => (
              <BillingCard
                billing={cobranca}
                deleteAction={excluirCobrancaAction}
                key={cobranca.id}
                paymentAction={marcarCobrancaPagaAction}
                reopenAction={reabrirCobrancaAction}
              />
            ))}
          </div>
        )}
      </section>
    </section>
  );
}
