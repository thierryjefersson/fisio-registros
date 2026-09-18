export function criarPayloadCopiaMarkdown(markdown: string) {
  return { plainText: markdown };
}

export function criarPayloadCopiaFormatada(markdown: string, html: string) {
  return { html, plainText: markdown };
}
