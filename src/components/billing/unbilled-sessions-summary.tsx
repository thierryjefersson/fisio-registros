"use client";

import { ReceiptText } from "lucide-react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  initialBillingActionState,
  type BillingActionState,
} from "@/features/billing/action-state";

type BillingAction = (
  state: BillingActionState,
  formData: FormData,
) => Promise<BillingActionState>;

export function UnbilledSessionsSummary({
  action,
  patientId,
  preview,
}: {
  action: BillingAction;
  patientId: string;
  preview: {
    datas: string[];
    quantidade: number;
    valorTotal: string;
    valorUnitario: string;
  };
}) {
  const [state, formAction, pending] = useActionState(
    action,
    initialBillingActionState,
  );

  useEffect(() => {
    if (state.formError) toast.error(state.formError);
  }, [state.formError]);

  const semSessoes = preview.quantidade === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ReceiptText aria-hidden />
          Atendimentos não cobrados
        </CardTitle>
        <CardDescription>
          A cobrança inclui automaticamente todas as sessões disponíveis.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {semSessoes ? (
          <p className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
            Não há atendimentos disponíveis para uma nova cobrança.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-3">
            <Summary label="Sessões" value={String(preview.quantidade)} />
            <Summary label="Valor por sessão" value={preview.valorUnitario} />
            <Summary label="Total" value={preview.valorTotal} />
            <div className="sm:col-span-3">
              <p className="text-sm text-muted-foreground">Datas</p>
              <p className="mt-1 text-sm font-medium">
                {preview.datas.join(", ")}
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-end">
        <form action={formAction}>
          <input name="pacienteId" type="hidden" value={patientId} />
          <Button disabled={pending || semSessoes} type="submit">
            {pending ? "Gerando…" : "Gerar cobrança"}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
