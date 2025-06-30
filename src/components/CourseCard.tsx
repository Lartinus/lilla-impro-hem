
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
  maxParticipants?: number | null;
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
  
  // For house teams, set available to false to show interest form
  const courseAvailability = isHouseTeams ? false : course.available;
  const buttonText = isHouseTeams ? "Anmäl intresse" : course.buttonText;

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-4 border-white shadow-lg bg-white rounded-none flex flex-col course-card">
      <CardContent className="p-6 md:p-6 lg:p-8 flex flex-col flex-1">
        <div className="mb-3">
          <h2>
            {course.title}
          </h2>
          {course.subtitle && (
            <h5 className="mt-2">
              {course.subtitle}
            </h5>
          )}
        </div>
        <div 
          className="mb-4 text-base body-text mt-0 [&>p]:mb-0.5 [&>p]:mt-0 [&>h1]:mb-0 [&>h2]:mb-0 [&>h3]:mb-0 [&>h4]:mb-0 [&>h5]:mb-0 [&>h6]:mb-0 [&>*:first-child]:mt-0"
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
            <h4 className="mb-2">Praktisk information</h4>
            <div className="space-y-2">
              {course.practicalInfo!.map((item, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div 
                    className="bullet-point bg-blue-500 rounded-full flex-shrink-0 mt-2"
                    style={{ width: 'var(--bullet-size)', height: 'var(--bullet-size)' }}
                  ></div>
                  <p className="[&>p]:text-[14px] md:[&>p]:text-[16px]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {shouldShowButton && (
          <CourseBookingForm 
            courseTitle={course.title}
            isAvailable={courseAvailability}
            showButton={shouldShowButton}
            buttonText={buttonText}
            buttonVariant={isHouseTeams ? "outline" : "default"}
            maxParticipants={course.maxParticipants}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default CourseCard;
