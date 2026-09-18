"use client";

import dynamic from "next/dynamic";

const MarkdownEditorClient = dynamic(
  () =>
    import("./markdown-editor-client").then((mod) => mod.MarkdownEditorClient),
  {
    loading: () => (
      <div className="min-h-56 animate-pulse rounded-lg border bg-muted" />
    ),
    ssr: false,
  },
);

export type MarkdownEditorProps = {
  ariaLabel: string;
  markdown: string;
  onChange: (markdown: string) => void;
};

export function MarkdownEditor(props: MarkdownEditorProps) {
  return <MarkdownEditorClient {...props} />;
}
