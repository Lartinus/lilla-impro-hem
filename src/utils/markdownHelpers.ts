import { marked } from 'marked';

// MARKDOWN: Klassuppsättningar för olika heading-nivåer
const headingClasses = {
  normal: {
    1: 'text-xl md:text-2xl lg:text-3xl font-bold leading-tight tracking-normal text-gray-800',
    2: 'text-xl font-bold text-gray-800 mb-4',
    3: 'text-theatre-secondary font-medium mb-4',
    4: 'text-gray-800 font-bold mb-3',
    5: 'text-gray-800 font-semibold mb-2',
    6: 'text-gray-800 font-medium mb-2',
  },
  red: {
    1: 'text-xl md:text-2xl lg:text-3xl font-bold leading-tight tracking-normal text-white',
    2: 'text-xl font-bold text-white mb-4',
    3: 'text-white font-medium mb-4',
    4: 'text-white font-bold mb-3',
    5: 'text-white font-semibold mb-2',
    6: 'text-white font-medium mb-2',
  }
};

// 🔧 Basrenderare – parametiserbar på "variant" (normal | red)
function createRenderer(variant: 'normal' | 'red') {
  const renderer = new marked.Renderer();

  renderer.paragraph = (text: string) => {
    if (text.trim().startsWith('→')) {
      return `<p class="arrow-list-item" style="margin: 0.5rem 0; padding-left: 1rem; position: relative;"><span style="position: absolute; left: 0; font-weight: bold; color: #3b82f6;">→</span>${text.substring(1).trim()}</p>`;
    }
    return `<p class="mb-4">${text}</p>`;
  };

  renderer.list = (body: string, ordered: boolean) => {
    const type = ordered ? 'ol' : 'ul';
    const style = ordered ? 'list-decimal' : 'list-disc';
    return `<${type} class="${style} pl-5 mb-4">${body}</${type}>`;
  };

  renderer.listitem = (text: string) => {
    return `<li class="mb-1">${text}</li>`;
  };

  renderer.heading = (text: string, level: number) => {
    const cls = headingClasses[variant][level as keyof typeof headingClasses['normal']] || headingClasses[variant][4];
    return `<h${level} class="${cls}">${text}</h${level}>`;
  };

  renderer.link = (href: string, title: string | null, text: string) => {
    const titleAttr = title ? ` title="${title}"` : '';
    const linkColor = variant === 'red' ? 'text-blue-200 hover:text-blue-100' : 'text-blue-500 hover:text-blue-700';
    return `<a href="${href}"${titleAttr} class="${linkColor} underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
  };

  renderer.code = (code: string) => {
    return `<pre class="bg-gray-100 p-4 rounded overflow-x-auto my-4"><code class="text-sm">${code}</code></pre>`;
  };

  renderer.codespan = (code: string) => {
    return `<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">${code}</code>`;
  };

  renderer.strong = (text: string) => {
    return `<strong class="font-bold">${text}</strong>`;
  };

  renderer.em = (text: string) => {
    return `<em class="italic">${text}</em>`;
  };

  return renderer;
}

// 🟦 Vanlig variant – för vit bakgrund
export const convertMarkdownToHtml = (markdown: string): string => {
  return marked.parse(preprocess(markdown), { renderer: createRenderer('normal') });
};

// 🔴 Variant för röd bakgrund
export const convertMarkdownToHtmlForRedBox = (markdown: string): string => {
  return marked.parse(preprocess(markdown), { renderer: createRenderer('red') });
};

// 🔧 Preprocessing för extra snygg formatering
function preprocess(markdown: string): string {
  if (!markdown) return '';
  return markdown
    .replace(/^→\s+(.+)$/gm, '→ $1')
    .replace(/^(#{1,6})\s+(.+)$/gm, '\n$1 $2\n');
}
