
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
  
  // Konfigurera marked för att hantera breaks och HTML
  marked.setOptions({
    gfm: true,
    breaks: true, // Gör att enkla radbryt blir <br>
  });
  
  // Standard parse med GFM aktiverat
  let result = marked.parse(cleaned);
  
  // Hantera både synkron och asynkron marked.parse
  const htmlString = typeof result === 'string' ? result : '';
  
  // Lägg till Satoshi-font för rubriker
  return htmlString
    .replace(/<h1>/g, '<h1 style="font-family: \'Satoshi\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', system-ui, sans-serif;">')
    .replace(/<h2>/g, '<h2 style="font-family: \'Satoshi\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', system-ui, sans-serif;">')
    .replace(/<h3>/g, '<h3 style="font-family: \'Satoshi\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', system-ui, sans-serif;">')
    .replace(/<h4>/g, '<h4 style="font-family: \'Satoshi\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', system-ui, sans-serif;">')
    .replace(/<h5>/g, '<h5 style="font-family: \'Satoshi\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', system-ui, sans-serif;">')
    .replace(/<h6>/g, '<h6 style="font-family: \'Satoshi\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', system-ui, sans-serif;">');
}

/**
 * Samma som ovan, men med line-breaks (== nya <br> på enradiga radslut).
 */
export function convertMarkdownToHtmlForRedBox(markdown: string): string {
  if (!markdown) return '';
  const cleaned = markdown.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  
  // Standard parse med GFM och breaks aktiverat
  let result = marked.parse(cleaned, {
    gfm: true,
    breaks: true,
  });
  
  // Hantera både synkron och asynkron marked.parse
  const htmlString = typeof result === 'string' ? result : '';
  
  // Lägg till Satoshi-font för rubriker
  return htmlString
    .replace(/<h1>/g, '<h1 style="font-family: \'Satoshi\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', system-ui, sans-serif;">')
    .replace(/<h2>/g, '<h2 style="font-family: \'Satoshi\', -apple-system, BlinkMacSystemFont, \'Segue UI\', system-ui, sans-serif;">')
    .replace(/<h3>/g, '<h3 style="font-family: \'Satoshi\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', system-ui, sans-serif;">')
    .replace(/<h4>/g, '<h4 style="font-family: \'Satoshi\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', system-ui, sans-serif;">')
    .replace(/<h5>/g, '<h5 style="font-family: \'Satoshi\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', system-ui, sans-serif;">')
    .replace(/<h6>/g, '<h6 style="font-family: \'Satoshi\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', system-ui, sans-serif;">');
}
