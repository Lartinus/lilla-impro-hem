import { marked } from 'marked';

//
// PREPROCESS: Normalisera markdown-input och hantera pil-listor
//
function preprocess(md: string): string {
  if (!md) return '';

  // Ta bort BOM och normalisera radslut
  let s = md.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');

  // Sätt in mellanslag efter rubriker som saknar det (##Rubrik -> ## Rubrik)
  s = s.replace(/^([#]{1,6})([^\s#])/gm, '$1 $2'); // <- fixad regex!

  // Konvertera pil-listor till markdown-listor
  s = s.replace(/^→\s*/gm, '- ');

  return s;
}

//
// CUSTOM RENDERER (kompatibel med marked@5+)
//
function createCustomRenderer(isRedBox = false) {
  const wrapperTextClass = isRedBox ? 'rich-text rich-text-redbox' : 'rich-text';

  return {
    extensions: [
      {
        name: 'custom-renderer',
        renderer: {
          heading(text: string, level: number) {
            return `<h${level}>${text}</h${level}>`;
          },
          paragraph(text: string) {
            return `<p>${text}</p>`;
          },
          list(body: string, ordered: boolean) {
            return `<${ordered ? 'ol' : 'ul'}>${body}</${ordered ? 'ol' : 'ul'}>`;
          },
          listitem(text: string) {
            return `<li>${text}</li>`;
          },
          link(href: string, title: string | null, text: string) {
            const titleAttr = title ? ` title="${title}"` : '';
            return `<a href="${href}"${titleAttr} class="underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
          },
          strong(text: string) {
            return `<strong>${text}</strong>`;
          },
          em(text: string) {
            return `<em>${text}</em>`;
          },
          del(text: string) {
            return `<del>${text}</del>`;
          },
          codespan(text: string) {
            return `<code>${text}</code>`;
          },
          code(code: string) {
            return `<pre><code>${code}</code></pre>`;
          },
          html(html: string) {
            return html.replace(/<u>(.*?)<\/u>/g, '<u class="underline">$1</u>');
          }
        }
      }
    ]
  };
}

//
// EXPORTERA FUNKTIONER
//
export const convertMarkdownToHtml = (markdown: string): string => {
  if (!markdown) return '';

  try {
    const preprocessed = preprocess(markdown);
    const localMarked = new marked.Marked(); // ← Isolerad instans
    localMarked.use(createCustomRenderer(false));
    return localMarked.parse(preprocessed);
  } catch (err) {
    console.error('Markdown conversion failed:', err);
    return markdown;
  }
};

export const convertMarkdownToHtmlForRedBox = (markdown: string): string => {
  if (!markdown) return '';

  try {
    const preprocessed = preprocess(markdown);
    const localMarked = new marked.Marked(); // ← Isolerad instans
    localMarked.use(createCustomRenderer(true));
    return localMarked.parse(preprocessed);
  } catch (err) {
    console.error('Markdown (red box) conversion failed:', err);
    return markdown;
  }
};
