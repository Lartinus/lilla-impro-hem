// src/utils/markdownHelpers.ts

import { marked } from 'marked';

//
// 1) Hjälpfunktion: Extrahera alltid ren text från token eller sträng
//
function getTextContent(input: any): string {
  if (typeof input === 'string') {
    return input;
  }
  if (input == null) {
    return '';
  }
  // Om det är ett token‐objekt med .text‐egenskap
  if (typeof input === 'object' && 'text' in input && typeof input.text === 'string') {
    return input.text;
  }
  // Om det är ett token‐objekt med tokens‐array
  if (typeof input === 'object' && Array.isArray((input as any).tokens)) {
    return (input as any).tokens.map(getTextContent).join('');
  }
  // Fallback: Gör om till sträng
  return String(input);
}

//
// 2) Preprocess: 
//    a) Ta bort BOM och trimma inledande mellanslag
//    b) Sätt in mellanslag efter varje sekvens av 1–6 '#' om det saknas
//    c) Hantera pil‐listor (→) som förut
//
function preprocess(md: string): string {
  if (!md) return '';

  // a) Ta bort eventuell BOM (Byte Order Mark) och trimma inledande mellanslag/ny rad
  let s = md.replace(/^\uFEFF/, '').replace(/^\s+/, '');

  // b) Om rad börjar med 1–6 '#' utan blanksteg efter, lägg till ett blanksteg
  //    Exempel: "###Ett rubrikexempel" -> "### Ett rubrikexempel"
  s = s.replace(/^#{1,6}(?=\S)/gm, (m) => m + ' ');

  // c) Hantera pil‐listor (→ ) på samma sätt som tidigare
  s = s.replace(/^→\s+(.+)$/gm, '→ $1');

  return s;
}

//
// 3) "Normal renderer" (ljus bakgrund, mörk text)
//
function createNormalRenderer(): any {
  const rnd: any = new marked.Renderer();

  rnd.heading = (textToken: any, level: number, raw: string, slugger: any) => {
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

  rnd.paragraph = (textToken: any) => {
    const text = getTextContent(textToken).trim();
    if (text.startsWith('→')) {
      return `<p class="arrow-list-item ml-4 my-2 relative">
                <span class="absolute left-0 font-bold text-blue-500">→</span> 
                ${text.substring(1).trim()}
              </p>`;
    }
    return `<p class="text-gray-800 my-4">${text}</p>`;
  };

  rnd.list = (body: string, ordered: boolean, start: number) => {
    const tag = ordered ? 'ol' : 'ul';
    const cls = ordered ? 'list-decimal' : 'list-disc';
    return `<${tag} class="${cls} ml-6 my-4">${body}</${tag}>`;
  };

  rnd.listitem = (textToken: any) => {
    const text = getTextContent(textToken);
    return `<li class="text-gray-800 my-1">${text}</li>`;
  };

  rnd.link = (href: string, title: string | null, textToken: any) => {
    const text = getTextContent(textToken);
    const titleAttr = title ? ` title="${title}"` : '';
    return `<a href="${href}"${titleAttr} class="text-blue-500 hover:text-blue-700 underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
  };

  rnd.strong = (textToken: any) => {
    const text = getTextContent(textToken);
    return `<strong class="font-bold">${text}</strong>`;
  };

  rnd.em = (textToken: any) => {
    const text = getTextContent(textToken);
    return `<em class="italic">${text}</em>`;
  };

  rnd.codespan = (codeToken: any) => {
    const codeText = getTextContent(codeToken);
    return `<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">${codeText}</code>`;
  };

  rnd.code = (codeToken: any, infostring: string, escaped: boolean) => {
    const codeText = typeof codeToken === 'string' ? codeToken : getTextContent(codeToken);
    return `<pre class="bg-gray-100 p-4 rounded overflow-x-auto my-4"><code class="text-sm">${codeText}</code></pre>`;
  };

  return rnd;
}

//
// 4) "Red box renderer" (röd bakgrund, vit text)
//
function createRedBoxRenderer(): any {
  const rnd: any = new marked.Renderer();

  rnd.heading = (textToken: any, level: number, raw: string, slugger: any) => {
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

  rnd.paragraph = (textToken: any) => {
    const text = getTextContent(textToken).trim();
    if (text.startsWith('→')) {
      return `<p class="arrow-list-item text-white ml-4 my-2 relative">
                <span class="absolute left-0 font-bold text-blue-300">→</span> 
                ${text.substring(1).trim()}
              </p>`;
    }
    return `<p class="text-white my-4">${text}</p>`;
  };

  rnd.list = (body: string, ordered: boolean, start: number) => {
    const tag = ordered ? 'ol' : 'ul';
    const cls = ordered ? 'list-decimal text-white' : 'list-disc text-white';
    return `<${tag} class="${cls} ml-6 my-4">${body}</${tag}>`;
  };

  rnd.listitem = (textToken: any) => {
    const text = getTextContent(textToken);
    return `<li class="text-white my-1">${text}</li>`;
  };

  rnd.link = (href: string, title: string | null, textToken: any) => {
    const text = getTextContent(textToken);
    const titleAttr = title ? ` title="${title}"` : '';
    return `<a href="${href}"${titleAttr} class="text-ljusbla hover:text-ljusbla underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
  };

  rnd.strong = (textToken: any) => {
    const text = getTextContent(textToken);
    return `<strong class="text-white font-bold">${text}</strong>`;
  };

  rnd.em = (textToken: any) => {
    const text = getTextContent(textToken);
    return `<em class="text-white italic">${text}</em>`;
  };

  rnd.codespan = (codeToken: any) => {
    const codeText = getTextContent(codeToken);
    return `<code class="bg-gray-700 px-1 py-0.5 rounded text-sm">${codeText}</code>`;
  };

  rnd.code = (codeToken: any, infostring: string, escaped: boolean) => {
    const codeText = typeof codeToken === 'string' ? codeToken : getTextContent(codeToken);
    return `<pre class="bg-gray-700 p-4 rounded overflow-x-auto my-4"><code class="text-sm">${codeText}</code></pre>`;
  };

  return rnd;
}

//
// 5) Konfigurera marked globalt för normal renderer
//
marked.setOptions({
  gfm: true,
  breaks: true,
  renderer: createNormalRenderer(),
});

//
// 6) Exportera Markdown‐konverteringsfunktionerna
//
export const convertMarkdownToHtml = (markdown: string): string => {
  if (!markdown) return '';
  try {
    // Kör preprocess så att "#" utan blanksteg tolkas korrekt
    const pre = preprocess(markdown);
    return marked(pre) as string;
  } catch (err) {
    console.error('Markdown conversion failed:', err);
    return markdown;
  }
};

export const convertMarkdownToHtmlForRedBox = (markdown: string): string => {
  if (!markdown) return '';
  try {
    // Kör preprocess även för röd box‐innehåll
    const pre = preprocess(markdown);
    const html = marked(pre, { renderer: createRedBoxRenderer() }) as string;
    // Återställ normal renderer efteråt
    marked.setOptions({ renderer: createNormalRenderer() });
    return html;
  } catch (err) {
    console.error('Markdown (red box) conversion failed:', err);
    return markdown;
  }
};