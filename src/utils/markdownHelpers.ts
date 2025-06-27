// src/utils/markdownHelpers.ts
import { marked } from 'marked';

//
// PREPROCESS: normalisera input och pilar till riktiga markdown-listor
//
function preprocess(md: string): string {
  if (!md) return '';
  // Ta bort BOM och normalisera radslut
  let s = md.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  // Sätt in mellanslag efter rubrik-tecken (##Rubrik → ## Rubrik)
  s = s.replace(/^([#]{1,6})([^\s])/gm, '$1 $2');
  // Pil-listor → riktiga markdown-listor
  s = s.replace(/^→\s*/gm, '- ');
  return s;
}

//
// Skapa en egen renderer för marked@5+
//
function createCustomRenderer(isRedBox = false): marked.MarkedOptions {
  const renderer = new marked.Renderer();

  // Rubriker
  renderer.heading = (text, level) => {
    return `<h${level}>${text}</h${level}>`;
  };

  // Paragrafer
  renderer.paragraph = (text) => {
    return `<p>${text}</p>`;
  };

  // Listor
  renderer.list = (body, ordered) => {
    const tag = ordered ? 'ol' : 'ul';
    return `<${tag}>${body}</${tag}>`;
  };
  renderer.listitem = (text) => {
    return `<li>${text}</li>`;
  };

  // Länkar
  renderer.link = (href, title, text) => {
    const titleAttr = title ? ` title="${title}"` : '';
    return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
  };

  // Fet, kursiv, strike
  renderer.strong = (text) => `<strong>${text}</strong>`;
  renderer.em = (text) => `<em>${text}</em>`;
  renderer.del = (text) => `<del>${text}</del>`;

  // Kod inline & block
  renderer.codespan = (code) => `<code>${code}</code>`;
  renderer.code = (code, infostring, escaped) => `<pre><code>${code}</code></pre>`;

  // Rå HTML
  renderer.html = (html) => html.replace(/<u>(.*?)<\/u>/g, '<u class="underline">$1</u>');

  return { renderer };
}

//
// EXPORTERA två funktioner för vanlig text respektive “red box”
//
export function convertMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';
  // 1) normalisera
  const pre = preprocess(markdown);
  // 2) registrera renderer
  marked.use(createCustomRenderer(false));
  // 3) parse
  return marked.parse(pre);
}

export function convertMarkdownToHtmlForRedBox(markdown: string): string {
  if (!markdown) return '';
  const pre = preprocess(markdown);
  marked.use(createCustomRenderer(true));
  return marked.parse(pre);
}
