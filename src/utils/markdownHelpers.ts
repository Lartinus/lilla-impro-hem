import { marked } from 'marked';

const normalRenderer = {
  heading(text: string, level: number) {
    const headingClasses = {
      1: 'text-xl md:text-2xl lg:text-3xl font-bold leading-tight tracking-normal text-gray-800',
      2: 'text-xl font-bold text-gray-800 mb-4',
      3: 'text-theatre-secondary font-medium mb-4',
      4: 'text-gray-800 font-bold mb-3',
      5: 'text-gray-800 font-semibold mb-2',
      6: 'text-gray-800 font-medium mb-2',
    };
    const className = headingClasses[level] || headingClasses[4];
    return `<h${level} class="${className}" style="margin: 1.5rem 0 0.5rem 0;">${text}</h${level}>`;
  },
  paragraph(text: string) {
    if (text.startsWith('→')) {
      return `<p class="arrow-list-item" style="margin: 0.5rem 0; padding-left: 1rem; position: relative;"><span style="position: absolute; left: 0; font-weight: bold; color: #3b82f6;">→</span>${text.substring(1).trim()}</p>`;
    }
    return `<p style="margin: 1rem 0;">${text}</p>`;
  },
  list(body: string, ordered: boolean) {
    const type = ordered ? 'ol' : 'ul';
    const style = ordered ? 'list-decimal' : 'list-disc';
    return `<${type} class="${style}" style="margin: 1rem 0; padding-left: 1.5rem;">${body}</${type}>`;
  },
  listitem(text: string) {
    return `<li style="margin: 0.25rem 0;">${text}</li>`;
  },
  link(href: string, title: string | null, text: string) {
    const titleAttr = title ? ` title="${title}"` : '';
    return `<a href="${href}"${titleAttr} class="text-blue-500 hover:text-blue-700 underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
  },
  strong(text: string) {
    return `<strong class="font-bold">${text}</strong>`;
  },
  em(text: string) {
    return `<em class="italic">${text}</em>`;
  },
  codespan(code: string) {
    return `<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">${code}</code>`;
  },
  code(code: string) {
    return `<pre class="bg-gray-100 p-4 rounded overflow-x-auto my-4"><code class="text-sm">${code}</code></pre>`;
  },
};

const redBoxRenderer = {
  ...normalRenderer,
  heading(text: string, level: number) {
    const headingClasses = {
      1: 'text-xl md:text-2xl lg:text-3xl font-bold leading-tight tracking-normal text-white',
      2: 'text-xl font-bold text-white mb-4',
      3: 'text-white font-medium mb-4',
      4: 'text-white font-bold mb-3',
      5: 'text-white font-semibold mb-2',
      6: 'text-white font-medium mb-2',
    };
    const className = headingClasses[level] || headingClasses[4];
    return `<h${level} class="${className}" style="margin: 1.5rem 0 0.5rem 0; color: white !important;">${text}</h${level}>`;
  },
  link(href: string, title: string | null, text: string) {
    const titleAttr = title ? ` title="${title}"` : '';
    return `<a href="${href}"${titleAttr} class="text-blue-300 hover:text-blue-100 underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
  },
};

export const convertMarkdownToHtml = (markdown: string): string => {
  if (!markdown) return '';

  try {
    const processedMarkdown = markdown
      .replace(/^→\s+(.+)$/gm, '→ $1')
      .replace(/^(#{1,6})\s+(.+)$/gm, '\n$1 $2\n');

    marked.use({ renderer: normalRenderer });
    return marked.parse(processedMarkdown);
  } catch (error) {
    console.error('Error converting markdown to HTML:', error);
    return markdown;
  }
};

export const convertMarkdownToHtmlForRedBox = (markdown: string): string => {
  if (!markdown) return '';

  try {
    const processedMarkdown = markdown
      .replace(/^→\s+(.+)$/gm, '→ $1')
      .replace(/^(#{1,6})\s+(.+)$/gm, '\n$1 $2\n');

    marked.use({ renderer: redBoxRenderer });
    return marked.parse(processedMarkdown);
  } catch (error) {
    console.error('Error converting markdown to HTML (red box):', error);
    return markdown;
  }
};