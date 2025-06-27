import React from 'react';
import { convertMarkdownToHtml, convertMarkdownToHtmlForRedBox } from '@/utils/markdownHelpers';

interface CourseInfoSectionProps {
  mainInfo: {
    info: string | object;
    redbox: string | object;
    infoAfterRedbox: string | object;
  };
}

// Säkerställ att vi konverterar till string även om det råkar vara ett objekt
function ensureString(input: string | object): string {
  if (typeof input === 'string') return input;
  try {
    return JSON.stringify(input, null, 2); // Felsäkert, så att man åtminstone får en synlig text
  } catch {
    return '[object Object]';
  }
}

const CourseInfoSection: React.FC<CourseInfoSectionProps> = ({ mainInfo }) => {
  if (!mainInfo) return null;

  console.log('mainInfo:', mainInfo);
  
  const rawInfo = ensureString(mainInfo.info);
  const rawRedbox = ensureString(mainInfo.redbox);
  const rawAfter = ensureString(mainInfo.infoAfterRedbox);

  const htmlInfo = convertMarkdownToHtml(rawInfo);
  const htmlRedbox = convertMarkdownToHtmlForRedBox(rawRedbox);
  const htmlAfter = convertMarkdownToHtml(rawAfter);

  return (
    <section className="px-4 md:px-0 max-w-5xl mx-auto space-y-12 mt-12">
      {htmlInfo && (
        <div className="prose prose-invert" dangerouslySetInnerHTML={{ __html: htmlInfo }} />
      )}

      {htmlRedbox && (
        <div className="prose prose-invert bg-theatre-secondary text-white p-6 rounded-lg" dangerouslySetInnerHTML={{ __html: htmlRedbox }} />
      )}

      {htmlAfter && (
        <div className="prose prose-invert" dangerouslySetInnerHTML={{ __html: htmlAfter }} />
      )}
    </section>
  );
};

export default CourseInfoSection;
