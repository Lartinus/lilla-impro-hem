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

  // Fallback till tom sträng om undefined
  const {
    info = '',
    redbox = '',
    infoAfterRedbox = '',
  } = mainInfo;

  // Omvandla markdown → HTML
  const htmlInfo  = convertMarkdownToHtml(info);
  const htmlRed   = convertMarkdownToHtmlForRedBox(redbox);
  const htmlAfter = convertMarkdownToHtml(infoAfterRedbox);

  return (
    <section className="flex justify-center px-4 md:px-0 mt-12">
      {/* Vit container */}
      <div className="bg-white max-w-5xl w-full p-8 shadow-lg rounded-none space-y-12">
        {/* Första textblocket */}
        {htmlInfo && (
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: htmlInfo }}
          />
        )}

        {/* Röd callout utan prose, med *ALLA* children vita */}
        {htmlRed && (
          <div
            className="
              rich-text             /* reset av all typography-reset */
              bg-theatre-secondary  /* röd bakgrund */
              [&_*]:text-white      /* tvingar vit text i alla nested elements */
              p-6                   /* padding inuti callouten */
              rounded-none          /* inga rundade hörn */
            "
            dangerouslySetInnerHTML={{ __html: htmlRed }}
          />
        )}

        {/* Sista textblocket */}
        {htmlAfter && (
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: htmlAfter }}
          />
        )}
      </div>
    </section>
  );
};

export default CourseInfoSection;
