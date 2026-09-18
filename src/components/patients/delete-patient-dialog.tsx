"use client";

import { useFormStatus } from "react-dom";
import { Trash2 } from "lucide-react";

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

type DeletePatientDialogProps = {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  name: string;
  compact?: boolean;
};

export function DeletePatientDialog({
  action,
  compact = false,
  id,
  name,
}: DeletePatientDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            aria-label={compact ? `Excluir ${name}` : undefined}
            className={compact ? "min-h-10" : "min-h-11 px-5"}
            variant="destructive"
          />
        }
      >
        <Trash2 aria-hidden="true" />
        {compact ? "Excluir" : "Excluir tratamento"}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir tratamento?</AlertDialogTitle>
          <AlertDialogDescription>
            O tratamento de <strong>{name}</strong> será excluído. Avaliações,
            evoluções e cobranças vinculadas também serão removidas. Esta ação
            não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose
            render={<Button className="min-h-10" variant="outline" />}
          >
            Cancelar
          </AlertDialogClose>
          <form action={action}>
            <input name="id" type="hidden" value={id} />
            <DeleteSubmitButton />
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function DeleteSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      className="min-h-10 w-full sm:w-auto"
      disabled={pending}
      type="submit"
      variant="destructive"
    >
      {pending ? "Excluindo..." : "Excluir definitivamente"}
    </Button>
  );
}
