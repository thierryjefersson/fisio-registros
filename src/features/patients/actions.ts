"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { dataCivilParaDate, validarDataCivil } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

import type { PatientActionState } from "./action-state";
import {
  obterErrosDeValidacao,
  pacienteSchema,
  type PacienteInput,
} from "./schemas";
import type { DischargeActionState } from "./discharge-action-state";
import { concluirAlta } from "./discharge-service";
import { excluirPacientePorId, idPacienteValido } from "./queries";

function formDataParaObjeto(formData: FormData) {
  return {
    nome: String(formData.get("nome") ?? ""),
    dataNascimento: String(formData.get("dataNascimento") ?? ""),
    sexo: String(formData.get("sexo") ?? ""),
    telefone: String(formData.get("telefone") ?? ""),
    endereco: String(formData.get("endereco") ?? ""),
    nomeResponsavel: String(formData.get("nomeResponsavel") ?? ""),
    patologia: String(formData.get("patologia") ?? ""),
    queixaPrincipal: String(formData.get("queixaPrincipal") ?? ""),
    valorSessao: String(formData.get("valorSessao") ?? ""),
    dataInicio: String(formData.get("dataInicio") ?? ""),
    previsaoSessoes: String(formData.get("previsaoSessoes") ?? ""),
    diasAtendimento: formData.getAll("diasAtendimento").map(String),
  };
}

function dadosParaPrisma(dados: PacienteInput) {
  return {
    nome: dados.nome,
    dataNascimento: dataCivilParaDate(dados.dataNascimento),
    sexo: dados.sexo,
    telefone: dados.telefone,
    endereco: dados.endereco,
    nomeResponsavel: dados.nomeResponsavel,
    patologia: dados.patologia,
    queixaPrincipal: dados.queixaPrincipal,
    valorSessao: dados.valorSessao,
    dataInicio: dataCivilParaDate(dados.dataInicio),
    previsaoSessoes: dados.previsaoSessoes,
    diasAtendimento: dados.diasAtendimento,
  };
}

function validarFormData(formData: FormData) {
  const resultado = pacienteSchema.safeParse(formDataParaObjeto(formData));
  if (!resultado.success) {
    return { erros: obterErrosDeValidacao(resultado.error) };
  }

  return { dados: resultado.data };
}

export async function criarPaciente(
  _estadoAnterior: PatientActionState,
  formData: FormData,
): Promise<PatientActionState> {
  const validacao = validarFormData(formData);
  if (validacao.erros) {
    return { fieldErrors: validacao.erros };
  }

  try {
    const paciente = await prisma.paciente.create({
      data: dadosParaPrisma(validacao.dados),
    });
    revalidatePath("/");
    revalidatePath("/pacientes");
    redirect(`/pacientes/${paciente.id}?salvo=1`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    console.error("Falha ao criar paciente", error);
    return {
      formError: "Não foi possível salvar o tratamento. Tente novamente.",
    };
  }
}

export async function atualizarPaciente(
  _estadoAnterior: PatientActionState,
  formData: FormData,
): Promise<PatientActionState> {
  const id = String(formData.get("id") ?? "");
  if (!id) {
    return { formError: "Tratamento não informado." };
  }

  const validacao = validarFormData(formData);
  if (validacao.erros) {
    return { fieldErrors: validacao.erros };
  }

  try {
    await prisma.paciente.update({
      where: { id },
      data: dadosParaPrisma(validacao.dados),
    });
    revalidatePath("/pacientes");
    revalidatePath(`/pacientes/${id}`);
    redirect(`/pacientes/${id}?salvo=1`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    console.error("Falha ao atualizar paciente", error);
    return {
      formError: "Não foi possível atualizar o tratamento. Tente novamente.",
    };
  }
}

export async function excluirPacienteAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  try {
    const resultado = await excluirPacientePorId(id);
    revalidatePath("/");
    revalidatePath("/pacientes");
    redirect(
      resultado === "deleted"
        ? "/pacientes?excluido=1"
        : "/pacientes?erro=nao-encontrado",
    );
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Falha ao excluir paciente", error);
    redirect("/pacientes?erro=exclusao");
  }
}

export async function darAltaPacienteAction(
  _estadoAnterior: DischargeActionState,
  formData: FormData,
): Promise<DischargeActionState> {
  const pacienteId = String(formData.get("pacienteId") ?? "");
  const dataAlta = String(formData.get("dataAlta") ?? "");
  const confirmarSessoesNaoCobradas =
    formData.get("confirmarSessoesNaoCobradas") === "true";

  if (!idPacienteValido(pacienteId)) {
    return { formError: "O paciente informado é inválido." };
  }
  if (!validarDataCivil(dataAlta)) {
    return { fieldErrors: { dataAlta: ["Data da alta inválida."] } };
  }

  try {
    const resultado = await concluirAlta({
      confirmarSessoesNaoCobradas,
      dataAlta,
      pacienteId,
    });
    if (resultado.status === "unbilled_sessions") {
      return { unbilledSessions: resultado.count };
    }
    if (resultado.status === "not_found") {
      return { formError: "O paciente não foi encontrado." };
    }

    revalidatePath("/");
    revalidatePath("/pacientes");
    revalidatePath(`/pacientes/${pacienteId}`);
    redirect(`/pacientes/${pacienteId}?alta=1`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Falha ao concluir alta", error);
    return { formError: "Não foi possível concluir a alta. Tente novamente." };
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
