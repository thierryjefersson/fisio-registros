import { describe, expect, it } from "vitest";

import { criarPayloadCopiaFormatada, criarPayloadCopiaMarkdown } from "./copy";

describe("payloads de cópia", () => {
  it("mantém o Markdown original no modo texto puro", () => {
    const markdown = "# Avaliação\n\n**Dor** no ombro";
    expect(criarPayloadCopiaMarkdown(markdown)).toEqual({
      plainText: markdown,
    });
  });

  it("produz HTML e fallback Markdown no modo formatado", () => {
    expect(
      criarPayloadCopiaFormatada("**Dor**", "<p><strong>Dor</strong></p>"),
    ).toEqual({
      html: "<p><strong>Dor</strong></p>",
      plainText: "**Dor**",
    });
  });
});
