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

  // Sätt in mellanslag efter rubriker som saknar det (##Rubrik -> ## Rubrik)
  s = s.replace(/^([#]{1,6})([^\s])/gm, '$1 $2');

  // Konvertera pil-listor till markdown-listor
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
    const preprocessed = preprocess(markdown);
    const renderer = createCustomRenderer(false);

    marked.use({ renderer }); // Registrera renderern först
    const html = marked.parse(preprocessed);

    return html;
  } catch (err) {
    console.error('Markdown conversion failed:', err);
    return markdown;
  }
};

export const convertMarkdownToHtmlForRedBox = (markdown: string): string => {
  if (!markdown) return '';

  try {
    const preprocessed = preprocess(markdown);
    const renderer = createCustomRenderer(true);

    const tokens = marked.lexer(preprocessed);
    const html = marked.parser(tokens, { renderer });

    return html;
  } catch (err) {
    console.error('Markdown (red box) conversion failed:', err);
    return markdown;
  }
};
