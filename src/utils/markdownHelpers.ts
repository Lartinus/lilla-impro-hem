
import { marked } from 'marked';

//
// PREPROCESS: Normalisera markdown-input
//
function preprocess(md: string): string {
  if (!md) return '';

  // Ta bort BOM och normalisera radslut
  let s = md.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');

  // Sätt in blanksteg efter rubriker som saknar det
  s = s.replace(/(^|\n)(#{1,6})(?=\S)/g, '$1$2 ');

  // Formatera pil-listor
  s = s.replace(/^→\s*(.+)$/gm, '→ $1');

  return s;
}

//
// SKAPA "normal renderer" för ljus bakgrund
//
function createNormalRenderer(): any {
  const renderer = new marked.Renderer();

  renderer.heading = function(text: string, level: number) {
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

  renderer.paragraph = function(text: string) {
    if (text.trim().startsWith('→')) {
      return `<p class="arrow-list-item ml-4 my-2 relative">
                <span class="absolute left-0 font-bold text-blue-500">→</span>
                ${text.substring(1).trim()}
              </p>`;
    }
    return `<p class="text-gray-800 my-4">${text}</p>`;
  };

  renderer.list = function(body: string, ordered: boolean) {
    const tag = ordered ? 'ol' : 'ul';
    const cls = ordered ? 'list-decimal' : 'list-disc';
    return `<${tag} class="${cls} ml-6 my-4">${body}</${tag}>`;
  };
  
  renderer.listitem = function(text: string) {
    return `<li class="text-gray-800 my-1">${text}</li>`;
  };

  renderer.link = function(href: string, title: string | null, text: string) {
    const titleAttr = title ? ` title="${title}"` : '';
    return `<a href="${href}"${titleAttr} class="text-blue-500 hover:text-blue-700 underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
  };

  renderer.strong = function(text: string) {
    return `<strong class="font-bold">${text}</strong>`;
  };

  renderer.em = function(text: string) {
    return `<em class="italic">${text}</em>`;
  };

  renderer.codespan = function(text: string) {
    return `<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">${text}</code>`;
  };

  renderer.code = function(code: string, language: string | undefined) {
    return `<pre class="bg-gray-100 p-4 rounded overflow-x-auto my-4"><code class="text-sm">${code}</code></pre>`;
  };

  return renderer;
}

//
// SKAPA "red-box renderer" för röd bakgrund
//
function createRedBoxRenderer(): any {
  const renderer = new marked.Renderer();

  renderer.heading = function(text: string, level: number) {
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

  renderer.paragraph = function(text: string) {
    if (text.trim().startsWith('→')) {
      return `<p class="arrow-list-item text-white ml-4 my-2 relative">
                <span class="absolute left-0 font-bold text-blue-300">→</span>
                ${text.substring(1).trim()}
              </p>`;
    }
    return `<p class="text-white my-4">${text}</p>`;
  };

  renderer.list = function(body: string, ordered: boolean) {
    const tag = ordered ? 'ol' : 'ul';
    const cls = ordered ? 'list-decimal text-white' : 'list-disc text-white';
    return `<${tag} class="${cls} ml-6 my-4">${body}</${tag}>`;
  };
  
  renderer.listitem = function(text: string) {
    return `<li class="text-white my-1">${text}</li>`;
  };

  renderer.link = function(href: string, title: string | null, text: string) {
    const titleAttr = title ? ` title="${title}"` : '';
    return `<a href="${href}"${titleAttr} class="text-ljusbla hover:text-ljusbla underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
  };

  renderer.strong = function(text: string) {
    return `<strong class="text-white font-bold">${text}</strong>`;
  };

  renderer.em = function(text: string) {
    return `<em class="text-white italic">${text}</em>`;
  };

  renderer.codespan = function(text: string) {
    return `<code class="bg-gray-700 px-1 py-0.5 rounded text-sm">${text}</code>`;
  };

  renderer.code = function(code: string, language: string | undefined) {
    return `<pre class="bg-gray-700 p-4 rounded overflow-x-auto my-4"><code class="text-sm">${code}</code></pre>`;
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
