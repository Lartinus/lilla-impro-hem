
import { Card, CardContent } from '@/components/ui/card';
import CourseBookingForm from '@/components/CourseBookingForm';
import CourseLeaderInfo from '@/components/CourseLeaderInfo';
import { convertMarkdownToHtml } from '@/utils/markdownHelpers';

interface Teacher {
  id: number;
  name: string;
  image: string | null;
  bio: string;
}

interface Course {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  teacher: Teacher | null;
  available: boolean;
  showButton: boolean;
  buttonText?: string;
  practicalInfo?: string[];
}

interface CourseCardProps {
  course: Course;
  practicalInfo: string[];
}

const CourseCard = ({ course, practicalInfo }: CourseCardProps) => {
  // Determine which practical info to show
  const hasCourseSpecificInfo = course.practicalInfo && course.practicalInfo.length > 0;
  const infoToShow = hasCourseSpecificInfo ? course.practicalInfo : practicalInfo;
  const shouldShowPracticalInfo = infoToShow && infoToShow.length > 0;

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-4 border-white shadow-lg bg-white rounded-none flex flex-col">
      <CardContent className="p-6 md:p-6 lg:p-8 flex flex-col flex-1">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-blue-500 mb-2">
            {course.title}
          </h2>
          {course.subtitle && (
            <h3 className="text-theatre-secondary font-medium mb-1">
              {course.subtitle}
            </h3>
          )}
        </div>
        
        <div 
          className="text-gray-700 leading-relaxed mb-4 text-base"
          dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(course.description || '') }}
        />
        
        {course.teacher && (
          <CourseLeaderInfo courseLeader={{
            id: course.teacher.id,
            name: course.teacher.name,
            image: course.teacher.image,
            bio: course.teacher.bio
          }} />
        )}
        
        <div className="flex-1"></div>
        
        {shouldShowPracticalInfo && (
          <div className="mb-4">
            <h4 className="text-gray-800 font-bold mb-1">Praktisk information</h4>
            <div className="space-y-2">
              {infoToShow.map((item, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                  <p className="text-gray-700 text-base">{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <CourseBookingForm 
          courseTitle={course.title}
          isAvailable={course.available}
          showButton={course.showButton}
          buttonText={course.buttonText}
        />
      </CardContent>
    </Card>
  );
};

export default CourseCard;
