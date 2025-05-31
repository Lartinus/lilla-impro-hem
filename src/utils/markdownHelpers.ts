
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
  // Om input är ett token‐objekt med en .text‐egenskap:
  if (typeof input === 'object' && 'text' in input && typeof input.text === 'string') {
    return input.text;
  }
  // Om det är ett token‐objekt med en tokens‐array
  if (typeof input === 'object' && Array.isArray((input as any).tokens)) {
    return (input as any).tokens.map(getTextContent).join('');
  }
  // Annars fallback till String()
  return String(input);
}

//
// 2) PREPROCESS: 
//    a) Ta bort eventuell BOM (Byte Order Mark)
//    b) Normalisera radslut till Unix-format (\n)
//    c) Sätt in ett blanksteg direkt efter alla "#"-sekvenser som saknar mellanslag
//    d) Formatera pil‐listor (→) oförändrat
//
function preprocess(md: string): string {
  if (!md) return '';

  // a) Ta bort BOM (om det finns)
  let s = md.replace(/^\uFEFF/, '');

  // b) Normalisera Windows‐CRLF (\r\n) och gamla Mac‐CR (\r) till Unix-LF (\n)
  s = s.replace(/\r\n?/g, '\n');

  // c) Infoga blanksteg efter alla "1–6 '#'" som direkt följs av ett icke-blank tecken
  //    (antingen i början av strängen eller efter en newline)
  //
  //    Regex:
  //    (^|\n)     → matcha början av strängen eller efter en '\n'
  //    (#{1,6})   → fånga in 1–6 stycken "#"
  //    (?=\S)     → se till att nästa tecken är icke-blank (d.v.s. text, inte mellanslag)
  //
  //    Ersättning: "$1$2 " → originalt gruppering ('' eller '\n') + '###' + ett extra blanksteg
  //
  s = s.replace(/(^|\n)(#{1,6})(?=\S)/g, '$1$2 ');

  // d) Pil‐listor: se till att vi får "→ text" (inkl. blanksteg efter pilen)
  s = s.replace(/^→\s*(.+)$/gm, '→ $1');

  return s;
}

//
// 3) SKAPA "normal renderer" för ljus bakgrund + mörk text
//
function createNormalRenderer(): any {
  const rnd: any = new marked.Renderer();

  rnd.heading = function(token: any) {
    const text = getTextContent(token.tokens || token.text);
    const level = token.depth;
    const classes: Record<number, string> = {
      1: 'text-2xl font-bold text-gray-800 my-4',
      2: 'text-xl font-bold text-gray-800 mb-3',
      3: 'text-lg font-medium text-theatre-secondary mb-3',
      4: 'text-base font-bold text-gray-800 mb-2',
      5: 'text-base font-semibold text-gray-800 mb-2',
      6: 'text-base font-medium text-gray-800 mb-2',
    };
    const cls = classes[level] || classes[4];
    return `<h${level} class="${cls}">${text}</h${level}>`;
  };

  rnd.paragraph = function(token: any) {
    const text = getTextContent(token.tokens || token.text).trim();
    if (text.startsWith('→')) {
      return `<p class="arrow-list-item ml-4 my-2 relative">
                <span class="absolute left-0 font-bold text-blue-500">→</span>
                ${text.substring(1).trim()}
              </p>`;
    }
    return `<p class="text-gray-800 my-4">${text}</p>`;
  };

  rnd.list = function(token: any) {
    const ordered = token.ordered;
    const items = token.items.map((item: any) => this.listitem(item)).join('');
    const tag = ordered ? 'ol' : 'ul';
    const cls = ordered ? 'list-decimal' : 'list-disc';
    return `<${tag} class="${cls} ml-6 my-4">${items}</${tag}>`;
  };
  
  rnd.listitem = function(token: any) {
    const text = getTextContent(token.tokens || token.text);
    return `<li class="text-gray-800 my-1">${text}</li>`;
  };

  rnd.link = function(token: any) {
    const href = token.href;
    const title = token.title;
    const text = getTextContent(token.tokens || token.text);
    const titleAttr = title ? ` title="${title}"` : '';
    return `<a href="${href}"${titleAttr} class="text-blue-500 hover:text-blue-700 underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
  };

  rnd.strong = function(token: any) {
    const text = getTextContent(token.tokens || token.text);
    return `<strong class="font-bold">${text}</strong>`;
  };

  rnd.em = function(token: any) {
    const text = getTextContent(token.tokens || token.text);
    return `<em class="italic">${text}</em>`;
  };

  rnd.codespan = function(token: any) {
    const codeText = getTextContent(token.text);
    return `<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">${codeText}</code>`;
  };

  rnd.code = function(token: any) {
    const codeText = getTextContent(token.text);
    return `<pre class="bg-gray-100 p-4 rounded overflow-x-auto my-4"><code class="text-sm">${codeText}</code></pre>`;
  };

  return rnd;
}

//
// 4) SKAPA "red‐box renderer" för röd bakgrund + vit text
//
function createRedBoxRenderer(): any {
  const rnd: any = new marked.Renderer();

  rnd.heading = function(token: any) {
    const text = getTextContent(token.tokens || token.text);
    const level = token.depth;
    const classes: Record<number, string> = {
      1: 'text-2xl font-bold text-white my-4',
      2: 'text-xl font-bold text-white mb-3',
      3: 'text-lg font-medium text-white mb-3',
      4: 'text-base font-bold text-white mb-2',
      5: 'text-base font-semibold text-white mb-2',
      6: 'text-base font-medium text-white mb-2',
    };
    const cls = classes[level] || classes[4];
    return `<h${level} class="${cls}">${text}</h${level}>`;
  };

  rnd.paragraph = function(token: any) {
    const text = getTextContent(token.tokens || token.text).trim();
    if (text.startsWith('→')) {
      return `<p class="arrow-list-item text-white ml-4 my-2 relative">
                <span class="absolute left-0 font-bold text-blue-300">→</span>
                ${text.substring(1).trim()}
              </p>`;
    }
    return `<p class="text-white my-4">${text}</p>`;
  };

  rnd.list = function(token: any) {
    const ordered = token.ordered;
    const items = token.items.map((item: any) => this.listitem(item)).join('');
    const tag = ordered ? 'ol' : 'ul';
    const cls = ordered ? 'list-decimal text-white' : 'list-disc text-white';
    return `<${tag} class="${cls} ml-6 my-4">${items}</${tag}>`;
  };
  
  rnd.listitem = function(token: any) {
    const text = getTextContent(token.tokens || token.text);
    return `<li class="text-white my-1">${text}</li>`;
  };

  rnd.link = function(token: any) {
    const href = token.href;
    const title = token.title;
    const text = getTextContent(token.tokens || token.text);
    const titleAttr = title ? ` title="${title}"` : '';
    return `<a href="${href}"${titleAttr} class="text-ljusbla hover:text-ljusbla underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
  };

  rnd.strong = function(token: any) {
    const text = getTextContent(token.tokens || token.text);
    return `<strong class="text-white font-bold">${text}</strong>`;
  };

  rnd.em = function(token: any) {
    const text = getTextContent(token.tokens || token.text);
    return `<em class="text-white italic">${text}</em>`;
  };

  rnd.codespan = function(token: any) {
    const codeText = getTextContent(token.text);
    return `<code class="bg-gray-700 px-1 py-0.5 rounded text-sm">${codeText}</code>`;
  };

  rnd.code = function(token: any) {
    const codeText = getTextContent(token.text);
    return `<pre class="bg-gray-700 p-4 rounded overflow-x-auto my-4"><code class="text-sm">${codeText}</code></pre>`;
  };

  return rnd;
}

//
// 5) KONFIGURERA marked att använda "normal renderer" globalt
//
marked.setOptions({
  gfm: true,
  breaks: true,
  renderer: createNormalRenderer(),
});

//
// 6) EXPORTERA funktioner som omvandlar rå Markdown → korrekt HTML
//
export const convertMarkdownToHtml = (markdown: string): string => {
  if (!markdown) return '';
  try {
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
    const pre = preprocess(markdown);
    const html = marked(pre, { renderer: createRedBoxRenderer() }) as string;
    // Återställ normal renderer för framtida anrop
    marked.setOptions({ renderer: createNormalRenderer() });
    return html;
  } catch (err) {
    console.error('Markdown (red box) conversion failed:', err);
    return markdown;
  }
};
