import { marked } from 'marked';

function preprocess(md: string): string {
  if (!md) return '';
  let s = md.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  s = s.replace(/^([#]{1,6})([^\s])/gm, '$1 $2');
  s = s.replace(/^→\s*/gm, '- ');
  return s;
}

function createCustomRenderer(isRedBox = false): marked.Renderer {
  const renderer = new marked.Renderer();

  renderer.heading = function (text, level) {
    return `<h${level}>${text}</h${level}>`;
  };

  renderer.paragraph = function (text) {
    return `<p>${text}</p>`;
  };

  renderer.list = function (body, ordered) {
    const tag = ordered ? 'ol' : 'ul';
    return `<${tag}>${body}</${tag}>`;
  };

  renderer.listitem = function (text) {
    return `<li>${text}</li>`;
  };

  renderer.link = function (href, title, text) {
    const titleAttr = title ? ` title="${title}"` : '';
    return `<a href="${href}"${titleAttr} class="underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
  };

  renderer.strong = function (text) {
    return `<strong>${text}</strong>`;
  };

  renderer.em = function (text) {
    return `<em>${text}</em>`;
  };

  renderer.del = function (text) {
    return `<del>${text}</del>`;
  };

  renderer.codespan = function (text) {
    return `<code>${text}</code>`;
  };

  renderer.code = function (code) {
    return `<pre><code>${code}</code></pre>`;
  };

  renderer.html = function (html) {
    return html.replace(/<u>(.*?)<\/u>/g, '<u class="underline">$1</u>');
  };

  return renderer;
}

export const convertMarkdownToHtml = (markdown: string): string => {
  if (!markdown) return '';
  try {
    const preprocessed = preprocess(markdown);
    const html = marked(preprocessed, { renderer: createCustomRenderer(false) });
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
    const html = marked(preprocessed, { renderer: createCustomRenderer(true) });
    return html;
  } catch (err) {
    console.error('Markdown (red box) conversion failed:', err);
    return markdown;
  }
};
