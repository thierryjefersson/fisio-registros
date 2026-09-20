"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { dataCivilParaDate, horarioCivilParaDate } from "@/lib/dates";

import type { EvolutionActionState } from "./action-state";
import { excluirEvolucao } from "./queries";
import { edicaoEvolucaoSchema, errosEvolucao, evolucaoSchema } from "./schemas";

export async function criarEvolucaoAction(
  _state: EvolutionActionState,
  formData: FormData,
): Promise<EvolutionActionState> {
  const resultado = evolucaoSchema.safeParse(objetoFormData(formData));
  if (!resultado.success)
    return { fieldErrors: errosEvolucao(resultado.error) };

  try {
    await prisma.evolucao.create({ data: dadosPrisma(resultado.data) });
    invalidarPaciente(resultado.data.pacienteId);
    redirect(`/pacientes/${resultado.data.pacienteId}/evolucoes?salvo=1`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Falha ao criar evolução", error);
    return {
      formError: "Não foi possível salvar a evolução. Tente novamente.",
    };
  }
}

export async function atualizarEvolucaoAction(
  _state: EvolutionActionState,
  formData: FormData,
): Promise<EvolutionActionState> {
  const resultado = edicaoEvolucaoSchema.safeParse({
    ...objetoFormData(formData),
    evolucaoId: formData.get("evolucaoId"),
  });
  if (!resultado.success)
    return { fieldErrors: errosEvolucao(resultado.error) };

  try {
    const atualizado = await prisma.evolucao.updateMany({
      where: {
        id: resultado.data.evolucaoId,
        pacienteId: resultado.data.pacienteId,
      },
      data: dadosPrisma(resultado.data),
    });
    if (atualizado.count === 0) {
      return { formError: "A evolução não foi encontrada." };
    }
    invalidarPaciente(resultado.data.pacienteId);
    redirect(`/pacientes/${resultado.data.pacienteId}/evolucoes?salvo=1`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Falha ao atualizar evolução", error);
    return {
      formError: "Não foi possível atualizar a evolução. Tente novamente.",
    };
  }
}

export async function excluirEvolucaoAction(formData: FormData) {
  const pacienteId = String(formData.get("pacienteId") ?? "");
  const evolucaoId = String(formData.get("evolucaoId") ?? "");
  try {
    const result = await excluirEvolucao(pacienteId, evolucaoId);
    invalidarPaciente(pacienteId);
    if (result === "billed") {
      redirect(`/pacientes/${pacienteId}/evolucoes?erro=sessao-cobrada`);
    }
    redirect(
      `/pacientes/${pacienteId}/evolucoes?${result === "deleted" ? "excluido=1" : "erro=nao-encontrado"}`,
    );
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Falha ao excluir evolução", error);
    redirect(`/pacientes/${pacienteId}/evolucoes?erro=exclusao`);
  }
}

function objetoFormData(formData: FormData) {
  return {
    pacienteId: formData.get("pacienteId"),
    data: formData.get("data"),
    horario: formData.get("horario"),
    conteudoMarkdown: formData.get("conteudoMarkdown"),
  };
}

function dadosPrisma(data: {
  pacienteId: string;
  data: string;
  horario: string;
  conteudoMarkdown: string;
}) {
  return {
    pacienteId: data.pacienteId,
    data: dataCivilParaDate(data.data),
    horario: horarioCivilParaDate(data.horario),
    conteudoMarkdown: data.conteudoMarkdown,
  };
}

function invalidarPaciente(pacienteId: string) {
  revalidatePath("/");
  revalidatePath(`/pacientes/${pacienteId}`);
  revalidatePath(`/pacientes/${pacienteId}/evolucoes`);
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
