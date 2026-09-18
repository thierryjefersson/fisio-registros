"use client";

import { useRef } from "react";
import { toast } from "sonner";

import { MarkdownViewer } from "@/components/clinical/markdown-viewer";
import { Button } from "@/components/ui/button";
import {
  criarPayloadCopiaFormatada,
  criarPayloadCopiaMarkdown,
} from "@/features/clinical-documents/copy";

export function CopyContentActions({ markdown }: { markdown: string }) {
  const formattedRef = useRef<HTMLDivElement>(null);

  async function copiarMarkdown() {
    try {
      const payload = criarPayloadCopiaMarkdown(markdown);
      await navigator.clipboard.writeText(payload.plainText);
      toast.success("Markdown copiado.");
    } catch {
      toast.error(
        "Não foi possível copiar o Markdown. Verifique a permissão do navegador.",
      );
    }
  }

  async function copiarFormatado() {
    try {
      if (!formattedRef.current || typeof ClipboardItem === "undefined") {
        throw new Error("Clipboard API indisponível");
      }
      const payload = criarPayloadCopiaFormatada(
        markdown,
        formattedRef.current.innerHTML,
      );
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([payload.html], { type: "text/html" }),
          "text/plain": new Blob([payload.plainText], { type: "text/plain" }),
        }),
      ]);
      toast.success("Conteúdo formatado copiado.");
    } catch {
      toast.error(
        "Não foi possível copiar o conteúdo formatado. Verifique a permissão do navegador.",
      );
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={copiarMarkdown} type="button" variant="outline">
        Copiar Markdown
      </Button>
      <Button onClick={copiarFormatado} type="button" variant="outline">
        Copiar formatado
      </Button>
      <div aria-hidden className="hidden" ref={formattedRef}>
        <MarkdownViewer markdown={markdown} />
      </div>
    </div>
  );
}
