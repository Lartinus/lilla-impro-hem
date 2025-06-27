// src/components/CourseInfoSection.tsx
import React from 'react';
import { convertMarkdownToHtml, convertMarkdownToHtmlForRedBox } from '@/utils/markdownHelpers';

interface CourseInfoSectionProps {
  mainInfo: {
    info: any;                // kan vara sträng eller AST-objekt
    redbox: any;
    infoAfterRedbox: any;
  } | null;
}

// Hjälpfunktion som plockar ut text ur både sträng- och token-objekt
function extractText(data: any): string {
  if (!data) return '';
  if (typeof data === 'string') return data;
  if (Array.isArray(data)) {
    return data.map(extractText).join('');
  }
  // Marked-token style: { text: string, tokens?: [...] }
  if (typeof data.text === 'string') return data.text;
  if (Array.isArray(data.children)) {
    return data.children.map(extractText).join('');
  }
  return '';
}

const CourseInfoSection: React.FC<CourseInfoSectionProps> = ({ mainInfo }) => {
  console.log('mainInfo:', mainInfo);
  if (!mainInfo) return null;

  // Extrahera ren markdown-sträng
  const infoMarkdown = extractText(mainInfo.info);
  const redboxMarkdown = extractText(mainInfo.redbox);
  const afterMarkdown = extractText(mainInfo.infoAfterRedbox);

  // Konvertera till HTML
  const htmlInfo = convertMarkdownToHtml(infoMarkdown);
  const htmlRedbox = convertMarkdownToHtmlForRedBox(redboxMarkdown);
  const htmlAfter = convertMarkdownToHtml(afterMarkdown);

  return (
    <section className="px-4 md:px-0 max-w-5xl mx-auto space-y-12 mt-12">
      {htmlInfo && (
        <div
          className="prose prose-invert"
          dangerouslySetInnerHTML={{ __html: htmlInfo }}
        />
      )}

      {htmlRedbox && (
        <div
          className="prose prose-invert bg-theatre-secondary text-white p-6 rounded-lg"
          dangerouslySetInnerHTML={{ __html: htmlRedbox }}
        />
      )}

      {htmlAfter && (
        <div
          className="prose prose-invert"
          dangerouslySetInnerHTML={{ __html: htmlAfter }}
        />
      )}
    </section>
  );
};

export default CourseInfoSection;
