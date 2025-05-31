// src/components/CourseInfoSection.tsx

import React from 'react';
import { convertMarkdownToHtml, convertMarkdownToHtmlForRedBox } from '@/utils/markdownHelpers';

interface CourseInfoSectionProps {
  mainInfo: {
    info?: string;
    redbox?: string;
    infoAfterRedbox?: string;
  } | null;
}

const CourseInfoSection: React.FC<CourseInfoSectionProps> = ({ mainInfo }) => {
  // Om mainInfo inte finns (null/undefined), returnera ingenting
  if (!mainInfo) {
    return null;
  }

  return (
    <div className="mx-[12px] md:mx-0 md:max-w-3xl md:mx-auto mt-4">
      <div className="space-y-8 border-4 border-white p-6 md:p-6 lg:p-12 bg-white rounded-none">
        <div className="text-left space-y-6">
          {/*
            1) RENDERA FÖRSTA TEXTBLOKKEN (info)
               Vi skickar in exakt den *råa* markdown‐strängen till convertMarkdownToHtml
          */}
          {mainInfo.info && (
            <div
              className="space-y-6 text-gray-700 leading-relaxed text-base"
              style={{ lineHeight: '1.3' }}
              dangerouslySetInnerHTML={{
                __html: convertMarkdownToHtml(mainInfo.info),
              }}
            />
          )}

          {/*
            2) RENDERA DEN RÖDA BOXEN (redbox)
               Här anropar vi convertMarkdownToHtmlForRedBox för att få vit text
          */}
          {mainInfo.redbox && (
            <div className="bg-red-700 p-6 rounded-none relative">
              <div
                className="text-base leading-relaxed font-light"
                style={{ lineHeight: '1.3' }}
                dangerouslySetInnerHTML={{
                  __html: convertMarkdownToHtmlForRedBox(mainInfo.redbox),
                }}
              />
            </div>
          )}

          {/*
            3) RENDERA ALLA EFTERFÖLJANDE TEXTBLOCK (infoAfterRedbox)
               Samma som första, vi återanvänder convertMarkdownToHtml
          */}
          {mainInfo.infoAfterRedbox && (
            <div
              className="space-y-6 text-gray-700 leading-relaxed text-base"
              style={{ lineHeight: '1.3' }}
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