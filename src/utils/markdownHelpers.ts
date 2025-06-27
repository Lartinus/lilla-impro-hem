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

  // Endast justera färg om det är RedBox – annars låt allt ärva
  const wrapperTextClass = isRedBox ? 'rich-text rich-text-redbox' : 'rich-text';

  renderer.heading = function (token: any) {
    const text = getTextFromTokens(token.tokens);
    const depth = token.depth;
    return `<h${depth}>${text}</h${depth}>`;
  };

  renderer.paragraph = function (token: any) {
    const text = getTextFromTokens(token.tokens);
    return `<p>${text}</p>`;
  };

  renderer.list = function (token: any) {
    const body = token.items.map((item: any) => renderer.listitem(item)).join('');
    return `<ul>${body}</ul>`;
  };

  renderer.listitem = function (item: any) {
    const text = getTextFromTokens(item.tokens);
    return `<li>${text}</li>`;
  };

  renderer.link = function (token: any) {
    const text = getTextFromTokens(token.tokens);
    const href = token.href;
    const title = token.title;
    const titleAttr = title ? ` title="${title}"` : '';
    return `<a href="${href}"${titleAttr} class="underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
  };

  renderer.strong = function (token: any) {
    const text = getTextFromTokens(token.tokens);
    return `<strong>${text}</strong>`;
  };

  renderer.em = function (token: any) {
    const text = getTextFromTokens(token.tokens);
    return `<em>${text}</em>`;
  };

  renderer.del = function (token: any) {
    const text = getTextFromTokens(token.tokens);
    return `<del>${text}</del>`;
  };

  renderer.codespan = function (token: any) {
    return `<code>${token.text}</code>`;
  };

  renderer.code = function (token: any) {
    return `<pre><code>${token.text}</code></pre>`;
  };

  renderer.html = function (token: any) {
    return token.text.replace(/<u>(.*?)<\/u>/g, '<u class="underline">$1</u>');
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
    
    // Configure marked to properly parse markdown tokens including bold, italic, strikethrough
    const html = marked.parse(preprocessed, {
      gfm: true,
      breaks: false, // Don't treat single line breaks as <br>
      renderer: createCustomRenderer(false)
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
    
    // Configure marked to properly parse markdown tokens including bold, italic, strikethrough
    const html = marked.parse(preprocessed, {
      gfm: true,
      breaks: true,
      renderer: createCustomRenderer(true)
    });
    
    return html as string;
  } catch (err) {
    console.error('Markdown (red box) conversion failed:', err);
    return markdown;
  }
};
