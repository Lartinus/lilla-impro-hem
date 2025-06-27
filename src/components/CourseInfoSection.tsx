// src/components/CourseInfoSection.tsx
import React from 'react'
import {
  convertMarkdownToHtml,
  convertMarkdownToHtmlForRedBox,
} from '@/utils/markdownHelpers'

interface CourseInfoSectionProps {
  mainInfo: {
    /** Rå markdown-text för första blocket */
    info?: string
    /** Rå markdown-text som ska in i den röda boxen */
    redbox?: string
    /** Rå markdown-text för blocket efter den röda boxen */
    infoAfterRedbox?: string
  } | null
}

const CourseInfoSection: React.FC<CourseInfoSectionProps> = ({ mainInfo }) => {
  if (!mainInfo) return null

  const { info = '', redbox = '', infoAfterRedbox = '' } = mainInfo

  // Konvertera markdown till HTML
  const htmlInfo = info ? convertMarkdownToHtml(info) : ''
  const htmlRedbox = redbox ? convertMarkdownToHtmlForRedBox(redbox) : ''
  const htmlAfter = infoAfterRedbox ? convertMarkdownToHtml(infoAfterRedbox) : ''

  return (
    <section className="px-4 md:px-0 max-w-5xl mx-auto space-y-12 mt-12">
      {htmlInfo && (
        <div
          className="prose prose-invert"
          dangerouslySetInnerHTML={{ __html: htmlInfo }}
        />
      )}

      {htmlRedbox && (
        <div
          className="prose prose-invert bg-theatre-secondary text-white p-6 rounded-lg"
          dangerouslySetInnerHTML={{ __html: htmlRedbox }}
        />
      )}

      {htmlAfter && (
        <div
          className="prose prose-invert"
          dangerouslySetInnerHTML={{ __html: htmlAfter }}
        />
      )}
    </section>
  )
}

export default CourseInfoSection
