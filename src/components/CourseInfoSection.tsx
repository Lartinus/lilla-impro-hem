import React from 'react';
import { convertMarkdownToHtml, convertMarkdownToHtmlForRedBox } from '@/utils/markdownHelpers';

interface CourseInfoSectionProps {
  mainInfo: {
    info: string;
    redbox: string;
    info_efter_redbox: string; // ✅ Korrekt namn!
  };
}

const CourseInfoSection: React.FC<CourseInfoSectionProps> = ({ mainInfo }) => {
  if (!mainInfo) return null;

  const htmlInfo = convertMarkdownToHtml(mainInfo.info);
  const htmlRedbox = convertMarkdownToHtmlForRedBox(mainInfo.redbox);
  const htmlAfter = convertMarkdownToHtml(mainInfo.info_efter_redbox); // ✅ Uppdaterat här

  return (
    <section className="px-4 md:px-0 max-w-5xl mx-auto space-y-12 mt-12">
      {htmlInfo && (
        <div className="prose prose-invert" dangerouslySetInnerHTML={{ __html: htmlInfo }} />
      )}
      {htmlRedbox && (
        <div
          className="prose prose-invert bg-theatre-secondary text-white p-6 rounded-lg"
          dangerouslySetInnerHTML={{ __html: htmlRedbox }}
        />
      )}
      {htmlAfter && (
        <div className="prose prose-invert" dangerouslySetInnerHTML={{ __html: htmlAfter }} />
      )}
    </section>
  );
};

export default CourseInfoSection;