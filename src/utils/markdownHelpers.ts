// src/utils/markdownHelpers.ts

import { marked } from 'marked';

//
// 1) Hjälpfunktion: Utvinn alltid ren text från en token eller sträng
//
function getTextContent(input: any): string {
  if (typeof input === 'string') {
    return input;
  }
  if (input == null) {
    return '';
  }
  // Om input har .text-egenskap
  if (typeof input === 'object' && 'text' in input && typeof input.text === 'string') {
    return input.text;
  }
  // Om input har tokens-array, slå ihop alla
  if (typeof input === 'object' && Array.isArray((input as any).tokens)) {
    return (input as any).tokens.map(getTextContent).join('');
  }
  // Fallback
  return String(input);
}

//
// 2) Preprocess: Lägg till blankrad före rubriker, hantera pil-listor
//
function preprocess(markdown: string): string {
  if (!markdown) return '';
  return markdown
    .replace(/^→\s+(.+)$/gm, '→ $1')
    .replace(/^(#{1,6})\s+(.+)$/gm, '\n$1 $2\n');
}

//
// 3) Skapa "normal" renderer (ljus bakgrund, mörk text)
//
function createNormalRenderer(): any {
  const renderer: any = new marked.Renderer();

  renderer.heading = (textToken: any, level: number, raw: string, slugger: any) => {
    const text = getTextContent(textToken);
    const sizes: Record<number, string> = {
      1: 'text-2xl font-bold text-gray-800 my-4',
      2: 'text-xl font-bold text-gray-800 mb-3',
      3: 'text-lg font-medium text-theatre-secondary mb-3',
      4: 'text-base font-bold text-gray-800 mb-2',
      5: 'text-base font-semibold text-gray-800 mb-2',
      6: 'text-base font-medium text-gray-800 mb-2',
    };
    const cls = sizes[level] || sizes[4];
    const idAttr = slugger.slug(text);
    return `<h${level} id="${idAttr}" class="${cls}">${text}</h${level}>`;
  };

  renderer.paragraph = (textToken: any) => {
    const text = getTextContent(textToken).trim();
    if (text.startsWith('→')) {
      return `<p class="arrow-list-item ml-4 my-2 relative"><span class="absolute left-0 font-bold text-blue-500">→</span> ${
        text.substring(1).trim()
      }</p>`;
    }
    return `<p class="text-gray-800 my-4">${text}</p>`;
  };

  renderer.list = (body: string, ordered: boolean, start: number) => {
    const tag = ordered ? 'ol' : 'ul';
    const cls = ordered ? 'list-decimal' : 'list-disc';
    return `<${tag} class="${cls} ml-6 my-4">${body}</${tag}>`;
  };

  renderer.listitem = (textToken: any) => {
    const text = getTextContent(textToken);
    return `<li class="text-gray-800 my-1">${text}</li>`;
  };

  renderer.link = (href: string, title: string | null, textToken: any) => {
    const text = getTextContent(textToken);
    const titleAttr = title ? ` title="${title}"` : '';
    return `<a href="${href}"${titleAttr} class="text-blue-500 hover:text-blue-700 underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
  };

  renderer.strong = (textToken: any) => {
    const text = getTextContent(textToken);
    return `<strong class="font-bold">${text}</strong>`;
  };

  renderer.em = (textToken: any) => {
    const text = getTextContent(textToken);
    return `<em class="italic">${text}</em>`;
  };

  renderer.codespan = (codeToken: any) => {
    const codeText = getTextContent(codeToken);
    return `<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">${codeText}</code>`;
  };

  renderer.code = (codeToken: any, infostring: string, escaped: boolean) => {
    const codeText = typeof codeToken === 'string' ? codeToken : getTextContent(codeToken);
    return `<pre class="bg-gray-100 p-4 rounded overflow-x-auto my-4"><code class="text-sm">${codeText}</code></pre>`;
  };

  return renderer;
}

//
// 4) Skapa "red box" renderer (röd bakgrund, vit text)
//
function createRedBoxRenderer(): any {
  const renderer: any = new marked.Renderer();

  renderer.heading = (textToken: any, level: number, raw: string, slugger: any) => {
    const text = getTextContent(textToken);
    const sizes: Record<number, string> = {
      1: 'text-2xl font-bold text-white my-4',
      2: 'text-xl font-bold text-white mb-3',
      3: 'text-lg font-medium text-white mb-3',
      4: 'text-base font-bold text-white mb-2',
      5: 'text-base font-semibold text-white mb-2',
      6: 'text-base font-medium text-white mb-2',
    };
    const cls = sizes[level] || sizes[4];
    const idAttr = slugger.slug(text);
    return `<h${level} id="${idAttr}" class="${cls}">${text}</h${level}>`;
  };

  renderer.paragraph = (textToken: any) => {
    const text = getTextContent(textToken).trim();
    if (text.startsWith('→')) {
      return `<p class="arrow-list-item text-white ml-4 my-2 relative"><span class="absolute left-0 font-bold text-blue-300">→</span> ${
        text.substring(1).trim()
      }</p>`;
    }
    return `<p class="text-white my-4">${text}</p>`;
  };

  renderer.list = (body: string, ordered: boolean, start: number) => {
    const tag = ordered ? 'ol' : 'ul';
    const cls = ordered ? 'list-decimal text-white' : 'list-disc text-white';
    return `<${tag} class="${cls} ml-6 my-4">${body}</${tag}>`;
  };

  renderer.listitem = (textToken: any) => {
    const text = getTextContent(textToken);
    return `<li class="text-white my-1">${text}</li>`;
  };

  renderer.link = (href: string, title: string | null, textToken: any) => {
    const text = getTextContent(textToken);
    const titleAttr = title ? ` title="${title}"` : '';
    return `<a href="${href}"${titleAttr} class="text-ljusbla hover:text-ljusbla underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
  };

  renderer.strong = (textToken: any) => {
    const text = getTextContent(textToken);
    return `<strong class="text-white font-bold">${text}</strong>`;
  };

  renderer.em = (textToken: any) => {
    const text = getTextContent(textToken);
    return `<em class="text-white italic">${text}</em>`;
  };

  renderer.codespan = (codeToken: any) => {
    const codeText = getTextContent(codeToken);
    return `<code class="bg-gray-700 px-1 py-0.5 rounded text-sm">${codeText}</code>`;
  };

  renderer.code = (codeToken: any, infostring: string, escaped: boolean) => {
    const codeText = typeof codeToken === 'string' ? codeToken : getTextContent(codeToken);
    return `<pre class="bg-gray-700 p-4 rounded overflow-x-auto my-4"><code class="text-sm">${codeText}</code></pre>`;
  };

  return renderer;
}

//
// 5) Exportera Markdown-konverteringsfunktionerna
//
export const convertMarkdownToHtml = (markdown: string): string => {
  if (!markdown) return '';
  try {
    const pre = preprocess(markdown);
    return marked(pre, { renderer: createNormalRenderer() });
  } catch (err) {
    console.error('Markdown conversion failed:', err);
    return markdown;
  }
};

export const convertMarkdownToHtmlForRedBox = (markdown: string): string => {
  if (!markdown) return '';
  try {
    const pre = preprocess(markdown);
    return marked(pre, { renderer: createRedBoxRenderer() });
  } catch (err) {
    console.error('Markdown (red box) conversion failed:', err);
    return markdown;
  }
};