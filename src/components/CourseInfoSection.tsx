
// src/components/CourseInfoSection.tsx
import React from 'react'
import {
  convertMarkdownToHtml,
  convertMarkdownToHtmlForRedBox,
} from '@/utils/markdownHelpers'

interface CourseInfoSectionProps {
  mainInfo:
    | {
        info?: string
        redbox?: string
        infoAfterRedbox?: string
      }
    | null
}

const CourseInfoSection: React.FC<CourseInfoSectionProps> = ({ mainInfo }) => {
  if (!mainInfo) return null

  const {
    info = '',
    redbox = '',
    infoAfterRedbox = '',
  } = mainInfo

  const htmlInfo = convertMarkdownToHtml(info)
  const htmlRed = convertMarkdownToHtmlForRedBox(redbox)
  const htmlAfter = convertMarkdownToHtml(infoAfterRedbox)

  return (
    <section className="flex justify-center px-4 md:px-0 mt-12">
      <div className="bg-white max-w-5xl w-full p-8 shadow-lg rounded-none space-y-12">
        {/* Första textblocket */}
        {htmlInfo && (
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: htmlInfo }}
          />
        )}

        {/* Röd callout med vit text */}
        {htmlRed && (
          <div
            className="bg-theatre-secondary p-6 rounded-none text-white [&>*]:text-white [&>p]:text-white [&>h1]:text-white [&>h2]:text-white [&>h3]:text-white [&>h4]:text-white [&>h5]:text-white [&>h6]:text-white"
            dangerouslySetInnerHTML={{ __html: htmlRed }}
          />
        )}

        {/* Avslutande textblock */}
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

export default CourseInfoSection
