"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { CopyContentActions } from "@/components/clinical/copy-content-actions";
import { LiveMarkdownPreview } from "@/components/clinical/live-markdown-preview";
import { MarkdownEditor } from "@/components/clinical/markdown-editor";
import { Button } from "@/components/ui/button";
import {
  initialClinicalDocumentActionState,
  type ClinicalDocumentActionState,
} from "@/features/clinical-documents/action-state";

type Action = (
  state: ClinicalDocumentActionState,
  formData: FormData,
) => Promise<ClinicalDocumentActionState>;

export function AssessmentForm({
  action,
  initialMarkdown,
  patientId,
}: {
  action: Action;
  initialMarkdown: string;
  patientId: string;
}) {
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [state, formAction, pending] = useActionState(
    action,
    initialClinicalDocumentActionState,
  );
  useActionError(state.error);

  return (
    <form action={formAction} className="space-y-4">
      <input name="pacienteId" type="hidden" value={patientId} />
      <input name="conteudoMarkdown" type="hidden" value={markdown} />
      <EditingWorkspace
        ariaLabel="Editor da avaliação inicial"
        initialMarkdown={initialMarkdown}
        markdown={markdown}
        onChange={setMarkdown}
      />
      {state.error ? <FormError message={state.error} /> : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CopyContentActions markdown={markdown} />
        <Button disabled={pending} size="lg" type="submit">
          {pending ? "Salvando…" : "Salvar avaliação"}
        </Button>
      </div>
    </form>
  );
}

export function TreatmentPlanForm({
  action,
  initialConducts,
  initialObjectives,
  patientId,
}: {
  action: Action;
  initialConducts: string;
  initialObjectives: string;
  patientId: string;
}) {
  const [objectives, setObjectives] = useState(initialObjectives);
  const [conducts, setConducts] = useState(initialConducts);
  const [state, formAction, pending] = useActionState(
    action,
    initialClinicalDocumentActionState,
  );
  useActionError(state.error);

  return (
    <form action={formAction} className="space-y-6">
      <input name="pacienteId" type="hidden" value={patientId} />
      <input name="objetivosMarkdown" type="hidden" value={objectives} />
      <input name="condutasMarkdown" type="hidden" value={conducts} />
      <DocumentSection title="Objetivos">
        <EditingWorkspace
          ariaLabel="Editor dos objetivos"
          initialMarkdown={initialObjectives}
          markdown={objectives}
          onChange={setObjectives}
        />
        <CopyContentActions markdown={objectives} />
      </DocumentSection>
      <DocumentSection title="Condutas">
        <EditingWorkspace
          ariaLabel="Editor das condutas"
          initialMarkdown={initialConducts}
          markdown={conducts}
          onChange={setConducts}
        />
        <CopyContentActions markdown={conducts} />
      </DocumentSection>
      {state.error ? <FormError message={state.error} /> : null}
      <div className="flex justify-end">
        <Button disabled={pending} size="lg" type="submit">
          {pending ? "Salvando…" : "Salvar plano"}
        </Button>
      </div>
    </form>
  );
}

function EditingWorkspace({
  ariaLabel,
  initialMarkdown,
  markdown,
  onChange,
}: {
  ariaLabel: string;
  initialMarkdown: string;
  markdown: string;
  onChange: (markdown: string) => void;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <MarkdownEditor
        ariaLabel={ariaLabel}
        markdown={initialMarkdown}
        onChange={onChange}
      />
      <LiveMarkdownPreview markdown={markdown} />
    </div>
  );
}

function DocumentSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function FormError({ message }: { message: string }) {
  return (
    <p
      aria-live="polite"
      className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      {message}
    </p>
  );
}

function useActionError(error?: string) {
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);
}
