import { marked } from 'marked';

//
// PREPROCESS: Normalisera markdown-input och hantera pil-listor
//
function preprocess(md: string): string {
  if (!md) return '';

  // Ta bort BOM och normalisera radslut
  let s = md.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');

  // Sätt in mellanslag efter rubriker som saknar det (##Rubrik -> ## Rubrik)
  s = s.replace(/^([#]{1,6})([^\s])/gm, '$1 $2');

  // Konvertera pil-listor till markdown-listor
  s = s.replace(/^→\s*/gm, '- ');

  return s;
}

//
// CUSTOM RENDERER (kompatibel med marked@5+)
//
function createCustomRenderer(isRedBox = false): marked.Renderer {
  const renderer = new marked.Renderer();

  renderer.paragraph = (text: string) => `<p>${text}</p>`;

  renderer.heading = (text: string, level: number) => {
    return `<h${level}>${text}</h${level}>`;
  };

  renderer.list = (body: string, ordered: boolean) => {
    return `<${ordered ? 'ol' : 'ul'}>${body}</${ordered ? 'ol' : 'ul'}>`;
  };

  renderer.listitem = (text: string) => `<li>${text}</li>`;

  renderer.link = (href: string, title: string | null, text: string) => {
    const titleAttr = title ? ` title="${title}"` : '';
    return `<a href="${href}"${titleAttr} class="underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
  };

  renderer.strong = (text: string) => `<strong>${text}</strong>`;
  renderer.em = (text: string) => `<em>${text}</em>`;
  renderer.del = (text: string) => `<del>${text}</del>`;
  renderer.codespan = (text: string) => `<code>${text}</code>`;
  renderer.code = (code: string) => `<pre><code>${code}</code></pre>`;
  renderer.html = (html: string) =>
    html.replace(/<u>(.*?)<\/u>/g, '<u class="underline">$1</u>');

  return renderer;
}

//
// EXPORTERA FUNKTIONER
//
export const convertMarkdownToHtml = (markdown: string): string => {
  if (!markdown) return '';

  try {
    const preprocessed = preprocess(markdown);
    return marked.parse(preprocessed, { renderer: createCustomRenderer(false) });
  } catch (err) {
    console.error('Markdown conversion failed:', err);
    return markdown;
  }
};

export const convertMarkdownToHtmlForRedBox = (markdown: string): string => {
  if (!markdown) return '';

  try {
    const preprocessed = preprocess(markdown);
    return marked.parse(preprocessed, { renderer: createCustomRenderer(true) });
  } catch (err) {
    console.error('Markdown (red box) conversion failed:', err);
    return markdown;
  }
};
