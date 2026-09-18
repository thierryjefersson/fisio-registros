import { describe, expect, it } from "vitest";

import { MARKDOWN_EDITOR_CAPABILITIES } from "./markdown-editor-client";

describe("toolbar do editor Markdown", () => {
  it("expõe exatamente as capacidades previstas no MVP", () => {
    expect(MARKDOWN_EDITOR_CAPABILITIES).toEqual([
      "paragraph",
      "h1",
      "h2",
      "bold",
      "italic",
      "bullet-list",
      "numbered-list",
    ]);
  });
});
