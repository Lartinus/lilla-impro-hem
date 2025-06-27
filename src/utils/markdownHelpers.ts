// src/utils/markdownHelpers.ts
import { marked } from 'marked';

/**
 * Konverterar en markdown-sträng till HTML.
 * @param markdown Rå markdown-text
 * @returns HTML-sträng
 */
export function convertMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';
  // Ta bort eventuell BOM och normalisera radslut
  const cleaned = markdown.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  // Standard parse utan avancerade extensions
  return marked.parse(cleaned, {
    gfm: true,
    breaks: false,
  });
}

/**
 * Samma som ovan, men med line-breaks (== nya <br> på enradiga radslut).
 */
export function convertMarkdownToHtmlForRedBox(markdown: string): string {
  if (!markdown) return '';
  const cleaned = markdown.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  return marked.parse(cleaned, {
    gfm: true,
    breaks: true,
  });
}
