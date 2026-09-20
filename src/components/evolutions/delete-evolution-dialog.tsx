"use client";

import { Trash2 } from "lucide-react";
import { useFormStatus } from "react-dom";

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function DeleteEvolutionDialog({
  action,
  evolutionId,
  patientId,
}: {
  action: (formData: FormData) => void | Promise<void>;
  evolutionId: string;
  patientId: string;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={<Button variant="destructive" type="button" />}
      >
        <Trash2 aria-hidden />
        Excluir
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir evolução?</AlertDialogTitle>
          <AlertDialogDescription>
            Este registro clínico será removido permanentemente. A exclusão só
            ocorrerá ao confirmar esta ação.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose render={<Button variant="outline" />}>
            Cancelar
          </AlertDialogClose>
          <form action={action}>
            <input name="pacienteId" type="hidden" value={patientId} />
            <input name="evolucaoId" type="hidden" value={evolutionId} />
            <DeleteButton />
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <Button disabled={pending} type="submit" variant="destructive">
      {pending ? "Excluindo…" : "Excluir definitivamente"}
    </Button>
  );
}
