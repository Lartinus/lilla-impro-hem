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

  renderer.heading = function(token: any) {
    const text = getTextFromTokens(token.tokens);
    const depth = token.depth;
    const headingColor = isRedBox ? 'text-white' : 'text-gray-800';
    const classes: Record<number, string> = {
      1: `text-xl md:text-2xl lg:text-3xl font-bold leading-tight ${headingColor} tracking-normal mb-2`,
      2: `text-xl font-bold ${headingColor} mb-2`,
      3: `text-lg font-medium ${isRedBox ? 'text-white' : 'text-theatre-secondary'} mb-1 mt-1`,
      4: `text-base font-bold ${headingColor} mb-1`,
      5: `text-base font-semibold ${headingColor} mb-1`,
      6: `text-base font-medium ${headingColor} mb-1`,
    };
    const cls = classes[depth] || classes[4];
    return `<h${depth} class="${cls}">${text}</h${depth}>`;
  };

  renderer.paragraph = function(token: any) {
    const text = getTextFromTokens(token.tokens);
    return `<p class="${textColor} my-5" style="line-height: 2.0;">${text}</p>`;
  };

  renderer.list = function(token: any) {
    const body = token.items.map((item: any) => {
      const text = getTextFromTokens(item.tokens);
      return `<li class="flex items-start space-x-3 my-1">
                <div class="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" style="margin-top: 8px;"></div>
                <span class="flex-1 ${textColor}">${text}</span>
              </li>`;
    }).join('');
    return `<ul class="space-y-2 my-4">${body}</ul>`;
  };
  
  renderer.listitem = function(item: any) {
    const text = getTextFromTokens(item.tokens);
    return `<li class="flex items-start space-x-3 my-1">
              <div class="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" style="margin-top: 8px;"></div>
              <span class="flex-1 ${textColor}">${text}</span>
            </li>`;
  };

  renderer.link = function(token: any) {
    const text = getTextFromTokens(token.tokens);
    const href = token.href;
    const title = token.title;
    const titleAttr = title ? ` title="${title}"` : '';
    return `<a href="${href}"${titleAttr} class="${linkColor} underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
  };

  renderer.strong = function(token: any) {
    const text = getTextFromTokens(token.tokens);
    return `<strong class="font-bold">${text}</strong>`;
  };

  renderer.em = function(token: any) {
    const text = getTextFromTokens(token.tokens);
    return `<em class="italic">${text}</em>`;
  };

  renderer.del = function(token: any) {
    const text = getTextFromTokens(token.tokens);
    return `<del class="line-through">${text}</del>`;
  };

  renderer.codespan = function(token: any) {
    const bgColor = isRedBox ? 'bg-gray-700' : 'bg-gray-100';
    return `<code class="${bgColor} px-1 py-0.5 rounded text-sm">${token.text}</code>`;
  };

  renderer.code = function(token: any) {
    const bgColor = isRedBox ? 'bg-gray-700' : 'bg-gray-100';
    return `<pre class="${bgColor} p-4 rounded overflow-x-auto my-5"><code class="text-sm">${token.text}</code></pre>`;
  };

  // Hantera HTML-element direkt (för understrukning)
  renderer.html = function(token: any) {
    // Hantera <u> tags för understrukning
    const processedText = token.text.replace(/<u>(.*?)<\/u>/g, '<u class="underline">$1</u>');
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
