// src/utils/markdownHelpers.ts

import { marked } from 'marked';

//
// 1) HJÄLPFUNKTION: Extrahera ren text från token eller sträng
//
function getTextContent(input: any): string {
  if (typeof input === 'string') {
    return input;
  }
  if (input == null) {
    return '';
  }
  // Om det är ett token‐objekt med en .text‐egenskap
  if (typeof input === 'object' && 'text' in input && typeof input.text === 'string') {
    return input.text;
  }
  // Om det är ett token‐objekt med en tokens‐array
  if (typeof input === 'object' && Array.isArray((input as any).tokens)) {
    return (input as any).tokens.map(getTextContent).join('');
  }
  // Annars: konvertera till sträng
  return String(input);
}

//
// 2) PREPROCESS: 
//    a) Ta bort BOM, alla inledande osynliga unicode‐tecken (inkl. zero‐width spaces), samt mellanslag/tabbar/ny rad i början
//    b) Normalisera radslut till enbart '\n'
//    c) För varje rad som börjar med 1–6 '#' utan blanksteg efter, sätt in ett blanksteg mellan '##..##' och texten
//    d) Behåll och formatera ev. pil‐listor (→) på samma sätt som tidigare
//
function preprocess(md: string): string {
  if (!md) return '';

  // --- a) Ta bort BOM och inledande osynliga/whitespace‐tecken på hela texten
  //    \uFEFF = BOM, \u200B = zero‐width space, \u00A0 = non‐breaking space, \u200C = zero‐width non‐joiner, etc.
  //    Därefter trimma eventuella mellanslag/tabbar/ny rad i början med ^\s+
  let s = md
    .replace(/^\uFEFF/, '')                       // ta bort BOM om det finns
    .replace(/^[\u200B\u00A0\u200C\u200D]+/, '')   // ta bort zero‐width‐tecken
    .replace(/^\s+/, '');                          // ta bort vanliga mellanslag/tabbar/ny rad i början

  // --- b) Normalisera Windows‐radslut (\r\n) och Mac‐radslut (\r) till Unix‐radslut (\n)
  s = s.replace(/\r\n?/g, '\n');

  // --- c) För varje rad (multiline‐mode), om rad börjar med 1–6 '#' direkt följt av ett icke‐blank tecken,
  //     lägg till ett blanksteg efter ##‐sekvensen. 
  //
  //     Regex‐förklaring:
  //       ^                  → början på raden
  //       (\s*)             → fångar in eventuella (men nu borttagna) mellanslag/tabbar i grupp 1 (tom eller "")
  //       (#{1,6})          → fångar in 1–6 stycken "#" i grupp 2
  //       (?=\S)            → kontrollera att nästa tecken är icke­blank (d.v.s. texten börjar direkt efter "#")
  //     Ersättning: "$1$2 "  → skriv ut exakt grupp1 (kan vara tom), sedan grupp2 (t.ex. "###"), plus ett blanksteg
  //
  s = s.replace(/^(\s*)(#{1,6})(?=\S)/gm, '$1$2 ');

  // --- d) Hantera pil‐listor (→) som tidigare: om rad börjar med "→ " följt av text, behåll.
  s = s.replace(/^→\s+(.+)$/gm, '→ $1');

  return s;
}

//
// 3) SKAPA "NORMAL RENDERER" (ljus bakgrund, mörk text)
//
function createNormalRenderer(): any {
  const rnd: any = new marked.Renderer();

  // Rubriker (<h1>–<h6>) med Tailwind‐klasser för mörk text
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

  // Paragrafer, inkl. pil‐listor
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

  // Punkt‐ och numrerade listor
  rnd.list = (body: string, ordered: boolean, start: number) => {
    const tag = ordered ? 'ol' : 'ul';
    const cls = ordered ? 'list-decimal' : 'list-disc';
    return `<${tag} class="${cls} ml-6 my-4">${body}</${tag}>`;
  };
  rnd.listitem = (textToken: any) => {
    const text = getTextContent(textToken);
    return `<li class="text-gray-800 my-1">${text}</li>`;
  };

  // Länkar
  rnd.link = (href: string, title: string | null, textToken: any) => {
    const text = getTextContent(textToken);
    const titleAttr = title ? ` title="${title}"` : '';
    return `<a href="${href}"${titleAttr} class="text-blue-500 hover:text-blue-700 underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
  };

  // Fetstil
  rnd.strong = (textToken: any) => {
    const text = getTextContent(textToken);
    return `<strong class="font-bold">${text}</strong>`;
  };

  // Kursiv
  rnd.em = (textToken: any) => {
    const text = getTextContent(textToken);
    return `<em class="italic">${text}</em>`;
  };

  // Inline‐kod
  rnd.codespan = (codeToken: any) => {
    const codeText = getTextContent(codeToken);
    return `<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">${codeText}</code>`;
  };

  // Kodblock
  rnd.code = (codeToken: any, infostring: string, escaped: boolean) => {
    const codeText = typeof codeToken === 'string' ? codeToken : getTextContent(codeToken);
    return `<pre class="bg-gray-100 p-4 rounded overflow-x-auto my-4"><code class="text-sm">${codeText}</code></pre>`;
  };

  return rnd;
}

//
// 4) SKAPA "RED BOX RENDERER" (röd bakgrund, vit text)
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
// 5) KONFIGURERA marked globalt för "normal renderer"
//
marked.setOptions({
  gfm: true,
  breaks: true,
  renderer: createNormalRenderer(),
});

//
// 6) EXPORTERA två Markdown‐konverterande funktioner
//
export const convertMarkdownToHtml = (markdown: string): string => {
  if (!markdown) return '';
  try {
    // Kör preprocess så att "###Ett" → "### Ett"
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
    // Gör preprocess även för röd box
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