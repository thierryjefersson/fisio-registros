import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { PatientTabs } from "@/components/patients/patient-tabs";
import { obterPaciente } from "@/features/patients/queries";

export default async function PatientLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const paciente = await obterPaciente(id);
  if (!paciente) notFound();

  return (
    <>
      <PatientTabs patientId={paciente.id} />
      {children}
    </>
  );
}
