// src/components/CourseInfoSection.tsx

import { convertMarkdownToHtml, convertMarkdownToHtmlForRedBox } from '@/utils/markdownHelpers';

interface CourseInfoSectionProps {
  mainInfo: {
    info?: string;
    redbox?: string;
    infoAfterRedbox?: string;
  };
}

const CourseInfoSection = ({ mainInfo }: CourseInfoSectionProps) => {
  return (
    <div className="mx-[12px] md:mx-0 md:max-w-3xl md:mx-auto mt-4">
      <div className="space-y-8 border-4 border-white p-6 md:p-6 lg:p-12 bg-white rounded-none">
        <div className="text-left space-y-6">
          {mainInfo?.info && (
            <div
              className="space-y-6 text-gray-700 leading-relaxed text-base"
              style={{ lineHeight: '1.3' }}
              dangerouslySetInnerHTML={{
                __html: convertMarkdownToHtml(String(mainInfo.info)),
              }}
            />
          )}

          {mainInfo?.redbox && (
            <div className="bg-red-700 p-6 rounded-none relative">
              <div
                className="text-base leading-relaxed font-light"
                style={{ lineHeight: '1.3' }}
                dangerouslySetInnerHTML={{
                  __html: convertMarkdownToHtmlForRedBox(String(mainInfo.redbox)),
                }}
              />
            </div>
          )}

          {mainInfo?.infoAfterRedbox && (
            <div
              className="space-y-6 text-gray-700 leading-relaxed text-base"
              style={{ lineHeight: '1.3' }}
              dangerouslySetInnerHTML={{
                __html: convertMarkdownToHtml(String(mainInfo.infoAfterRedbox)),
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseInfoSection;