import { MarkdownViewer } from "@/components/clinical/markdown-viewer";

export function LiveMarkdownPreview({ markdown }: { markdown: string }) {
  return (
    <section
      aria-label="Preview do conteúdo"
      className="min-h-56 rounded-lg border border-border bg-background"
    >
      <div className="border-b border-border bg-muted px-4 py-3">
        <h3 className="text-sm font-semibold">Preview em tempo real</h3>
      </div>
      <div className="px-4 py-3">
        {markdown.trim() ? (
          <MarkdownViewer markdown={markdown} />
        ) : (
          <p className="text-sm text-muted-foreground">
            O conteúdo formatado aparecerá aqui enquanto você digita.
          </p>
        )}
      </div>
    </section>
  );
}
