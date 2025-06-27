// src/components/CourseInfoSection.tsx
import React from 'react';
import {
  convertMarkdownToHtml,
  convertMarkdownToHtmlForRedBox,
} from '@/utils/markdownHelpers';

interface CourseInfoSectionProps {
  mainInfo: {
    info?: string;
    redbox?: string;
    infoAfterRedbox?: string;
  } | null;
}

const CourseInfoSection: React.FC<CourseInfoSectionProps> = ({ mainInfo }) => {
  if (!mainInfo) return null;

  const {
    info = '',
    redbox = '',
    infoAfterRedbox = '',
  } = mainInfo;

  const htmlInfo  = convertMarkdownToHtml(info);
  const htmlRed   = convertMarkdownToHtmlForRedBox(redbox);
  const htmlAfter = convertMarkdownToHtml(infoAfterRedbox);

  return (
    <section className="flex justify-center px-4 md:px-0 mt-12">
      {/* den vita yttre boxen */}
      <div className="bg-white max-w-5xl w-full p-8 shadow-lg rounded-none space-y-12">
        {htmlInfo && (
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: htmlInfo }}
          />
        )}

        {htmlRed && (
          <div
            className="
              prose
              prose-invert         /* inverterar allt till vitt */
              bg-theatre-secondary /* din röda bakgrund */
              p-6                  /* inre padding */
              rounded-none         /* inga rundade hörn */
            "
            dangerouslySetInnerHTML={{ __html: htmlRed }}
          />
        )}

        {htmlAfter && (
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: htmlAfter }}
          />
        )}
      </div>
    </section>
  )
}

export default CourseInfoSection;
