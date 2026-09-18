"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PatternFormat } from "react-number-format";
import {
  useActionState,
  useEffect,
  useTransition,
  type ReactNode,
} from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { CurrencyField } from "@/components/patients/currency-field";
import { DatePicker } from "@/components/patients/date-picker";
import { WeekdayCheckboxGroup } from "@/components/patients/weekday-checkbox-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  initialPatientActionState,
  type PatientActionState,
} from "@/features/patients/action-state";
import {
  pacienteInputSchema,
  SEXOS,
  SEXO_LABELS,
  type PacienteFormValues,
} from "@/features/patients/schemas";
import { hojeCivil } from "@/lib/dates";

type PatientFormProps = {
  action: (
    estadoAnterior: PatientActionState,
    formData: FormData,
  ) => Promise<PatientActionState>;
  defaultValues?: Partial<Omit<PacienteFormValues, "nomeResponsavel">> & {
    id?: string;
    nomeResponsavel?: string | null;
  };
  submitLabel: string;
};

const inputClassName = "mt-1 h-11";
const compactInputClassName = "mt-1 h-10";

export function PatientForm({
  action,
  defaultValues,
  submitLabel,
}: PatientFormProps) {
  const [state, formAction, actionPending] = useActionState(
    action,
    initialPatientActionState,
  );
  const [, startTransition] = useTransition();
  const form = useForm<PacienteFormValues>({
    resolver: zodResolver(pacienteInputSchema),
    defaultValues: {
      nome: defaultValues?.nome ?? "",
      dataNascimento: defaultValues?.dataNascimento ?? "",
      sexo: defaultValues?.sexo ?? "NAO_INFORMADO",
      telefone: defaultValues?.telefone ?? "",
      endereco: defaultValues?.endereco ?? "",
      nomeResponsavel: defaultValues?.nomeResponsavel ?? "",
      patologia: defaultValues?.patologia ?? "",
      queixaPrincipal: defaultValues?.queixaPrincipal ?? "",
      valorSessao: defaultValues?.valorSessao ?? "",
      dataInicio: defaultValues?.dataInicio ?? hojeCivil(),
      previsaoSessoes: defaultValues?.previsaoSessoes ?? "",
      diasAtendimento: defaultValues?.diasAtendimento ?? [],
    },
  });

  useEffect(() => {
    if (state.fieldErrors) {
      for (const [field, messages] of Object.entries(state.fieldErrors)) {
        if (field in form.getValues()) {
          form.setError(field as keyof PacienteFormValues, {
            type: "server",
            message: messages[0],
          });
        }
      }
    }
  }, [form, state.fieldErrors]);

  useEffect(() => {
    if (state.formError) toast.error(state.formError);
  }, [state.formError]);

  const onSubmit = form.handleSubmit((values) => {
    const formData = new FormData();
    if (defaultValues?.id) formData.set("id", defaultValues.id);
    for (const [name, value] of Object.entries(values)) {
      if (name === "diasAtendimento" && Array.isArray(value)) {
        for (const dia of value) formData.append(name, dia);
      } else {
        formData.set(name, String(value ?? ""));
      }
    }
    startTransition(() => formAction(formData));
  });

  function erro(campo: keyof PacienteFormValues): string | undefined {
    return form.formState.errors[campo]?.message?.toString();
  }

  return (
    <form className="space-y-8" noValidate onSubmit={onSubmit}>
      {state.formError ? (
        <p
          aria-live="polite"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {state.formError}
        </p>
      ) : null}

      <section className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold">Dados pessoais</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Nome" name="nome" error={erro("nome")}>
            <Input
              aria-describedby={erro("nome") ? "nome-error" : undefined}
              aria-invalid={Boolean(erro("nome"))}
              className={inputClassName}
              id="nome"
              {...form.register("nome")}
            />
          </Field>
          <Field
            label="Data de nascimento"
            name="dataNascimento"
            error={erro("dataNascimento")}
          >
            <Controller
              control={form.control}
              name="dataNascimento"
              render={({ field }) => (
                <DatePicker
                  aria-describedby={
                    erro("dataNascimento") ? "dataNascimento-error" : undefined
                  }
                  aria-invalid={Boolean(erro("dataNascimento"))}
                  disableFuture
                  id="dataNascimento"
                  onBlur={() => field.onBlur()}
                  onChange={field.onChange}
                  value={field.value}
                />
              )}
            />
          </Field>
          <Field label="Sexo" name="sexo" error={erro("sexo")}>
            <Controller
              control={form.control}
              name="sexo"
              render={({ field }) => (
                <Select
                  onValueChange={(value) => field.onChange(value ?? "")}
                  value={field.value}
                >
                  <SelectTrigger
                    aria-describedby={erro("sexo") ? "sexo-error" : undefined}
                    aria-invalid={Boolean(erro("sexo"))}
                    className="mt-1 h-11 w-full"
                    id="sexo"
                    name={field.name}
                  >
                    <SelectValue placeholder="Selecione o sexo" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEXOS.map((sexo) => (
                      <SelectItem key={sexo} value={sexo}>
                        {SEXO_LABELS[sexo]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field label="Telefone" name="telefone" error={erro("telefone")}>
            <Controller
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <PatternFormat
                  aria-describedby={
                    erro("telefone") ? "telefone-error" : undefined
                  }
                  aria-invalid={Boolean(erro("telefone"))}
                  className={inputClassName}
                  customInput={Input}
                  format="(##) #####-####"
                  getInputRef={field.ref}
                  id="telefone"
                  inputMode="tel"
                  mask="_"
                  name={field.name}
                  onBlur={field.onBlur}
                  onValueChange={({ value }) => field.onChange(value)}
                  value={field.value}
                  valueIsNumericString
                />
              )}
            />
          </Field>
          <Field
            label="Responsável (opcional)"
            name="nomeResponsavel"
            error={erro("nomeResponsavel")}
          >
            <Input
              aria-describedby={
                erro("nomeResponsavel") ? "nomeResponsavel-error" : undefined
              }
              className={inputClassName}
              id="nomeResponsavel"
              {...form.register("nomeResponsavel")}
            />
          </Field>
          <Field
            label="Endereço"
            name="endereco"
            error={erro("endereco")}
            fullWidth
          >
            <Input
              aria-describedby={erro("endereco") ? "endereco-error" : undefined}
              aria-invalid={Boolean(erro("endereco"))}
              className={inputClassName}
              id="endereco"
              {...form.register("endereco")}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <h2 className="text-lg font-semibold">Dados do tratamento</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Patologia" name="patologia" error={erro("patologia")}>
            <Input
              aria-describedby={
                erro("patologia") ? "patologia-error" : undefined
              }
              aria-invalid={Boolean(erro("patologia"))}
              className={compactInputClassName}
              id="patologia"
              {...form.register("patologia")}
            />
          </Field>
          <Field
            label="Queixa principal"
            name="queixaPrincipal"
            error={erro("queixaPrincipal")}
          >
            <Input
              aria-describedby={
                erro("queixaPrincipal") ? "queixaPrincipal-error" : undefined
              }
              aria-invalid={Boolean(erro("queixaPrincipal"))}
              className={compactInputClassName}
              id="queixaPrincipal"
              {...form.register("queixaPrincipal")}
            />
          </Field>
          <div className="grid gap-4 sm:col-span-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(10rem,0.8fr)]">
            <Field
              error={erro("valorSessao")}
              label="Valor por sessão"
              name="valorSessao"
            >
              <Controller
                control={form.control}
                name="valorSessao"
                render={({ field }) => (
                  <CurrencyField
                    aria-describedby={
                      erro("valorSessao") ? "valorSessao-error" : undefined
                    }
                    aria-invalid={Boolean(erro("valorSessao"))}
                    className={compactInputClassName}
                    customInput={Input}
                    getInputRef={field.ref}
                    id="valorSessao"
                    name={field.name}
                    onBlur={field.onBlur}
                    onValueChange={field.onChange}
                    value={field.value}
                  />
                )}
              />
            </Field>
            <Field
              label="Previsão de sessões"
              name="previsaoSessoes"
              error={erro("previsaoSessoes")}
            >
              <Input
                aria-describedby={
                  erro("previsaoSessoes") ? "previsaoSessoes-error" : undefined
                }
                aria-invalid={Boolean(erro("previsaoSessoes"))}
                className={compactInputClassName}
                id="previsaoSessoes"
                inputMode="numeric"
                {...form.register("previsaoSessoes")}
              />
            </Field>
            <Field
              label="Data de início"
              name="dataInicio"
              error={erro("dataInicio")}
            >
              <Controller
                control={form.control}
                name="dataInicio"
                render={({ field }) => (
                  <DatePicker
                    aria-describedby={
                      erro("dataInicio") ? "dataInicio-error" : undefined
                    }
                    aria-invalid={Boolean(erro("dataInicio"))}
                    className="h-10"
                    id="dataInicio"
                    onBlur={() => field.onBlur()}
                    onChange={field.onChange}
                    value={field.value}
                  />
                )}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Controller
              control={form.control}
              name="diasAtendimento"
              render={({ field }) => (
                <WeekdayCheckboxGroup
                  error={erro("diasAtendimento")}
                  onChange={field.onChange}
                  value={field.value}
                />
              )}
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <Button
          className="min-h-11 px-5"
          disabled={actionPending || form.formState.isSubmitting}
          size="lg"
          type="submit"
        >
          {actionPending ? "Salvando…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}

function Field({
  children,
  className,
  error,
  fullWidth = false,
  label,
  name,
}: {
  children: ReactNode;
  className?: string;
  error?: string;
  fullWidth?: boolean;
  label: string;
  name: string;
}) {
  return (
    <div className={className ?? (fullWidth ? "sm:col-span-2" : undefined)}>
      <Label className="text-sm font-medium text-foreground" htmlFor={name}>
        {label}
      </Label>
      {children}
      {error ? (
        <p className="mt-1 text-sm text-destructive" id={`${name}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
