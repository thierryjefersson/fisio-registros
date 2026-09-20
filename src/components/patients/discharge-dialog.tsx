"use client";

import { CircleAlert, LogOut } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import type { BillingActionState } from "@/features/billing/action-state";
import { initialBillingActionState } from "@/features/billing/action-state";
import type { DischargeActionState } from "@/features/patients/discharge-action-state";
import { initialDischargeActionState } from "@/features/patients/discharge-action-state";
import { hojeCivil } from "@/lib/dates";

import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { DatePicker } from "./date-picker";

type DischargeAction = (
  state: DischargeActionState,
  formData: FormData,
) => Promise<DischargeActionState>;

type BillingAction = (
  state: BillingActionState,
  formData: FormData,
) => Promise<BillingActionState>;

export function DischargeDialog({
  billingAction,
  dischargeAction,
  patientId,
  unbilledSessions,
}: {
  billingAction: BillingAction;
  dischargeAction: DischargeAction;
  patientId: string;
  unbilledSessions: number;
}) {
  const [dataAlta, setDataAlta] = useState(hojeCivil());
  const [state, formAction, pending] = useActionState(
    dischargeAction,
    initialDischargeActionState,
  );
  const [billingState, billingFormAction, billingPending] = useActionState(
    billingAction,
    initialBillingActionState,
  );

  useEffect(() => {
    if (state.formError) toast.error(state.formError);
  }, [state.formError]);
  useEffect(() => {
    if (billingState.formError) toast.error(billingState.formError);
  }, [billingState.formError]);

  const count = state.unbilledSessions ?? unbilledSessions;
  const exigeConfirmacao = count > 0;
  const dateError = state.fieldErrors?.dataAlta?.[0];

  return (
    <Dialog>
      <DialogTrigger
        render={<Button className="min-h-11 px-5" type="button" />}
      >
        <LogOut aria-hidden />
        Dar alta
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Concluir tratamento</DialogTitle>
          <DialogDescription>
            Registre a data da alta. O tratamento continuará disponível no
            filtro de pacientes com alta.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} id="discharge-form">
          <input name="pacienteId" type="hidden" value={patientId} />
          <input name="dataAlta" type="hidden" value={dataAlta} />
          <input
            name="confirmarSessoesNaoCobradas"
            type="hidden"
            value={String(exigeConfirmacao)}
          />
          <div className="my-2">
            <Label htmlFor="data-alta">Data da alta</Label>
            <DatePicker
              aria-describedby={dateError ? "data-alta-error" : undefined}
              aria-invalid={Boolean(dateError)}
              disableFuture
              id="data-alta"
              onChange={setDataAlta}
              value={dataAlta}
            />
            {dateError ? (
              <p className="mt-1 text-sm text-destructive" id="data-alta-error">
                {dateError}
              </p>
            ) : null}
          </div>
        </form>

        {exigeConfirmacao ? (
          <Alert variant="warning">
            <CircleAlert aria-hidden />
            <AlertTitle>Há atendimentos não cobrados</AlertTitle>
            <AlertDescription>
              {count}{" "}
              {count === 1
                ? "sessão ainda não foi cobrada"
                : "sessões ainda não foram cobradas"}
              . Você pode gerar a cobrança primeiro ou concluir a alta mesmo
              assim.
            </AlertDescription>
          </Alert>
        ) : null}

        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>
            Cancelar
          </DialogClose>
          {exigeConfirmacao ? (
            <form action={billingFormAction}>
              <input name="pacienteId" type="hidden" value={patientId} />
              <Button disabled={billingPending} type="submit" variant="outline">
                {billingPending ? "Gerando…" : "Gerar cobrança"}
              </Button>
            </form>
          ) : null}
          <Button disabled={pending} form="discharge-form" type="submit">
            {pending
              ? "Concluindo…"
              : exigeConfirmacao
                ? "Dar alta mesmo assim"
                : "Confirmar alta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
