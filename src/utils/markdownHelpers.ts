// src/utils/markdownHelpers.ts

import { marked, Slugger } from 'marked';

//
// 1) Hjälpfunktion som alltid plockar ut en ren sträng från en
//    "text"-parameter som kan vara antingen sträng eller ett objekt.
//
function getTextContent(input: any): string {
  // Om det redan är en sträng, returnera direkt
  if (typeof input === 'string') {
    return input;
  }

  // Om det är ett token-objekt med egenskapen 'text'
  if (typeof input === 'object' && input !== null) {
    // Vissa "text"-token ligger i input.text
    if ('text' in input && typeof input.text === 'string') {
      return input.text;
    }
    // Ibland kan 'tokens' vara en array av under-token
    if ('tokens' in input && Array.isArray(input.tokens)) {
      return input.tokens.map(getTextContent).join('');
    }
  }

  // Fallback: konvertera till sträng så att vi inte returnerar "[object Object]"
  return String(input);
}

//
// 2) Funktion för att preprocessa markdown-strängen (ex. pilar och rubriker)
//
function preprocess(markdown: string): string {
  if (!markdown) return '';
  return markdown
    // Gör om pilar som börjar med "→ " till ett enskilt tecken + text
    .replace(/^→\s+(.+)$/gm, '→ $1')
    // Sätt en blankrad före varje rubrik så att marked får bättre struktur
    .replace(/^(#{1,6})\s+(.+)$/gm, '\n$1 $2\n');
}

//
// 3) Skapa en "normal renderer" (mörk text på ljus bakgrund)
//
function createNormalRenderer(): marked.Renderer {
  const renderer = new marked.Renderer();

  // Rubriker: h1–h6, med Tailwind-klasser för mörk text
  // Signaturen i v5 är heading(text, level, raw, slugger)
  renderer.heading = (textOrToken: any, level: number, raw: string, slugger: Slugger) => {
    const text = getTextContent(textOrToken);
    const sizes: Record<number, string> = {
      1: 'text-2xl font-bold text-gray-800 my-4',
      2: 'text-xl font-bold text-gray-800 mb-3',
      3: 'text-lg font-medium text-theatre-secondary mb-3',
      4: 'text-base font-bold text-gray-800 mb-2',
      5: 'text-base font-semibold text-gray-800 mb-2',
      6: 'text-base font-medium text-gray-800 mb-2',
    };
    const cls = sizes[level] || sizes[4];
    // Slugga adressen för länkar (#anchor) om du vill:
    const idAttr = slugger.slug(text);
    return `<h${level} id="${idAttr}" class="${cls}">${text}</h${level}>`;
  };

  // Paragrafer: kontrollera pilar (→) och normal text
  renderer.paragraph = (textOrToken: any) => {
    const text = getTextContent(textOrToken).trim();
    // Om det börjar med en pil
    if (text.startsWith('→')) {
      return `<p class="arrow-list-item ml-4 my-2 relative"><span class="absolute left-0 font-bold text-blue-500">→</span> ${text.substring(1).trim()}</p>`;
    }
    return `<p class="text-gray-800 my-4">${text}</p>`;
  };

  // Listor och listitems
  renderer.list = (body: string, ordered: boolean) => {
    const tag = ordered ? 'ol' : 'ul';
    const cls = ordered ? 'list-decimal' : 'list-disc';
    return `<${tag} class="${cls} ml-6 my-4">${body}</${tag}>`;
  };
  renderer.listitem = (textOrToken: any) => {
    const text = getTextContent(textOrToken);
    return `<li class="text-gray-800 my-1">${text}</li>`;
  };

  // Länkar
  renderer.link = (href: string, title: string | null, textOrToken: any) => {
    const text = getTextContent(textOrToken);
    const titleAttr = title ? ` title="${title}"` : '';
    return `<a href="${href}"${titleAttr} class="text-blue-500 hover:text-blue-700 underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
  };

  // Kodblock och inline code
  renderer.code = (code: string) => {
    return `<pre class="bg-gray-100 p-4 rounded overflow-x-auto my-4"><code class="text-sm">${code}</code></pre>`;
  };
  renderer.codespan = (code: string) => {
    return `<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">${code}</code>`;
  };

  // Fetstil och kursiv
  renderer.strong = (textOrToken: any) => {
    const text = getTextContent(textOrToken);
    return `<strong class="font-bold">${text}</strong>`;
  };
  renderer.em = (textOrToken: any) => {
    const text = getTextContent(textOrToken);
    return `<em class="italic">${text}</em>`;
  };

  return renderer;
}

//
// 4) Skapa en renderer för röd bakgrund (vit text)
//
function createRedBoxRenderer(): marked.Renderer {
  const renderer = new marked.Renderer();

  renderer.heading = (textOrToken: any, level: number, raw: string, slugger: Slugger) => {
    const text = getTextContent(textOrToken);
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

  renderer.paragraph = (textOrToken: any) => {
    const text = getTextContent(textOrToken).trim();
    if (text.startsWith('→')) {
      return `<p class="arrow-list-item text-white ml-4 my-2 relative"><span class="absolute left-0 font-bold text-blue-300">→</span> ${text.substring(1).trim()}</p>`;
    }
    return `<p class="text-white my-4">${text}</p>`;
  };

  renderer.list = (body: string, ordered: boolean) => {
    const tag = ordered ? 'ol' : 'ul';
    const cls = ordered ? 'list-decimal text-white' : 'list-disc text-white';
    return `<${tag} class="${cls} ml-6 my-4">${body}</${tag}>`;
  };
  renderer.listitem = (textOrToken: any) => {
    const text = getTextContent(textOrToken);
    return `<li class="text-white my-1">${text}</li>`;
  };

  renderer.link = (href: string, title: string | null, textOrToken: any) => {
    const text = getTextContent(textOrToken);
    const titleAttr = title ? ` title="${title}"` : '';
    return `<a href="${href}"${titleAttr} class="text-ljusbla hover:text-ljusbla underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
  };

  renderer.code = (code: string) => {
    return `<pre class="bg-gray-700 p-4 rounded overflow-x-auto my-4"><code class="text-sm">${code}</code></pre>`;
  };
  renderer.codespan = (code: string) => {
    return `<code class="bg-gray-700 px-1 py-0.5 rounded text-sm">${code}</code>`;
  };

  renderer.strong = (textOrToken: any) => {
    const text = getTextContent(textOrToken);
    return `<strong class="text-white font-bold">${text}</strong>`;
  };
  renderer.em = (textOrToken: any) => {
    const text = getTextContent(textOrToken);
    return `<em class="text-white italic">${text}</em>`;
  };

  return renderer;
}

//
// 5) Exportera de två konverteringsfunktionerna
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
    console.error('Markdown conversion (red box) failed:', err);
    return markdown;
  }
};