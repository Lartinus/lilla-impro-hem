// src/components/CourseInfoSection.tsx
import React from 'react';
import {
  convertMarkdownToHtml,
  convertMarkdownToHtmlForRedBox,
} from '@/utils/markdownHelpers';

interface CourseInfoSectionProps {
  mainInfo: {
    /** Rå markdown-text för det första blocket */
    info?: string;
    /** Rå markdown-text som ska in i den röda ”callout”-boxen */
    redbox?: string;
    /** Rå markdown-text för blocket efter den röda boxen */
    infoAfterRedbox?: string;
  } | null;
}

const CourseInfoSection: React.FC<CourseInfoSectionProps> = ({ mainInfo }) => {
  if (!mainInfo) return null;

  // Destructura med fallback till tom sträng
  const {
    info = '',
    redbox = '',
    infoAfterRedbox = '',
  } = mainInfo;

  // Konvertera markdown → HTML-strängar
  const htmlInfo = convertMarkdownToHtml(info);
  const htmlRed  = convertMarkdownToHtmlForRedBox(redbox);
  const htmlAfter= convertMarkdownToHtml(infoAfterRedbox);

  return (
    <section className="px-4 md:px-0 max-w-5xl mx-auto space-y-12 mt-12">
      {htmlInfo && (
        <div
          className="prose prose-invert"
          dangerouslySetInnerHTML={{ __html: htmlInfo }}
        />
      )}

      {htmlRed && (
        <div
          className="prose prose-invert bg-theatre-secondary text-white p-6 rounded-lg"
          dangerouslySetInnerHTML={{ __html: htmlRed }}
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
