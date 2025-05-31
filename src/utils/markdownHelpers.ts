
import { marked } from 'marked';

// Configure marked options for better HTML output
marked.setOptions({
  breaks: true,
  gfm: true,
});

// Custom renderer for normal content (black headings on white backgrounds)
const normalRenderer = new marked.Renderer();

// Override paragraph rendering to handle arrow lists
normalRenderer.paragraph = function(token: any) {
  const text = this.parser.parseInline(token.tokens);
  // Check if this is an arrow list item
  if (text.startsWith('→')) {
    return `<p class="arrow-list-item" style="margin: 0.5rem 0; padding-left: 1rem; position: relative;"><span style="position: absolute; left: 0; font-weight: bold; color: #3b82f6;">→</span>${text.substring(1).trim()}</p>`;
  }
  return `<p style="margin: 1rem 0;">${text}</p>`;
};

// Override list rendering for better styling
normalRenderer.list = function(token: any) {
  const body = this.parser.parse(token.items);
  const type = token.ordered ? 'ol' : 'ul';
  const style = token.ordered ? 'list-decimal' : 'list-disc';
  return `<${type} class="${style}" style="margin: 1rem 0; padding-left: 1.5rem;">${body}</${type}>`;
};

normalRenderer.listitem = function(token: any) {
  const text = this.parser.parseInline(token.tokens);
  return `<li style="margin: 0.25rem 0;">${text}</li>`;
};

// Style headings for normal content (dark text on light backgrounds)
normalRenderer.heading = function(token: any) {
  const text = this.parser.parseInline(token.tokens);
  const headingClasses = {
    1: 'text-xl md:text-2xl lg:text-3xl font-bold leading-tight tracking-normal text-gray-800',
    2: 'text-xl font-bold text-gray-800 mb-4',
    3: 'text-theatre-secondary font-medium mb-4',
    4: 'text-gray-800 font-bold mb-3',
    5: 'text-gray-800 font-semibold mb-2',
    6: 'text-gray-800 font-medium mb-2'
  };
  
  const className = headingClasses[token.depth as keyof typeof headingClasses] || headingClasses[4];
  return `<h${token.depth} class="${className}" style="margin: 1.5rem 0 0.5rem 0;">${text}</h${token.depth}>`;
};

// Style links for normal content
normalRenderer.link = function(token: any) {
  const text = this.parser.parseInline(token.tokens);
  const titleAttr = token.title ? ` title="${token.title}"` : '';
  return `<a href="${token.href}"${titleAttr} class="text-blue-500 hover:text-blue-700 underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
};

// Style code blocks
normalRenderer.code = function(token: any) {
  return `<pre class="bg-gray-100 p-4 rounded overflow-x-auto my-4"><code class="text-sm">${token.text}</code></pre>`;
};

// Style inline code
normalRenderer.codespan = function(token: any) {
  return `<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">${token.text}</code>`;
};

// Style strong and emphasis
normalRenderer.strong = function(token: any) {
  const text = this.parser.parseInline(token.tokens);
  return `<strong class="font-bold">${text}</strong>`;
};

normalRenderer.em = function(token: any) {
  const text = this.parser.parseInline(token.tokens);
  return `<em class="italic">${text}</em>`;
};

// Custom renderer for red box content (white text)
const redBoxRenderer = new marked.Renderer();

// Copy all methods from normal renderer
redBoxRenderer.paragraph = normalRenderer.paragraph;
redBoxRenderer.list = normalRenderer.list;
redBoxRenderer.listitem = normalRenderer.listitem;
redBoxRenderer.code = normalRenderer.code;
redBoxRenderer.codespan = normalRenderer.codespan;
redBoxRenderer.strong = normalRenderer.strong;
redBoxRenderer.em = normalRenderer.em;

// Override headings for red box (white text)
redBoxRenderer.heading = function(token: any) {
  const text = this.parser.parseInline(token.tokens);
  const headingClasses = {
    1: 'text-xl md:text-2xl lg:text-3xl font-bold leading-tight tracking-normal text-white',
    2: 'text-xl font-bold text-white mb-4',
    3: 'text-white font-medium mb-4',
    4: 'text-white font-bold mb-3',
    5: 'text-white font-semibold mb-2',
    6: 'text-white font-medium mb-2'
  };
  
  const className = headingClasses[token.depth as keyof typeof headingClasses] || headingClasses[4];
  return `<h${token.depth} class="${className}" style="margin: 1.5rem 0 0.5rem 0; color: white !important;">${text}</h${token.depth}>`;
};

// Override links for red box (white/light blue text)
redBoxRenderer.link = function(token: any) {
  const text = this.parser.parseInline(token.tokens);
  const titleAttr = token.title ? ` title="${token.title}"` : '';
  return `<a href="${token.href}"${titleAttr} class="text-blue-300 hover:text-blue-100 underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
};

export const convertMarkdownToHtml = (markdown: string): string => {
  if (!markdown) return '';
  
  try {
    // Pre-process the markdown to handle arrow lists properly
    const processedMarkdown = markdown
      // Convert arrow list items to proper format
      .replace(/^→\s+(.+)$/gm, '→ $1')
      // Ensure proper spacing around headings
      .replace(/^(#{1,6})\s+(.+)$/gm, '\n$1 $2\n');
    
    const result = marked(processedMarkdown, { renderer: normalRenderer });
    
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

// Special version for red backgrounds that ensures all text is white
export const convertMarkdownToHtmlForRedBox = (markdown: string): string => {
  if (!markdown) return '';
  
  try {
    // Pre-process the markdown to handle arrow lists properly
    const processedMarkdown = markdown
      // Convert arrow list items to proper format
      .replace(/^→\s+(.+)$/gm, '→ $1')
      // Ensure proper spacing around headings
      .replace(/^(#{1,6})\s+(.+)$/gm, '\n$1 $2\n');
    
    const result = marked(processedMarkdown, { renderer: redBoxRenderer });
    
    // Handle both string and Promise returns
    if (typeof result === 'string') {
      // Additional cleanup to ensure all text is white
      return result
        .replace(/class="text-gray-700"/g, 'class="text-white"')
        .replace(/class="text-black"/g, 'class="text-white"')
        .replace(/class="text-theatre-secondary"/g, 'class="text-white"')
        .replace(/style="color:\s*[^"]*"/g, 'style="color: white !important"');
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
