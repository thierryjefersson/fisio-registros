"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { idPacienteValido } from "@/features/patients/queries";
import { validarDataCivil } from "@/lib/dates";

import type { BillingActionState } from "./action-state";
import { BillingError } from "./errors";
import {
  atualizarStatusCobranca,
  excluirCobranca,
  gerarCobranca,
} from "./service";

export async function gerarCobrancaAction(
  _state: BillingActionState,
  formData: FormData,
): Promise<BillingActionState> {
  const pacienteId = String(formData.get("pacienteId") ?? "");
  if (!idPacienteValido(pacienteId)) {
    return { formError: "O paciente informado é inválido." };
  }

  try {
    await gerarCobranca(pacienteId);
    invalidarFinanceiro(pacienteId);
    redirect(`/pacientes/${pacienteId}/financeiro?criada=1`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      formError: mensagemErro(error, "Não foi possível gerar a cobrança."),
    };
  }
}

export async function marcarCobrancaPagaAction(
  _state: BillingActionState,
  formData: FormData,
): Promise<BillingActionState> {
  const pacienteId = String(formData.get("pacienteId") ?? "");
  const cobrancaId = String(formData.get("cobrancaId") ?? "");
  const dataPagamento = String(formData.get("dataPagamento") ?? "");

  if (!validarDataCivil(dataPagamento)) {
    return { fieldErrors: { dataPagamento: ["Data de pagamento inválida."] } };
  }

  try {
    await atualizarStatusCobranca({
      cobrancaId,
      dataPagamento,
      pacienteId,
      status: "PAGA",
    });
    invalidarFinanceiro(pacienteId);
    redirect(`/pacientes/${pacienteId}/financeiro?paga=1`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      formError: mensagemErro(error, "Não foi possível registrar o pagamento."),
    };
  }
}

export async function reabrirCobrancaAction(formData: FormData) {
  const pacienteId = String(formData.get("pacienteId") ?? "");
  const cobrancaId = String(formData.get("cobrancaId") ?? "");
  try {
    await atualizarStatusCobranca({
      cobrancaId,
      pacienteId,
      status: "PENDENTE",
    });
    invalidarFinanceiro(pacienteId);
    redirect(`/pacientes/${pacienteId}/financeiro?reaberta=1`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    redirect(`/pacientes/${pacienteId}/financeiro?erro=reabertura`);
  }
}

export async function excluirCobrancaAction(formData: FormData) {
  const pacienteId = String(formData.get("pacienteId") ?? "");
  const cobrancaId = String(formData.get("cobrancaId") ?? "");
  try {
    const resultado = await excluirCobranca(pacienteId, cobrancaId);
    invalidarFinanceiro(pacienteId);
    redirect(
      `/pacientes/${pacienteId}/financeiro?${resultado === "deleted" ? "excluida=1" : "erro=nao-encontrada"}`,
    );
  } catch (error) {
    if (isRedirectError(error)) throw error;
    redirect(`/pacientes/${pacienteId}/financeiro?erro=exclusao`);
  }
}

function invalidarFinanceiro(pacienteId: string) {
  revalidatePath("/");
  revalidatePath(`/pacientes/${pacienteId}/financeiro`);
  revalidatePath("/financeiro");
}

function mensagemErro(error: unknown, fallback: string) {
  if (error instanceof BillingError) return error.message;
  console.error(fallback, error);
  return `${fallback} Tente novamente.`;
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
