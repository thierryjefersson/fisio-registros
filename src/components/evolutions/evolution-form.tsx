"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { LiveMarkdownPreview } from "@/components/clinical/live-markdown-preview";
import { MarkdownEditor } from "@/components/clinical/markdown-editor";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  initialEvolutionActionState,
  type EvolutionActionState,
} from "@/features/evolutions/action-state";
import { hojeCivil } from "@/lib/dates";

type EvolutionAction = (
  state: EvolutionActionState,
  formData: FormData,
) => Promise<EvolutionActionState>;

export function EvolutionForm({
  action,
  defaultValues,
  patientId,
  submitLabel,
}: {
  action: EvolutionAction;
  defaultValues?: {
    conteudoMarkdown?: string;
    data?: string;
    evolucaoId?: string;
    horario?: string;
  };
  patientId: string;
  submitLabel: string;
}) {
  const [markdown, setMarkdown] = useState(
    defaultValues?.conteudoMarkdown ?? "",
  );
  const [clientContentError, setClientContentError] = useState<string>();
  const [state, formAction, pending] = useActionState(
    action,
    initialEvolutionActionState,
  );

  useEffect(() => {
    if (state.formError) toast.error(state.formError);
  }, [state.formError]);

  const contentError =
    clientContentError ?? state.fieldErrors?.conteudoMarkdown?.[0];

  return (
    <form
      action={formAction}
      className="space-y-6"
      onSubmit={(event) => {
        if (!markdown.trim()) {
          event.preventDefault();
          setClientContentError("Conteúdo da evolução é obrigatório.");
        }
      }}
    >
      <input name="pacienteId" type="hidden" value={patientId} />
      {defaultValues?.evolucaoId ? (
        <input
          name="evolucaoId"
          type="hidden"
          value={defaultValues.evolucaoId}
        />
      ) : null}
      <input name="conteudoMarkdown" type="hidden" value={markdown} />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dados do atendimento</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <Field error={state.fieldErrors?.data?.[0]} label="Data" name="data">
            <Input
              aria-describedby={
                state.fieldErrors?.data ? "data-error" : undefined
              }
              aria-invalid={Boolean(state.fieldErrors?.data)}
              className="mt-1 h-11"
              defaultValue={defaultValues?.data ?? hojeCivil()}
              id="data"
              name="data"
              required
              type="date"
            />
          </Field>
          <Field
            error={state.fieldErrors?.horario?.[0]}
            label="Horário"
            name="horario"
          >
            <Input
              aria-describedby={
                state.fieldErrors?.horario ? "horario-error" : undefined
              }
              aria-invalid={Boolean(state.fieldErrors?.horario)}
              className="mt-1 h-11"
              defaultValue={defaultValues?.horario ?? ""}
              id="horario"
              name="horario"
              required
              type="time"
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Registro clínico</CardTitle>
          <CardDescription>
            Descreva a sessão realizada em Markdown.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-2">
            <MarkdownEditor
              ariaLabel="Editor da evolução"
              markdown={defaultValues?.conteudoMarkdown ?? ""}
              onChange={(value) => {
                setMarkdown(value);
                if (value.trim()) setClientContentError(undefined);
              }}
            />
            <LiveMarkdownPreview markdown={markdown} />
          </div>
          {contentError ? (
            <p className="text-sm text-destructive" id="conteudoMarkdown-error">
              {contentError}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {state.formError ? (
        <p
          aria-live="polite"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {state.formError}
        </p>
      ) : null}

      <div className="flex justify-end">
        <Button className="min-h-11 px-5" disabled={pending} type="submit">
          {pending ? "Salvando…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}

function Field({
  children,
  error,
  label,
  name,
}: {
  children: React.ReactNode;
  error?: string;
  label: string;
  name: string;
}) {
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      {children}
      {error ? (
        <p className="mt-1 text-sm text-destructive" id={`${name}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
