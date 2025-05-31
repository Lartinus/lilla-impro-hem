
// src/utils/markdownHelpers.ts
import { marked } from 'marked';

// --- Helperfunktion för att preprocessa Markdown (t.ex. pilar och rubriker) ---
function preprocess(markdown: string): string {
  if (!markdown) return '';
  return markdown
    // Säkerställ att pil-listor (→) hanteras korrekt
    .replace(/^→\s+(.+)$/gm, '→ $1')
    // Lägg till en blankrad före rubriker för bättre struktur
    .replace(/^(#{1,6})\s+(.+)$/gm, '\n$1 $2\n');
}

// Helper function to safely extract text content
function getTextContent(text: any): string {
  if (typeof text === 'string') {
    return text;
  }
  if (text && typeof text === 'object') {
    // Handle token objects from marked
    if (text.raw) return text.raw;
    if (text.text) return text.text;
    if (text.tokens && Array.isArray(text.tokens)) {
      return text.tokens.map((token: any) => getTextContent(token)).join('');
    }
  }
  return String(text || '');
}

// --- Skapar en Marked-renderer för "normal" (ljus bakgrund) ---
function createNormalRenderer() {
  const renderer = new marked.Renderer();

  renderer.paragraph = (text: any) => {
    const textContent = getTextContent(text);
    if (textContent.trim().startsWith('→')) {
      // Pil-lista
      return `<p class="arrow-list-item ml-4 my-2 relative"><span class="absolute left-0 font-bold text-blue-500">→</span> ${textContent
        .substring(1)
        .trim()}</p>`;
    }
    return `<p class="text-gray-800 my-4">${textContent}</p>`;
  };

  renderer.list = (body: string, ordered: boolean) => {
    const tag = ordered ? 'ol' : 'ul';
    const cls = ordered ? 'list-decimal' : 'list-disc';
    return `<${tag} class="${cls} ml-6 my-4">${body}</${tag}>`;
  };

  renderer.listitem = (text: any) => {
    const textContent = getTextContent(text);
    return `<li class="text-gray-800 my-1">${textContent}</li>`;
  };

  renderer.heading = (text: any, level: number) => {
    const textContent = getTextContent(text);
    // Definiera Tailwind-klasser för varje rubriknivå på ljus bakgrund:
    const sizes: Record<number, string> = {
      1: 'text-2xl font-bold text-gray-800 my-4',
      2: 'text-xl font-bold text-gray-800 mb-3',
      3: 'text-lg font-medium text-theatre-secondary mb-3',
      4: 'text-base font-bold text-gray-800 mb-2',
      5: 'text-base font-semibold text-gray-800 mb-2',
      6: 'text-base font-medium text-gray-800 mb-2',
    };
    const cls = sizes[level] || sizes[4];
    return `<h${level} class="${cls}">${textContent}</h${level}>`;
  };

  renderer.link = (href: string, title: string | null, text: any) => {
    const textContent = getTextContent(text);
    const titleAttr = title ? ` title="${title}"` : '';
    return `<a href="${href}"${titleAttr} class="text-blue-500 hover:text-blue-700 underline" target="_blank" rel="noopener noreferrer">${textContent}</a>`;
  };

  renderer.strong = (text: any) => {
    const textContent = getTextContent(text);
    return `<strong class="font-bold">${textContent}</strong>`;
  };
  
  renderer.em = (text: any) => {
    const textContent = getTextContent(text);
    return `<em class="italic">${textContent}</em>`;
  };
  
  renderer.codespan = (code: string) =>
    `<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">${code}</code>`;
  renderer.code = (code: string) =>
    `<pre class="bg-gray-100 p-4 rounded overflow-x-auto my-4"><code class="text-sm">${code}</code></pre>`;

  return renderer;
}

// --- Skapar en Marked-renderer för innehåll i röd box (vit text) ---
function createRedBoxRenderer() {
  const renderer = new marked.Renderer();

  renderer.paragraph = (text: any) => {
    const textContent = getTextContent(text);
    if (textContent.trim().startsWith('→')) {
      return `<p class="arrow-list-item text-white ml-4 my-2 relative"><span class="absolute left-0 font-bold text-blue-300">→</span> ${textContent
        .substring(1)
        .trim()}</p>`;
    }
    return `<p class="text-white my-4">${textContent}</p>`;
  };

  renderer.list = (body: string, ordered: boolean) => {
    const tag = ordered ? 'ol' : 'ul';
    const cls = ordered ? 'list-decimal text-white' : 'list-disc text-white';
    return `<${tag} class="${cls} ml-6 my-4">${body}</${tag}>`;
  };

  renderer.listitem = (text: any) => {
    const textContent = getTextContent(text);
    return `<li class="text-white my-1">${textContent}</li>`;
  };

  renderer.heading = (text: any, level: number) => {
    const textContent = getTextContent(text);
    const sizes: Record<number, string> = {
      1: 'text-2xl font-bold text-white my-4',
      2: 'text-xl font-bold text-white mb-3',
      3: 'text-lg font-medium text-white mb-3',
      4: 'text-base font-bold text-white mb-2',
      5: 'text-base font-semibold text-white mb-2',
      6: 'text-base font-medium text-white mb-2',
    };
    const cls = sizes[level] || sizes[4];
    return `<h${level} class="${cls}">${textContent}</h${level}>`;
  };

  renderer.link = (href: string, title: string | null, text: any) => {
    const textContent = getTextContent(text);
    const titleAttr = title ? ` title="${title}"` : '';
    // Använd ljusblå text för länkar i röd box
    return `<a href="${href}"${titleAttr} class="text-ljusbla hover:text-ljusbla underline" target="_blank" rel="noopener noreferrer">${textContent}</a>`;
  };

  renderer.strong = (text: any) => {
    const textContent = getTextContent(text);
    return `<strong class="text-white font-bold">${textContent}</strong>`;
  };
  
  renderer.em = (text: any) => {
    const textContent = getTextContent(text);
    return `<em class="text-white italic">${textContent}</em>`;
  };
  
  renderer.codespan = (code: string) =>
    `<code class="bg-gray-700 px-1 py-0.5 rounded text-sm">${code}</code>`;
  renderer.code = (code: string) =>
    `<pre class="bg-gray-700 p-4 rounded overflow-x-auto my-4"><code class="text-sm">${code}</code></pre>`;

  return renderer;
}

// Exportera de två konverteringsfunktionerna
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
