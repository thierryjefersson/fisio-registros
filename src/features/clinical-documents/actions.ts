"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { ClinicalDocumentActionState } from "./action-state";
import { avaliacaoSchema, planoTerapeuticoSchema } from "./schemas";
import { salvarAvaliacaoInicial, salvarPlanoTerapeutico } from "./service";

export async function salvarAvaliacaoAction(
  _state: ClinicalDocumentActionState,
  formData: FormData,
): Promise<ClinicalDocumentActionState> {
  const resultado = avaliacaoSchema.safeParse({
    pacienteId: formData.get("pacienteId"),
    conteudoMarkdown: formData.get("conteudoMarkdown"),
  });
  if (!resultado.success)
    return { error: "Não foi possível validar a avaliação." };

  try {
    await salvarAvaliacaoInicial(
      resultado.data.pacienteId,
      resultado.data.conteudoMarkdown,
    );
    revalidatePath(`/pacientes/${resultado.data.pacienteId}/avaliacao`);
    redirect(`/pacientes/${resultado.data.pacienteId}/avaliacao?salvo=1`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Falha ao salvar avaliação", error);
    return { error: "Não foi possível salvar a avaliação. Tente novamente." };
  }
}

export async function salvarPlanoAction(
  _state: ClinicalDocumentActionState,
  formData: FormData,
): Promise<ClinicalDocumentActionState> {
  const resultado = planoTerapeuticoSchema.safeParse({
    pacienteId: formData.get("pacienteId"),
    objetivosMarkdown: formData.get("objetivosMarkdown"),
    condutasMarkdown: formData.get("condutasMarkdown"),
  });
  if (!resultado.success)
    return { error: "Não foi possível validar o plano terapêutico." };

  try {
    await salvarPlanoTerapeutico(
      resultado.data.pacienteId,
      resultado.data.objetivosMarkdown,
      resultado.data.condutasMarkdown,
    );
    revalidatePath(`/pacientes/${resultado.data.pacienteId}/plano`);
    redirect(`/pacientes/${resultado.data.pacienteId}/plano?salvo=1`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Falha ao salvar plano terapêutico", error);
    return {
      error: "Não foi possível salvar o plano terapêutico. Tente novamente.",
    };
  }
}

function isRedirectError(error: unknown): boolean {
  return Boolean(
    error &&
    typeof error === "object" &&
    "digest" in error &&
    typeof error.digest === "string" &&
    error.digest.startsWith("NEXT_REDIRECT"),
  );
}
