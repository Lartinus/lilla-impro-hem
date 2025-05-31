
import { Card, CardContent } from '@/components/ui/card';
import CourseBookingForm from '@/components/CourseBookingForm';
import CourseLeaderInfo from '@/components/CourseLeaderInfo';
import { convertMarkdownToHtml } from '@/utils/markdownHelpers';
import { getStrapiImageUrl } from '@/utils/strapiHelpers';

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
  // Only show practical info if the course has specific info
  const hasCourseSpecificInfo = course.practicalInfo && course.practicalInfo.length > 0;
  const shouldShowPracticalInfo = hasCourseSpecificInfo;

  // Determine button behavior based on course title
  const isHouseTeams = course.title.includes("House teams") || course.title.includes("fortsättning");
  const isWorkshops = course.title.includes("Helgworkshop") || course.title.includes("specialkurs");
  
  // Hide button for workshops course
  const shouldShowButton = course.showButton && !isWorkshops;
  
  // Make button blue for house teams
  const buttonVariant = isHouseTeams ? "default" : "default";

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
          className="text-gray-700 mb-4 text-base [&>p]:mb-0.5 [&>h1]:mb-0 [&>h2]:mb-0 [&>h3]:mb-0 [&>h4]:mb-0 [&>h5]:mb-0 [&>h6]:mb-0"
          style={{ lineHeight: '1.2' }}
          dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(course.description || '') }}
        />
        
        {course.teacher && (
          <CourseLeaderInfo courseLeader={{
            id: course.teacher.id,
            name: course.teacher.name,
            image: getStrapiImageUrl(course.teacher.image),
            bio: course.teacher.bio
          }} />
        )}
        
        <div className="flex-1"></div>
        
        {shouldShowPracticalInfo && (
          <div className="mb-4">
            <h4 className="text-gray-800 font-bold mb-1">Praktisk information</h4>
            <div className="space-y-2">
              {course.practicalInfo!.map((item, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                  <p className="text-gray-700 text-base" style={{ lineHeight: '1.2' }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {shouldShowButton && (
          <CourseBookingForm 
            courseTitle={course.title}
            isAvailable={course.available}
            showButton={shouldShowButton}
            buttonText={course.buttonText}
            buttonVariant={isHouseTeams ? "outline" : "default"}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default CourseCard;
