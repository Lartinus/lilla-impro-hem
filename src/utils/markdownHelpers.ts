// markdownHelpers.ts
import { marked } from 'marked';

// Shared preprocessing for markdown
const preprocess = (markdown: string): string => {
  return markdown
    .replace(/^→\s+(.+)$/gm, '→ $1')
    .replace(/^(#{1,6})\s+(.+)$/gm, '\n$1 $2\n');
};

// Heading classes
const headingClasses = (variant: 'normal' | 'red') => ({
  1: `text-xl md:text-2xl lg:text-3xl font-bold leading-tight tracking-normal ${variant === 'red' ? 'text-white' : 'text-gray-800'}`,
  2: `text-xl font-bold ${variant === 'red' ? 'text-white' : 'text-gray-800'} mb-4`,
  3: `${variant === 'red' ? 'text-white' : 'text-theatre-secondary'} font-medium mb-4`,
  4: `${variant === 'red' ? 'text-white' : 'text-gray-800'} font-bold mb-3`,
  5: `${variant === 'red' ? 'text-white' : 'text-gray-800'} font-semibold mb-2`,
  6: `${variant === 'red' ? 'text-white' : 'text-gray-800'} font-medium mb-2`
});

const createRenderer = (variant: 'normal' | 'red') => {
  const renderer = new marked.Renderer();

  renderer.paragraph = function(text: string) {
    if (text.startsWith('→')) {
      return `<p class="arrow-list-item" style="margin: 0.5rem 0; padding-left: 1rem; position: relative;"><span style="position: absolute; left: 0; font-weight: bold; color: #3b82f6;">→</span>${text.substring(1).trim()}</p>`;
    }
    return `<p style="margin: 1rem 0;">${text}</p>`;
  };

  renderer.list = function(body: string, ordered: boolean) {
    const type = ordered ? 'ol' : 'ul';
    const style = ordered ? 'list-decimal' : 'list-disc';
    return `<${type} class="${style}" style="margin: 1rem 0; padding-left: 1.5rem;">${body}</${type}>`;
  };

  renderer.listitem = function(text: string) {
    return `<li style="margin: 0.25rem 0;">${text}</li>`;
  };

  renderer.heading = function(text: string, level: number) {
    const classes = headingClasses(variant)[level as keyof ReturnType<typeof headingClasses>];
    return `<h${level} class="${classes}" style="margin: 1.5rem 0 0.5rem 0;">${text}</h${level}>`;
  };

  renderer.link = function(href: string, title: string | null, text: string) {
    const titleAttr = title ? ` title="${title}"` : '';
    const color = variant === 'red' ? 'text-blue-300 hover:text-blue-100' : 'text-blue-500 hover:text-blue-700';
    return `<a href="${href}"${titleAttr} class="${color} underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
  };

  renderer.code = function(code: string) {
    return `<pre class="bg-gray-100 p-4 rounded overflow-x-auto my-4"><code class="text-sm">${code}</code></pre>`;
  };

  renderer.codespan = function(code: string) {
    return `<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">${code}</code>`;
  };

  renderer.strong = function(text: string) {
    return `<strong class="font-bold">${text}</strong>`;
  };

  renderer.em = function(text: string) {
    return `<em class="italic">${text}</em>`;
  };

  return renderer;
};

export const convertMarkdownToHtml = (markdown: string): string => {
  if (!markdown) return '';
  return marked(preprocess(markdown), { renderer: createRenderer('normal') });
};

export const convertMarkdownToHtmlForRedBox = (markdown: string): string => {
  if (!markdown) return '';
  return marked(preprocess(markdown), { renderer: createRenderer('red') });
};
