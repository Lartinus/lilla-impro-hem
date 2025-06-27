import React from 'react';

interface CourseInfoSectionProps {
  mainInfo: {
    info: string;
    redbox: string;
    infoAfterRedbox: string;
  };
}

const CourseInfoSection: React.FC<CourseInfoSectionProps> = ({ mainInfo }) => {
  if (!mainInfo) return null;

  return (
    <section className="px-4 md:px-0 max-w-5xl mx-auto space-y-12 mt-12">
      {/* Vanlig info */}
      {mainInfo.info && (
        <div
          className="rich-text"
          dangerouslySetInnerHTML={{ __html: mainInfo.info }}
        />
      )}

      {/* Redbox */}
      {mainInfo.redbox && (
        <div
          className="rich-text rich-text-redbox"
          dangerouslySetInnerHTML={{ __html: mainInfo.redbox }}
        />
      )}

      {/* Info efter redbox */}
      {mainInfo.infoAfterRedbox && (
        <div
          className="rich-text"
          dangerouslySetInnerHTML={{ __html: mainInfo.infoAfterRedbox }}
        />
      )}
    </section>
  );
};

export default CourseInfoSection;
