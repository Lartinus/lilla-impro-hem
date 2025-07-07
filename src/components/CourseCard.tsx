
import { Card, CardContent } from '@/components/ui/card';
import CourseBookingForm from '@/components/CourseBookingForm';
import CourseLeaderInfo from '@/components/CourseLeaderInfo';
import { PracticalInfo } from '@/components/PracticalInfo';
import { convertMarkdownToHtml } from '@/utils/markdownHelpers';
import { ArrowRight } from 'lucide-react';

interface Teacher {
  id: number;
  name: string;
  image: string | null;
  bio: string;
}

interface Course {
  id: number | string;
  course_title: string;
  subtitle?: string;
  description: string;
  teacher?: {
    id: string;
    name: string;
    image: string | null;
    bio: string;
  } | null;
  teachers?: Array<{
    id: string;
    name: string;
    image: string | null;
    bio: string;
  }>;
  available: boolean;
  showButton: boolean;
  buttonText?: string;
  practicalInfo?: string[];
  maxParticipants?: number | null;
  max_participants?: number | null;
  start_date?: string | null;
  practical_info?: string;
  sessions?: number;
  hours_per_session?: number;
  price?: number;
  discount_price?: number;
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
  const isHouseTeams = course.course_title.includes("House teams") || course.course_title.includes("fortsättning");
  const isWorkshops = course.course_title.includes("Helgworkshop") || course.course_title.includes("specialkurs");
  
  // Hide button for workshops course
  const shouldShowButton = course.showButton && !isWorkshops;
  
  // For house teams, set available to false to show interest form
  const courseAvailability = isHouseTeams ? false : course.available;
  const buttonText = isHouseTeams ? "Anmäl intresse" : course.buttonText;
  const buttonVariant = isHouseTeams ? "blue" : "default";

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-4 border-white shadow-lg bg-white rounded-none flex flex-col course-card flex-1 min-w-0 md:min-w-[calc(50%-12px)]">
      <CardContent className="p-6 md:p-6 lg:p-8 flex flex-col flex-1">
        <div className="mb-3">
          <h2>
            {course.course_title}
          </h2>
          {course.subtitle && (
            <p className="mt-1 font-bold text-xs">
              {course.subtitle}
            </p>
          )}
        </div>
        <div 
          className="mb-4 text-base body-text mt-0 [&>p]:mb-0.5 [&>p]:mt-0 [&>h1]:mb-0 [&>h2]:mb-0 [&>h3]:mb-0 [&>h4]:mb-0 [&>h5]:mb-0 [&>h6]:mb-0 [&>*:first-child]:mt-0"
          dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(course.description || '') }}
        />
        
        {/* Show all teachers */}
        {course.teachers && course.teachers.length > 0 ? (
          <CourseLeaderInfo 
            courseLeaders={course.teachers.map(teacher => ({
              id: parseInt(teacher.id),
              name: teacher.name,
              image: teacher.image,
              bio: teacher.bio
            }))} 
          />
        ) : course.teacher ? (
          <CourseLeaderInfo courseLeaders={[{
            id: parseInt(course.teacher.id),
            name: course.teacher.name,
            image: course.teacher.image,
            bio: course.teacher.bio
          }]} />
        ) : null}
        
        {/* Practical Information */}
        <PracticalInfo 
          practicalInfoText={course.practical_info}
          startDate={course.start_date}
          maxParticipants={course.max_participants}
          sessions={course.sessions}
          hoursPerSession={course.hours_per_session}
          price={course.price}
          discountPrice={course.discount_price}
        />
        
        <div className="flex-1"></div>
        
        {shouldShowPracticalInfo && (
          <div className="mb-4">
            <h4 className="mb-2">Praktisk information</h4>
            <div className="space-y-2">
              {course.practicalInfo!.map((item, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                  <p className="[&>p]:text-[14px] md:[&>p]:text-[16px]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {shouldShowButton && (
          <CourseBookingForm 
            courseTitle={course.course_title}
            isAvailable={courseAvailability}
            showButton={shouldShowButton}
            buttonText={buttonText}
            buttonVariant={buttonVariant}
            maxParticipants={course.maxParticipants}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default CourseCard;
