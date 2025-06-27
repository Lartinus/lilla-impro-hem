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
  const htmlInfo  = convertMarkdownToHtml(info);
  const htmlRed   = convertMarkdownToHtmlForRedBox(redbox);
  const htmlAfter = convertMarkdownToHtml(infoAfterRedbox);

  return (
    <section className="flex justify-center px-4 md:px-0 mt-12">
      {/* DEN VITA RUTAN */}
      <div
        className="
          bg-white               /* Vit bakgrund */
          dark:bg-gray-900       /* Mörk variant om dark mode */
          text-gray-900          /* Text‐färg i ljust läge */
          dark:text-gray-100     /* Text‐färg i mörkt läge */
          max-w-5xl w-full        /* Max‐bredd + full bredd på små skärmar */
          p-8                    /* Padding runt allt innehåll */
          shadow-lg              /* Mjuk skugga för djup */
          space-y-12             /* Avstånd mellan blocken */
        "
      >
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
              bg-theatre-secondary  /* Din röda bakgrund */
              text-white            /* Vit text i röd box */
              p-6                   /* Padding i callouten */
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
  );
};

export default CourseInfoSection;
