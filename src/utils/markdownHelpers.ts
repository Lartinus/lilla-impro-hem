
import { marked } from 'marked';

//
// 1) Hjälpfunktion: Extrahera alltid ren text från token eller sträng
//
function getTextContent(input: any): string {
  console.log('getTextContent called with:', typeof input, input);
  
  // Om input redan är en sträng, returnera den direkt
  if (typeof input === 'string') {
    return input;
  }
  
  // Om input är null/undefined
  if (input == null) {
    return '';
  }
  
  // Om input är ett tal eller boolean, konvertera till sträng
  if (typeof input === 'number' || typeof input === 'boolean') {
    return String(input);
  }
  
  // Om input är en array, slå samman alla element
  if (Array.isArray(input)) {
    return input.map(item => getTextContent(item)).join('');
  }
  
  // Om input är ett objekt (token från marked.js)
  if (typeof input === 'object') {
    // För marked.js tokens - försök olika strategier
    
    // 1. Om det är en text-token
    if (input.type === 'text' && input.text) {
      return input.text;
    }
    
    // 2. Om det har raw-text
    if (input.raw && typeof input.raw === 'string') {
      return input.raw;
    }
    
    // 3. Om det har vanlig text-egenskap
    if (input.text && typeof input.text === 'string') {
      return input.text;
    }
    
    // 4. Om objektet har tokens (nested tokens) - rekursivt hantera
    if (input.tokens && Array.isArray(input.tokens)) {
      return input.tokens.map((token: any) => getTextContent(token)).join('');
    }
    
    // 5. För strong/em tokens
    if ((input.type === 'strong' || input.type === 'em') && input.tokens) {
      return getTextContent(input.tokens);
    }
    
    // 6. För link tokens
    if (input.type === 'link') {
      return input.tokens ? getTextContent(input.tokens) : (input.text || input.href || '');
    }
    
    // 7. För code tokens
    if (input.type === 'codespan' || input.type === 'code') {
      return input.text || input.raw || '';
    }
    
    // 8. För image tokens
    if (input.type === 'image') {
      return input.text || input.title || input.alt || '';
    }
    
    // 9. Fallback: leta efter andra text-egenskaper
    if (input.value && typeof input.value === 'string') {
      return input.value;
    }
    
    // 10. Sista utväg: returnera tom sträng istället för [object Object]
    console.warn('Could not extract text from object:', input);
    return '';
  }
  
  // Fallback: konvertera till sträng men undvik [object Object]
  const stringified = String(input);
  return stringified === '[object Object]' ? '' : stringified;
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

  // Viktigt: heading får redan processad text från marked.js, inte raw tokens
  rnd.heading = function(text: string, level: number) {
    console.log('Heading renderer called with:', typeof text, text, 'level:', level);
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

  rnd.paragraph = function(text: string) {
    console.log('Paragraph renderer called with:', typeof text, text);
    if (text.trim().startsWith('→')) {
      return `<p class="arrow-list-item ml-4 my-2 relative">
                <span class="absolute left-0 font-bold text-blue-500">→</span>
                ${text.substring(1).trim()}
              </p>`;
    }
    return `<p class="text-gray-800 my-4">${text}</p>`;
  };

  rnd.list = function(body: string, ordered: boolean) {
    const tag = ordered ? 'ol' : 'ul';
    const cls = ordered ? 'list-decimal' : 'list-disc';
    return `<${tag} class="${cls} ml-6 my-4">${body}</${tag}>`;
  };
  
  rnd.listitem = function(text: string) {
    return `<li class="text-gray-800 my-1">${text}</li>`;
  };

  rnd.link = function(href: string, title: string | null, text: string) {
    const titleAttr = title ? ` title="${title}"` : '';
    return `<a href="${href}"${titleAttr} class="text-blue-500 hover:text-blue-700 underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
  };

  rnd.strong = function(text: string) {
    return `<strong class="font-bold">${text}</strong>`;
  };

  rnd.em = function(text: string) {
    return `<em class="italic">${text}</em>`;
  };

  rnd.codespan = function(text: string) {
    return `<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">${text}</code>`;
  };

  rnd.code = function(code: string, language: string | undefined) {
    return `<pre class="bg-gray-100 p-4 rounded overflow-x-auto my-4"><code class="text-sm">${code}</code></pre>`;
  };

  return rnd;
}

//
// 4) SKAPA "red‐box renderer" för röd bakgrund + vit text
//
function createRedBoxRenderer(): any {
  const rnd: any = new marked.Renderer();

  rnd.heading = function(text: string, level: number) {
    console.log('Red box heading renderer called with:', typeof text, text, 'level:', level);
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

  rnd.paragraph = function(text: string) {
    if (text.trim().startsWith('→')) {
      return `<p class="arrow-list-item text-white ml-4 my-2 relative">
                <span class="absolute left-0 font-bold text-blue-300">→</span>
                ${text.substring(1).trim()}
              </p>`;
    }
    return `<p class="text-white my-4">${text}</p>`;
  };

  rnd.list = function(body: string, ordered: boolean) {
    const tag = ordered ? 'ol' : 'ul';
    const cls = ordered ? 'list-decimal text-white' : 'list-disc text-white';
    return `<${tag} class="${cls} ml-6 my-4">${body}</${tag}>`;
  };
  
  rnd.listitem = function(text: string) {
    return `<li class="text-white my-1">${text}</li>`;
  };

  rnd.link = function(href: string, title: string | null, text: string) {
    const titleAttr = title ? ` title="${title}"` : '';
    return `<a href="${href}"${titleAttr} class="text-ljusbla hover:text-ljusbla underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
  };

  rnd.strong = function(text: string) {
    return `<strong class="text-white font-bold">${text}</strong>`;
  };

  rnd.em = function(text: string) {
    return `<em class="text-white italic">${text}</em>`;
  };

  rnd.codespan = function(text: string) {
    return `<code class="bg-gray-700 px-1 py-0.5 rounded text-sm">${text}</code>`;
  };

  rnd.code = function(code: string, language: string | undefined) {
    return `<pre class="bg-gray-700 p-4 rounded overflow-x-auto my-4"><code class="text-sm">${code}</code></pre>`;
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
    console.log('Converting markdown:', markdown);
    const pre = preprocess(markdown);
    console.log('Preprocessed markdown:', pre);
    const result = marked(pre) as string;
    console.log('Converted HTML:', result);
    return result;
  } catch (err) {
    console.error('Markdown conversion failed:', err);
    return markdown;
  }
};

export const convertMarkdownToHtmlForRedBox = (markdown: string): string => {
  if (!markdown) return '';
  try {
    console.log('Converting markdown for red box:', markdown);
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
