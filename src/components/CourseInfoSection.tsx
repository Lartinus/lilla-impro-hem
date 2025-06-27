import React from 'react';
import { convertMarkdownToHtml, convertMarkdownToHtmlForRedBox } from '@/utils/markdownHelpers';

interface CourseInfoSectionProps {
  mainInfo: {
    info: string;
    redbox: string;
    infoAfterRedbox: string;
  };
}

const CourseInfoSection: React.FC<CourseInfoSectionProps> = ({ mainInfo }) => {
  if (!mainInfo) return null;

  // ⬇️ Konvertera markdown till HTML
  const htmlInfo = convertMarkdownToHtml(mainInfo.info);
  const htmlRedbox = convertMarkdownToHtmlForRedBox(mainInfo.redbox);
  const htmlAfter = convertMarkdownToHtml(mainInfo.infoAfterRedbox);

  return (
    <section className="px-4 md:px-0 max-w-5xl mx-auto space-y-12 mt-12">
      {htmlInfo && (
        <div className="rich-text" dangerouslySetInnerHTML={{ __html: htmlInfo }} />
      )}

      {htmlRedbox && (
        <div className="rich-text rich-text-redbox" dangerouslySetInnerHTML={{ __html: htmlRedbox }} />
      )}

      {htmlAfter && (
        <div className="rich-text" dangerouslySetInnerHTML={{ __html: htmlAfter }} />
      )}
    </section>
  );
};

export default CourseInfoSection;
