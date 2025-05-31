
import CourseFAQ from '@/components/CourseFAQ';

interface CourseInfoSectionProps {
  mainInfo: any;
}

const CourseInfoSection = ({ mainInfo }: CourseInfoSectionProps) => {
  return (
    <div className="mx-[12px] md:mx-0 md:max-w-3xl md:mx-auto mt-4">
      <div className="space-y-8 border-4 border-white p-6 md:p-6 lg:p-12 bg-white rounded-none">
        <div className="text-left space-y-6">
          {mainInfo?.info && (
            <div>
              <h3 className="text-theatre-secondary font-medium mb-4 max-w-2xl text-left">
                Ett hem för dig som vill lära dig Improv Comedy – med målet att själv stå på scen.
              </h3>
              
              <div className="space-y-6 text-gray-700 leading-relaxed">
                <div 
                  className="text-base space-y-4"
                  style={{ lineHeight: '1.3' }}
                  dangerouslySetInnerHTML={{ __html: mainInfo.info }}
                />
              </div>
            </div>
          )}

          {mainInfo?.redbox && (
            <div className="bg-red-700 p-6 rounded-none relative">
              <h2 className="text-xl font-bold text-white mb-4">
                Lär dig spela det som redan är kul
              </h2>
              <div 
                className="text-base leading-relaxed text-white font-light"
                style={{ lineHeight: '1.3' }}
                dangerouslySetInnerHTML={{ __html: mainInfo.redbox }}
              />
            </div>
          )}

          {mainInfo?.infoAfterRedbox && (
            <div>
              <div 
                className="space-y-6 text-gray-700 leading-relaxed text-base"
                style={{ lineHeight: '1.3' }}
                dangerouslySetInnerHTML={{ __html: mainInfo.infoAfterRedbox }}
              />
            </div>
          )}

          <CourseFAQ />
        </div>
      </div>
    </div>
  );
};

export default CourseInfoSection;
