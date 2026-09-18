import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { SuccessToast } from "@/components/feedback/success-toast";
import { obterPaciente } from "@/features/patients/queries";
import { DIAS_SEMANA, SEXO_LABELS } from "@/features/patients/schemas";
import { formatarDataCivil } from "@/lib/dates";
import { formatarBRL, formatarTelefone } from "@/lib/formatters";

export default async function PatientSummaryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ salvo?: string }>;
}) {
  const { id } = await params;
  const { salvo } = (await searchParams) ?? {};
  const paciente = await obterPaciente(id);
  if (!paciente) notFound();

  const dias = paciente.diasAtendimento
    .map((dia) => DIAS_SEMANA.find((item) => item.value === dia)?.label ?? dia)
    .join(", ");

  return (
    <section aria-labelledby="page-title">
      {salvo === "1" ? (
        <SuccessToast message="Tratamento salvo com sucesso." />
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-4">
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
            {paciente.nome}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Resumo do tratamento
          </p>
        </div>
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-input bg-card px-5 text-sm font-semibold text-foreground shadow-sm transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href={`/pacientes/${paciente.id}/editar`}
        >
          Editar cadastro
        </Link>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <SummaryCard title="Dados cadastrais">
          <SummaryRow label="Nome" value={paciente.nome} />
          <SummaryRow
            label="Data de nascimento"
            value={formatarDataCivil(
              paciente.dataNascimento.toISOString().slice(0, 10),
            )}
          />
          <SummaryRow label="Sexo" value={SEXO_LABELS[paciente.sexo]} />
          <SummaryRow
            label="Telefone"
            value={formatarTelefone(paciente.telefone)}
          />
          <SummaryRow label="Endereço" value={paciente.endereco} />
          <SummaryRow
            label="Responsável"
            value={paciente.nomeResponsavel ?? "Não informado."}
          />
          <SummaryRow label="Patologia" value={paciente.patologia} />
          <SummaryRow
            label="Queixa principal"
            value={paciente.queixaPrincipal}
          />
        </SummaryCard>

        <SummaryCard title="Tratamento">
          <SummaryRow label="Status" value="Em tratamento" />
          <SummaryRow
            label="Data de início"
            value={formatarDataCivil(
              paciente.dataInicio.toISOString().slice(0, 10),
            )}
          />
          <SummaryRow label="Dias habituais" value={dias} />
          <SummaryRow
            label="Frequência semanal"
            value={`${paciente.diasAtendimento.length} ${paciente.diasAtendimento.length === 1 ? "dia" : "dias"}`}
          />
          <SummaryRow
            label="Previsão inicial"
            value={`${paciente.previsaoSessoes} sessões`}
          />
          <SummaryRow
            label="Valor por sessão"
            value={formatarBRL(paciente.valorSessao.toString())}
          />
          <SummaryRow label="Sessões realizadas" value="0" />
          <SummaryRow label="Última sessão" value="Nenhuma sessão registrada" />
        </SummaryCard>
      </div>
    </section>
  );
}

function SummaryCard({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <article className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <dl className="mt-5 divide-y divide-border">{children}</dl>
    </article>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[minmax(10rem,0.8fr)_1.2fr] sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="whitespace-pre-wrap text-sm font-medium text-foreground">
        {value}
      </dd>
    </div>
  );
}
