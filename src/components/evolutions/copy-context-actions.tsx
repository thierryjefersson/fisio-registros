"use client";

import { ChevronDown, ClipboardCopy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function CopyContextActions({
  completeContext,
  recentContext,
}: {
  completeContext: string;
  recentContext: string;
}) {
  async function copy(content: string, successMessage: string) {
    try {
      await navigator.clipboard.writeText(content);
      toast.success(successMessage);
    } catch {
      toast.error(
        "Não foi possível copiar o contexto. Verifique a permissão do navegador.",
      );
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button className="min-h-11 px-5" variant="outline" />}
      >
        <ClipboardCopy aria-hidden />
        Copiar contexto
        <ChevronDown aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() => copy(recentContext, "Contexto recente copiado.")}
        >
          Últimas 5 evoluções
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => copy(completeContext, "Contexto completo copiado.")}
        >
          Contexto completo
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
