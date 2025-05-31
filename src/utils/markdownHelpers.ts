
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
// PREPROCESS: Normalisera markdown-input och hantera pil-listor
//
function preprocess(md: string): string {
  if (!md) return '';

  // Ta bort BOM och normalisera radslut
  let s = md.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');

  // Sätt in blanksteg efter rubriker som saknar det
  s = s.replace(/(^|\n)(#{1,6})(?=\S)/g, '$1$2 ');

  // Konvertera pil-listor till markdown-listor för korrekt hantering
  s = s.replace(/^→\s*/gm, '- ');

  return s;
}

// Custom renderer för att hantera specifika markdown-element
function createCustomRenderer(isRedBox = false): any {
  const renderer = new marked.Renderer();
  
  const textColor = isRedBox ? 'text-white' : 'text-gray-800';
  const linkColor = isRedBox ? 'text-ljusbla hover:text-ljusbla' : 'text-blue-500 hover:text-blue-700';
  const arrowColor = isRedBox ? 'text-blue-300' : 'text-blue-500';

  renderer.heading = function(text: string, level: number) {
    const headingColor = isRedBox ? 'text-white' : 'text-gray-800';
    const classes: Record<number, string> = {
      1: `text-xl md:text-2xl lg:text-3xl font-bold leading-tight ${headingColor} tracking-normal mb-2`,
      2: `text-xl font-bold ${headingColor} mb-2`,
      3: `text-lg font-medium ${isRedBox ? 'text-white' : 'text-theatre-secondary'} mb-1 mt-1`,
      4: `text-base font-bold ${headingColor} mb-1`,
      5: `text-base font-semibold ${headingColor} mb-1`,
      6: `text-base font-medium ${headingColor} mb-1`,
    };
    const cls = classes[level] || classes[4];
    return `<h${level} class="${cls}">${text}</h${level}>`;
  };

  renderer.paragraph = function(text: string) {
    return `<p class="${textColor} my-5" style="line-height: 2.0;">${text}</p>`;
  };

  renderer.list = function(body: string, ordered: boolean) {
    return `<div class="my-5">${body}</div>`;
  };
  
  renderer.listitem = function(text: string) {
    return `<div class="arrow-list-item ml-10 my-1 relative ${textColor}">
              <span class="absolute -left-10 font-bold ${arrowColor}">→</span>
              <span>${text}</span>
            </div>`;
  };

  renderer.link = function(href: string, title: string | null, text: string) {
    const titleAttr = title ? ` title="${title}"` : '';
    return `<a href="${href}"${titleAttr} class="${linkColor} underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
  };

  renderer.strong = function(text: string) {
    return `<strong class="font-bold">${text}</strong>`;
  };

  renderer.em = function(text: string) {
    return `<em class="italic">${text}</em>`;
  };

  renderer.del = function(text: string) {
    return `<del class="line-through">${text}</del>`;
  };

  renderer.codespan = function(text: string) {
    const bgColor = isRedBox ? 'bg-gray-700' : 'bg-gray-100';
    return `<code class="${bgColor} px-1 py-0.5 rounded text-sm">${text}</code>`;
  };

  renderer.code = function(code: string, language: string) {
    const bgColor = isRedBox ? 'bg-gray-700' : 'bg-gray-100';
    return `<pre class="${bgColor} p-4 rounded overflow-x-auto my-5"><code class="text-sm">${code}</code></pre>`;
  };

  // Hantera HTML-element direkt (för understrukning)
  renderer.html = function(html: string) {
    // Hantera <u> tags för understrukning
    const processedText = html.replace(/<u>(.*?)<\/u>/g, '<u class="underline">$1</u>');
    return processedText;
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
    
    // Konfigurera marked för att korrekt hantera markdown med äldre API
    marked.setOptions({
      gfm: true,
      breaks: true,
      renderer: createCustomRenderer(false)
    });
    
    const html = marked(preprocessed);
    
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
    
    // Konfigurera marked för att korrekt hantera markdown med äldre API
    marked.setOptions({
      gfm: true,
      breaks: true,
      renderer: createCustomRenderer(true)
    });
    
    const html = marked(preprocessed);
    
    return html as string;
  } catch (err) {
    console.error('Markdown (red box) conversion failed:', err);
    return markdown;
  }
};
