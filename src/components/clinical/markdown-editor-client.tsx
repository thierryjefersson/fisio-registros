"use client";

import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  headingsPlugin,
  listsPlugin,
  ListsToggle,
  MDXEditor,
  toolbarPlugin,
} from "@mdxeditor/editor";

import type { MarkdownEditorProps } from "./markdown-editor";

import "@mdxeditor/editor/style.css";

export const MARKDOWN_EDITOR_CAPABILITIES = [
  "paragraph",
  "h1",
  "h2",
  "bold",
  "italic",
  "bullet-list",
  "numbered-list",
] as const;

export function MarkdownEditorClient({
  ariaLabel,
  markdown,
  onChange,
}: MarkdownEditorProps) {
  return (
    <div aria-label={ariaLabel} className="clinical-markdown-editor">
      <MDXEditor
        className="rounded-lg border border-input bg-background"
        contentEditableClassName="min-h-48 px-4 py-3 text-sm leading-7 focus:outline-none"
        markdown={markdown}
        onChange={onChange}
        placeholder="Digite o conteúdo clínico…"
        plugins={[
          headingsPlugin({ allowedHeadingLevels: [1, 2] }),
          listsPlugin(),
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <BlockTypeSelect />
                <BoldItalicUnderlineToggles options={["Bold", "Italic"]} />
                <ListsToggle options={["bullet", "number"]} />
              </>
            ),
          }),
        ]}
      />
    </div>
  );
}
