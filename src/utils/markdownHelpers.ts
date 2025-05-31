
import { marked } from 'marked';

// Configure marked options for better HTML output
marked.setOptions({
  breaks: true,
  gfm: true,
});

// Custom renderer for handling arrow lists and other formatting
const renderer = new marked.Renderer();

// Override paragraph rendering to handle arrow lists
renderer.paragraph = function({ tokens }: any) {
  const text = this.parser.parseInline(tokens);
  // Check if this is an arrow list item
  if (text.startsWith('→')) {
    return `<p class="arrow-list-item" style="margin: 0.5rem 0; padding-left: 1rem; position: relative;"><span style="position: absolute; left: 0; font-weight: bold; color: #3b82f6;">→</span>${text.substring(1).trim()}</p>`;
  }
  return `<p style="margin: 1rem 0;">${text}</p>`;
};

// Override list rendering for better styling
renderer.list = function(token: any) {
  const body = this.parser.parse(token.items);
  const type = token.ordered ? 'ol' : 'ul';
  const style = token.ordered ? 'list-decimal' : 'list-disc';
  return `<${type} class="${style}" style="margin: 1rem 0; padding-left: 1.5rem;">${body}</${type}>`;
};

renderer.listitem = function(item: any) {
  const text = this.parser.parseInline(item.tokens);
  return `<li style="margin: 0.25rem 0;">${text}</li>`;
};

// Style headings according to the website's design standards
renderer.heading = function({ tokens, depth }: any) {
  const text = this.parser.parseInline(tokens);
  const headingClasses = {
    1: 'text-xl md:text-2xl lg:text-3xl font-bold leading-tight tracking-normal text-black',
    2: 'text-xl font-bold text-black mb-4',
    3: 'text-theatre-secondary font-medium mb-4',
    4: 'text-black font-bold mb-3',
    5: 'text-black font-semibold mb-2',
    6: 'text-black font-medium mb-2'
  };
  
  const className = headingClasses[depth as keyof typeof headingClasses] || headingClasses[4];
  return `<h${depth} class="${className}" style="margin: 1.5rem 0 0.5rem 0;">${text}</h${depth}>`;
};

// Style links
renderer.link = function({ href, title, tokens }: any) {
  const text = this.parser.parseInline(tokens);
  const titleAttr = title ? ` title="${title}"` : '';
  return `<a href="${href}"${titleAttr} class="text-blue-500 hover:text-blue-700 underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
};

// Style code blocks
renderer.code = function({ text, lang }: any) {
  return `<pre class="bg-gray-100 p-4 rounded overflow-x-auto my-4"><code class="text-sm">${text}</code></pre>`;
};

// Style inline code
renderer.codespan = function({ text }: any) {
  return `<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">${text}</code>`;
};

// Style strong and emphasis
renderer.strong = function({ tokens }: any) {
  const text = this.parser.parseInline(tokens);
  return `<strong class="font-bold">${text}</strong>`;
};

renderer.em = function({ tokens }: any) {
  const text = this.parser.parseInline(tokens);
  return `<em class="italic">${text}</em>`;
};

// Set the custom renderer
marked.setOptions({ renderer });

export const convertMarkdownToHtml = (markdown: string): string => {
  if (!markdown) return '';
  
  try {
    // Pre-process the markdown to handle arrow lists properly
    const processedMarkdown = markdown
      // Convert arrow list items to proper format
      .replace(/^→\s+(.+)$/gm, '→ $1')
      // Ensure proper spacing around headings
      .replace(/^(#{1,6})\s+(.+)$/gm, '\n$1 $2\n');
    
    const result = marked(processedMarkdown);
    
    // Handle both string and Promise returns
    if (typeof result === 'string') {
      return result;
    } else {
      // If it's a Promise, we need to handle it differently
      console.warn('marked() returned a Promise, falling back to original text');
      return markdown;
    }
  } catch (error) {
    console.error('Error converting markdown to HTML:', error);
    return markdown; // Fallback to original text
  }
};
