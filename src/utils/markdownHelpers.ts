
import { marked } from 'marked';

// Helper function to extract text from tokens
function getTextFromTokens(tokens: any[]): string {
  if (!tokens || !Array.isArray(tokens)) return '';
  
  return tokens.map(token => {
    if (typeof token === 'string') return token;
    if (token.text) return token.text;
    if (token.tokens) return getTextFromTokens(token.tokens);
    return '';
  }).join('');
}

//
// PREPROCESS: Normalisera markdown-input
//
function preprocess(md: string): string {
  if (!md) return '';

  // Ta bort BOM och normalisera radslut
  let s = md.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');

  // Sätt in blanksteg efter rubriker som saknar det
  s = s.replace(/(^|\n)(#{1,6})(?=\S)/g, '$1$2 ');

  return s;
}

//
// SKAPA "normal renderer" för ljus bakgrund
//
function createNormalRenderer(): any {
  const renderer = new marked.Renderer();

  renderer.heading = function({ tokens, depth }: { tokens: any[], depth: number }) {
    const text = getTextFromTokens(tokens);
    const classes: Record<number, string> = {
      1: 'text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-gray-800 tracking-normal mb-4',
      2: 'text-xl font-bold text-gray-800 mb-4',
      3: 'text-lg font-medium text-theatre-secondary mb-1',
      4: 'text-base font-bold text-gray-800 mb-2',
      5: 'text-base font-semibold text-gray-800 mb-2',
      6: 'text-base font-medium text-gray-800 mb-2',
    };
    const cls = classes[depth] || classes[4];
    return `<h${depth} class="${cls}">${text}</h${depth}>`;
  };

  renderer.paragraph = function({ tokens }: { tokens: any[] }) {
    const text = getTextFromTokens(tokens);
    
    // Hantera pil-listor direkt i renderer
    if (text.trim().startsWith('→')) {
      const content = text.replace(/^→\s*/, '').trim();
      return `<div class="arrow-list-item ml-4 my-2 relative text-gray-800">
                <span class="absolute -left-4 font-bold text-blue-500">→</span>
                <span>${content}</span>
              </div>`;
    }
    return `<p class="text-gray-800 my-4">${text}</p>`;
  };

  renderer.list = function(token: { items: any[], ordered: boolean }) {
    const tag = token.ordered ? 'ol' : 'ul';
    const cls = token.ordered ? 'list-decimal' : 'list-disc';
    const body = token.items.map(item => {
      const text = getTextFromTokens(item.tokens);
      return `<li class="text-gray-800 my-1">${text}</li>`;
    }).join('');
    return `<${tag} class="${cls} ml-6 my-4">${body}</${tag}>`;
  };
  
  renderer.listitem = function(item: { tokens: any[] }) {
    const text = getTextFromTokens(item.tokens);
    return `<li class="text-gray-800 my-1">${text}</li>`;
  };

  renderer.link = function({ href, title, tokens }: { href: string, title?: string | null, tokens: any[] }) {
    const text = getTextFromTokens(tokens);
    const titleAttr = title ? ` title="${title}"` : '';
    return `<a href="${href}"${titleAttr} class="text-blue-500 hover:text-blue-700 underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
  };

  renderer.strong = function({ tokens }: { tokens: any[] }) {
    const text = getTextFromTokens(tokens);
    return `<strong class="font-bold">${text}</strong>`;
  };

  renderer.em = function({ tokens }: { tokens: any[] }) {
    const text = getTextFromTokens(tokens);
    return `<em class="italic">${text}</em>`;
  };

  renderer.codespan = function({ text }: { text: string }) {
    return `<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">${text}</code>`;
  };

  renderer.code = function({ text, lang }: { text: string, lang?: string | undefined }) {
    return `<pre class="bg-gray-100 p-4 rounded overflow-x-auto my-4"><code class="text-sm">${text}</code></pre>`;
  };

  return renderer;
}

//
// SKAPA "red-box renderer" för röd bakgrund
//
function createRedBoxRenderer(): any {
  const renderer = new marked.Renderer();

  renderer.heading = function({ tokens, depth }: { tokens: any[], depth: number }) {
    const text = getTextFromTokens(tokens);
    const classes: Record<number, string> = {
      1: 'text-xl md:text-2xl lg:text-3xl font-bold leading-tight text-white tracking-normal mb-4',
      2: 'text-xl font-bold text-white mb-4',
      3: 'text-lg font-medium text-white mb-1',
      4: 'text-base font-bold text-white mb-2',
      5: 'text-base font-semibold text-white mb-2',
      6: 'text-base font-medium text-white mb-2',
    };
    const cls = classes[depth] || classes[4];
    return `<h${depth} class="${cls}">${text}</h${depth}>`;
  };

  renderer.paragraph = function({ tokens }: { tokens: any[] }) {
    const text = getTextFromTokens(tokens);
    
    // Hantera pil-listor direkt i renderer för röd bakgrund
    if (text.trim().startsWith('→')) {
      const content = text.replace(/^→\s*/, '').trim();
      return `<div class="arrow-list-item ml-4 my-2 relative text-white">
                <span class="absolute -left-4 font-bold text-blue-300">→</span>
                <span>${content}</span>
              </div>`;
    }
    return `<p class="text-white my-4">${text}</p>`;
  };

  renderer.list = function(token: { items: any[], ordered: boolean }) {
    const tag = token.ordered ? 'ol' : 'ul';
    const cls = token.ordered ? 'list-decimal text-white' : 'list-disc text-white';
    const body = token.items.map(item => {
      const text = getTextFromTokens(item.tokens);
      return `<li class="text-white my-1">${text}</li>`;
    }).join('');
    return `<${tag} class="${cls} ml-6 my-4">${body}</${tag}>`;
  };
  
  renderer.listitem = function(item: { tokens: any[] }) {
    const text = getTextFromTokens(item.tokens);
    return `<li class="text-white my-1">${text}</li>`;
  };

  renderer.link = function({ href, title, tokens }: { href: string, title?: string | null, tokens: any[] }) {
    const text = getTextFromTokens(tokens);
    const titleAttr = title ? ` title="${title}"` : '';
    return `<a href="${href}"${titleAttr} class="text-ljusbla hover:text-ljusbla underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
  };

  renderer.strong = function({ tokens }: { tokens: any[] }) {
    const text = getTextFromTokens(tokens);
    return `<strong class="text-white font-bold">${text}</strong>`;
  };

  renderer.em = function({ tokens }: { tokens: any[] }) {
    const text = getTextFromTokens(tokens);
    return `<em class="text-white italic">${text}</em>`;
  };

  renderer.codespan = function({ text }: { text: string }) {
    return `<code class="bg-gray-700 px-1 py-0.5 rounded text-sm">${text}</code>`;
  };

  renderer.code = function({ text, lang }: { text: string, lang?: string | undefined }) {
    return `<pre class="bg-gray-700 p-4 rounded overflow-x-auto my-4"><code class="text-sm">${text}</code></pre>`;
  };

  return renderer;
}

//
// EXPORTERA funktioner
//
export const convertMarkdownToHtml = (markdown: string): string => {
  if (!markdown) return '';
  
  try {
    console.log('Converting markdown:', markdown);
    const preprocessed = preprocess(markdown);
    console.log('Preprocessed:', preprocessed);
    
    // Configure marked with valid options only
    const html = marked(preprocessed, {
      gfm: true,
      breaks: true,
      renderer: createNormalRenderer()
    });
    
    console.log('Result HTML:', html);
    return html as string;
  } catch (err) {
    console.error('Markdown conversion failed:', err);
    return markdown;
  }
};

export const convertMarkdownToHtmlForRedBox = (markdown: string): string => {
  if (!markdown) return '';
  
  try {
    console.log('Converting markdown for red box:', markdown);
    const preprocessed = preprocess(markdown);
    
    // Configure marked with valid options only
    const html = marked(preprocessed, {
      gfm: true,
      breaks: true,
      renderer: createRedBoxRenderer()
    });
    
    return html as string;
  } catch (err) {
    console.error('Markdown (red box) conversion failed:', err);
    return markdown;
  }
};
