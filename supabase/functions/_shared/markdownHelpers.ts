import { marked } from 'npm:marked@13.0.2';

/**
 * Sanitize markdown content before conversion
 */
function sanitizeMarkdownContent(markdown: string): string {
  return markdown
    .replace(/<script[\s\S]*?<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '') // Remove iframes
    .replace(/<object[\s\S]*?<\/object>/gi, '') // Remove objects
    .replace(/<embed[\s\S]*?>/gi, ''); // Remove embeds
}

/**
 * Sanitize HTML content for email templates
 */
function sanitizeEmailContent(html: string): string {
  // Basic sanitization for email content
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

/**
 * Konverterar en markdown-sträng till HTML.
 * @param markdown Rå markdown-text
 * @returns HTML-sträng
 */
export function convertMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';
  
  // Ta bort eventuell BOM och normalisera radslut
  const cleaned = sanitizeMarkdownContent(markdown.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n'));
  
  // Konfigurera marked för att hantera breaks och HTML
  marked.setOptions({
    gfm: true,
    breaks: true, // Gör att enkla radbryt blir <br>
  });
  
  // Standard parse med GFM aktiverat
  let result = marked.parse(cleaned);
  
  // Hantera både synkron och asynkron marked.parse
  const htmlString = typeof result === 'string' ? result : '';
  
  // Lägg till email-friendly styling för rubriker
  const styledHtml = htmlString
    .replace(/<h1>/g, '<h1 style="font-family: \'Satoshi\', Arial, sans-serif; font-size: 24px; color: #333333 !important; margin: 0 0 20px 0; font-weight: 700;">')
    .replace(/<h2>/g, '<h2 style="font-family: \'Satoshi\', Arial, sans-serif; font-size: 20px; color: #333333 !important; margin: 0 0 16px 0; font-weight: 700;">')
    .replace(/<h3>/g, '<h3 style="font-family: \'Satoshi\', Arial, sans-serif; font-size: 18px; color: #333333 !important; margin: 0 0 12px 0; font-weight: 700;">')
    .replace(/<h4>/g, '<h4 style="font-family: \'Satoshi\', Arial, sans-serif; font-size: 16px; color: #333333 !important; margin: 0 0 12px 0; font-weight: 700;">')
    .replace(/<h5>/g, '<h5 style="font-family: \'Satoshi\', Arial, sans-serif; font-size: 14px; color: #333333 !important; margin: 0 0 12px 0; font-weight: 700;">')
    .replace(/<h6>/g, '<h6 style="font-family: \'Satoshi\', Arial, sans-serif; font-size: 12px; color: #333333 !important; margin: 0 0 12px 0; font-weight: 700;">')
    .replace(/<p>/g, '<p style="font-family: \'Satoshi\', Arial, sans-serif; font-size: 16px; color: #333333 !important; margin: 0 0 16px 0; line-height: 1.6;">')
    .replace(/<strong>/g, '<strong style="font-weight: 700; color: #333333 !important;">')
    .replace(/<em>/g, '<em style="font-style: italic; color: #333333 !important;">');
  
  return sanitizeEmailContent(styledHtml);
}