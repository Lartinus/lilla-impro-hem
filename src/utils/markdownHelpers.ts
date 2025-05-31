
import { marked } from 'marked';

// Configure marked options for better HTML output
marked.setOptions({
  breaks: true,
  gfm: true,
});

export const convertMarkdownToHtml = (markdown: string): string => {
  if (!markdown) return '';
  
  try {
    const result = marked(markdown);
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
