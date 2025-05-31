// src/utils/markdownHelpers.ts

import { marked } from 'marked';

//
// 1) Hjälpfunktion: Utvinn alltid ren text från en token eller sträng
//
function getTextContent(input: any): string {
  if (typeof input === 'string') {
    return input;
  }
  if (input == null) {
    return '';
  }
  // Om input har .text-egenskap
  if (typeof input === 'object' && 'text' in input && typeof input.text === 'string') {
    return input.text;
  }
  // Om input har tokens-array, slå ihop alla
  if (typeof input === 'object' && Array.isArray((input as any).tokens)) {
    return (input as any).tokens.map(getTextContent).join('');
  }
  // Fallback
  return String(input);
}

//
// 2) Preprocess: Lägg till blankrad före rubriker, hantera pil-listor
//
function preprocess(markdown: string): string {
  if (!markdown) return '';
  return markdown
    .replace(/^→\s+(.+)$/gm, '→ $1')
    .replace(/^(#{1,6})\s+(.+)$/gm, '\n$1 $2\n');
}

//
// 3) Skapa "normal" renderer (ljus bakgrund, mörk text)
//
function createNormalRenderer(): any {
  const renderer: any = new marked.Renderer();

  renderer.heading = (textToken: any, level: number, raw: string, slugger: any) => {
    const text = getTextContent(textToken);
    const sizes: Record<number, string> = {
      1: 'text-2xl font-bold text-gray-800 my-4',
      2: 'text-xl font-bold text-gray-800 mb-3',
      3: 'text-lg font-medium text-theatre-secondary mb-3',
      4: 'text-base font-bold text-gray-800 mb-2',
      5: 'text-base font-semibold text-gray-800 mb-2',
      6: 'text-base font-medium text-gray-800 mb-2',
    };
    const cls = sizes[level] || sizes[4];
    const idAttr = slugger.slug(text);
    return `<h${level} id="${idAttr}" class="${cls}">${text}</h${level}>`;
  };

  renderer.paragraph = (textToken: any) => {
    const text = getTextContent(textToken).trim();
    if (text.startsWith('→')) {
      return `<p class="arrow-list-item ml-4 my-2 relative"><span class="absolute left-0 font-bold text-blue-500">→</span> ${
        text.substring(1).trim()
      }</p>`;
    }
    return `<p class="text-gray-800 my-4">${text}</p>`;
  };

  renderer.list = (body: string, ordered: boolean, start: number) => {
    const tag = ordered ? 'ol' : 'ul';
    const cls = ordered ? 'list-decimal' : 'list-disc';
    return `<${tag} class="${cls} ml-6 my-4">${body}</${tag}>`;
  };

  renderer.listitem = (textToken: any) => {
    const text = getTextContent(textToken);
    return `<li class="text-gray-800 my-1">${text}</li>`;
  };

  renderer.link = (href: string, title: string | null, textToken: any) => {
    const text = getTextContent(textToken);
    const titleAttr = title ? ` title="${title}"` : '';
    return `<a href="${href}"${titleAttr} class="text-blue-500 hover:text-blue-700 underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
  };

  renderer.strong = (textToken: any) => {
    const text = getTextContent(textToken);
    return `<strong class="font-bold">${text}</strong>`;
  };

  renderer.em = (textToken: any) => {
    const text = getTextContent(textToken);
    return `<em class="italic">
