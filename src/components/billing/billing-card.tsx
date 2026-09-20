"use client";

import { Copy, RotateCcw, Trash2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { BillingActionState } from "@/features/billing/action-state";

import { PaymentDialog } from "./payment-dialog";

type PaymentAction = (
  state: BillingActionState,
  formData: FormData,
) => Promise<BillingActionState>;

type FormAction = (formData: FormData) => void | Promise<void>;

export type BillingCardData = {
  dataPagamento: string | null;
  datas: string[];
  id: string;
  mensagem: string;
  pacienteId: string;
  quantidade: number;
  status: "PAGA" | "PENDENTE";
  valorTotal: string;
  valorUnitario: string;
};

export function BillingCard({
  billing,
  deleteAction,
  paymentAction,
  reopenAction,
}: {
  billing: BillingCardData;
  deleteAction: FormAction;
  paymentAction: PaymentAction;
  reopenAction: FormAction;
}) {
  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(billing.mensagem);
      toast.success("Mensagem de cobrança copiada.");
    } catch {
      toast.error("Não foi possível copiar a mensagem de cobrança.");
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
        <CardTitle className="text-lg">
          {billing.quantidade} {billing.quantidade === 1 ? "sessão" : "sessões"}
        </CardTitle>
        <Badge variant={billing.status === "PAGA" ? "success" : "secondary"}>
          {billing.status === "PAGA" ? "Paga" : "Pendente"}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-5">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Detail label="Datas" value={billing.datas.join(", ")} />
          <Detail label="Valor unitário" value={billing.valorUnitario} />
          <Detail label="Total" value={billing.valorTotal} />
          <Detail
            label="Pagamento"
            value={billing.dataPagamento ?? "Ainda não recebido"}
          />
        </dl>
        <div>
          <p className="text-sm text-muted-foreground">Mensagem de cobrança</p>
          <p className="mt-2 rounded-lg bg-muted p-4 text-sm leading-6">
            {billing.mensagem}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex-wrap justify-end gap-2">
        <Button onClick={copyMessage} type="button" variant="outline">
          <Copy aria-hidden />
          Copiar mensagem
        </Button>
        {billing.status === "PENDENTE" ? (
          <PaymentDialog
            action={paymentAction}
            billingId={billing.id}
            patientId={billing.pacienteId}
          />
        ) : (
          <ReopenBillingDialog action={reopenAction} billing={billing} />
        )}
        <DeleteBillingDialog action={deleteAction} billing={billing} />
      </CardFooter>
    </Card>
  );
}

function ReopenBillingDialog({
  action,
  billing,
}: {
  action: FormAction;
  billing: BillingCardData;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button type="button" variant="outline" />}>
        <RotateCcw aria-hidden />
        Voltar para pendente
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reabrir cobrança?</AlertDialogTitle>
          <AlertDialogDescription>
            A cobrança voltará para Pendente e a data de pagamento será
            removida.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose render={<Button type="button" variant="outline" />}>
            Cancelar
          </AlertDialogClose>
          <form action={action}>
            <BillingIdentifiers billing={billing} />
            <SubmitButton
              label="Confirmar reabertura"
              pendingLabel="Reabrindo…"
            />
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function DeleteBillingDialog({
  action,
  billing,
}: {
  action: FormAction;
  billing: BillingCardData;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={<Button type="button" variant="destructive" />}
      >
        <Trash2 aria-hidden />
        Excluir
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir cobrança?</AlertDialogTitle>
          <AlertDialogDescription>
            A cobrança será removida e suas sessões voltarão a ficar disponíveis
            para uma nova cobrança.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose render={<Button type="button" variant="outline" />}>
            Cancelar
          </AlertDialogClose>
          <form action={action}>
            <BillingIdentifiers billing={billing} />
            <SubmitButton
              label="Excluir cobrança"
              pendingLabel="Excluindo…"
              variant="destructive"
            />
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function BillingIdentifiers({ billing }: { billing: BillingCardData }) {
  return (
    <>
      <input name="pacienteId" type="hidden" value={billing.pacienteId} />
      <input name="cobrancaId" type="hidden" value={billing.id} />
    </>
  );
}

function SubmitButton({
  label,
  pendingLabel,
  variant = "default",
}: {
  label: string;
  pendingLabel: string;
  variant?: "default" | "destructive";
}) {
  const { pending } = useFormStatus();
  return (
    <Button disabled={pending} type="submit" variant={variant}>
      {pending ? pendingLabel : label}
    </Button>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  );
}
