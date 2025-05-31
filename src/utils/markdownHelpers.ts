import { marked } from 'marked';

// Common styling for both renderers
const common = {
  list: (body: string, ordered: boolean) => {
    const type = ordered ? 'ol' : 'ul';
    const style = ordered ? 'list-decimal' : 'list-disc';
    return `<${type} class="${style} ml-6 my-4">${body}</${type}>`;
  },
  listitem: (text: string) => `<li class="my-1">${text}</li>`,
  code: (code: string) => `<pre class="bg-gray-100 p-4 rounded overflow-x-auto my-4"><code class="text-sm">${code}</code></pre>`,
  codespan: (code: string) => `<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">${code}</code>`,
  strong: (text: string) => `<strong class="font-bold">${text}</strong>`,
  em: (text: string) => `<em class="italic">${text}</em>`
};

// Factory for heading styles
const headingFactory = (colorClass: string) => (text: string, level: number) => {
  const sizes = {
    1: 'text-xl md:text-2xl lg:text-3xl font-bold leading-tight tracking-normal',
    2: 'text-xl font-bold mb-4',
    3: 'font-medium mb-4',
    4: 'font-bold mb-3',
    5: 'font-semibold mb-2',
    6: 'font-medium mb-2'
  };
  const cls = sizes[level as keyof typeof sizes] || sizes[4];
  return `<h${level} class="${cls} ${colorClass} mt-6 mb-2">${text}</h${level}>`;
};

// Factory for paragraph style including arrow list detection
const paragraphFactory = (colorClass: string) => (text: string) => {
  if (typeof text === 'string' && text.trim().startsWith('→')) {
    return `<p class="arrow-list-item ${colorClass} ml-4 relative"><span class="absolute left-0 font-bold text-blue-500">→</span> ${text.substring(1).trim()}</p>`;
  }
  return `<p class="${colorClass} my-4">${text}</p>`;
};

const createRenderer = (colorClass: string) => {
  const renderer = new marked.Renderer();
  renderer.paragraph = paragraphFactory(colorClass);
  renderer.list = common.list;
  renderer.listitem = common.listitem;
  renderer.code = common.code;
  renderer.codespan = common.codespan;
  renderer.strong = common.strong;
  renderer.em = common.em;
  renderer.heading = headingFactory(colorClass);
  renderer.link = (href, title, text) => `<a href="${href}"${title ? ` title="${title}"` : ''} class="underline text-blue-500 hover:text-blue-700" target="_blank" rel="noopener noreferrer">${text}</a>`;
  return renderer;
};

const normalRenderer = createRenderer('text-gray-800');
const redBoxRenderer = createRenderer('text-white');

export const convertMarkdownToHtml = (markdown: string): string => {
  if (!markdown) return '';
  try {
    return marked.parse(markdown, { renderer: normalRenderer });
  } catch (err) {
    console.error('Markdown parse error:', err);
    return markdown;
  }
};

export const convertMarkdownToHtmlForRedBox = (markdown: string): string => {
  if (!markdown) return '';
  try {
    return marked.parse(markdown, { renderer: redBoxRenderer });
  } catch (err) {
    console.error('Markdown parse error (red box):', err);
    return markdown;
  }
};
