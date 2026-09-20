import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { SuccessToast } from "@/components/feedback/success-toast";
import { CopyContextActions } from "@/components/evolutions/copy-context-actions";
import { DeletePatientDialog } from "@/components/patients/delete-patient-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { gerarContextoClinico } from "@/features/evolutions/context";
import { obterPacienteComContexto } from "@/features/evolutions/queries";
import { excluirPacienteAction } from "@/features/patients/actions";
import { DIAS_SEMANA, SEXO_LABELS } from "@/features/patients/schemas";
import { dateParaHorarioCivil, formatarDataCivil } from "@/lib/dates";
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
  const paciente = await obterPacienteComContexto(id);
  if (!paciente) notFound();

  const contextInput = {
    patologia: paciente.patologia,
    queixaPrincipal: paciente.queixaPrincipal,
    avaliacao: paciente.avaliacoes[0]?.conteudoMarkdown,
    objetivos: paciente.planoTerapeutico?.objetivosMarkdown,
    condutas: paciente.planoTerapeutico?.condutasMarkdown,
    evolucoes: paciente.evolucoes,
  };
  const ultimaEvolucao = paciente.evolucoes[0];

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
        <div className="flex flex-wrap gap-2">
          <CopyContextActions
            completeContext={gerarContextoClinico(contextInput, true)}
            recentContext={gerarContextoClinico(contextInput)}
          />
          <Button
            className="min-h-11 px-5"
            nativeButton={false}
            render={<Link href={`/pacientes/${paciente.id}/editar`} />}
            variant="outline"
          >
            Editar cadastro
          </Button>
          <DeletePatientDialog
            action={excluirPacienteAction}
            id={paciente.id}
            name={paciente.nome}
          />
        </div>
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
          <SummaryRow
            label="Sessões realizadas"
            value={String(paciente.evolucoes.length)}
          />
          <SummaryRow
            label="Última sessão"
            value={
              ultimaEvolucao
                ? `${formatarDataCivil(ultimaEvolucao.data.toISOString().slice(0, 10))} às ${dateParaHorarioCivil(ultimaEvolucao.horario)}`
                : "Nenhuma sessão registrada"
            }
          />
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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="divide-y divide-border">{children}</dl>
      </CardContent>
    </Card>
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
