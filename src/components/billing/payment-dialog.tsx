"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  initialBillingActionState,
  type BillingActionState,
} from "@/features/billing/action-state";
import { hojeCivil } from "@/lib/dates";

type PaymentAction = (
  state: BillingActionState,
  formData: FormData,
) => Promise<BillingActionState>;

export function PaymentDialog({
  action,
  billingId,
  patientId,
}: {
  action: PaymentAction;
  billingId: string;
  patientId: string;
}) {
  const [state, formAction, pending] = useActionState(
    action,
    initialBillingActionState,
  );

  useEffect(() => {
    if (state.formError) toast.error(state.formError);
  }, [state.formError]);

  const error = state.fieldErrors?.dataPagamento?.[0];

  return (
    <Dialog>
      <DialogTrigger render={<Button type="button" />}>
        Marcar como paga
      </DialogTrigger>
      <DialogContent>
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>Registrar pagamento</DialogTitle>
            <DialogDescription>
              Informe a data em que o pagamento foi recebido.
            </DialogDescription>
          </DialogHeader>
          <input name="pacienteId" type="hidden" value={patientId} />
          <input name="cobrancaId" type="hidden" value={billingId} />
          <div className="my-5">
            <Label htmlFor={`data-pagamento-${billingId}`}>
              Data do pagamento
            </Label>
            <Input
              aria-describedby={
                error ? `pagamento-error-${billingId}` : undefined
              }
              aria-invalid={Boolean(error)}
              className="mt-1 h-11"
              defaultValue={hojeCivil()}
              id={`data-pagamento-${billingId}`}
              name="dataPagamento"
              required
              type="date"
            />
            {error ? (
              <p
                className="mt-1 text-sm text-destructive"
                id={`pagamento-error-${billingId}`}
              >
                {error}
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancelar
            </DialogClose>
            <Button disabled={pending} type="submit">
              {pending ? "Salvando…" : "Confirmar pagamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
