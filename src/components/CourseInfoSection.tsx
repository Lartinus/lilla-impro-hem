import React from 'react';
import {
  convertMarkdownToHtml,
  convertMarkdownToHtmlForRedBox
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

  return (
    <div className="mx-[12px] md:mx-0 md:max-w-3xl md:mx-auto mt-4">
      <div className="space-y-6 border-4 border-white p-6 md:p-6 lg:p-12 bg-white rounded-none">
        <div className="text-left space-y-6">

          {/* 1. FÖRSTA TEXTBLOKKEN */}
          {mainInfo.info && (
            <div
              dangerouslySetInnerHTML={{
                __html: convertMarkdownToHtml(mainInfo.info),
              }}
            />
          )}

          {/* 2. DEN RÖDA BOXEN */}
          {mainInfo.redbox && (
            <div className="bg-red-700 p-6 rounded-none relative">
              <div
                dangerouslySetInnerHTML={{
                  __html: convertMarkdownToHtmlForRedBox(mainInfo.redbox),
                }}
              />
            </div>
          )}

          {/* 3. TEXT EFTER RÖDA BOXEN */}
          {mainInfo.infoAfterRedbox && (
            <div
              dangerouslySetInnerHTML={{
                __html: convertMarkdownToHtml(mainInfo.infoAfterRedbox),
              }}
            />
          )}

        </div>
      </div>
    </div>
  );
};

export default CourseInfoSection;
