
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
  start_time?: string | null;
  practical_info?: string;
  sessions?: number;
  hours_per_session?: number;
  price?: number;
  discount_price?: number;
  table_name?: string;
  currentParticipants?: number;
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
    <Card className="bg-[#E7E7E7] transition-all duration-300 flex flex-col course-card border-none shadow-none rounded-none">
      <CardContent className="p-6 md:p-6 lg:p-8 flex flex-col flex-1">
        <div>
          <h2>
            {course.course_title}
          </h2>
          {course.subtitle && (
            <div className="course-dashed-line">
              {/* Few spots warning - positioned over the dashed line */}
              {(() => {
                const remainingSpots = course.max_participants && course.currentParticipants !== undefined 
                  ? course.max_participants - course.currentParticipants 
                  : null;
                const showFewSpotsWarning = remainingSpots !== null && remainingSpots <= 5 && remainingSpots > 0;
                
                return showFewSpotsWarning ? (
                  <div className="mb-2 inline-flex items-center justify-center w-[120px] h-[22px] text-[12px] rounded-full border-2 font-rajdhani font-medium bg-primary border-primary text-white">
                    Få platser kvar
                  </div>
                ) : null;
              })()}
              
              <h3>
                {course.subtitle}
              </h3>
            </div>
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
          startTime={course.start_time}
          maxParticipants={course.max_participants}
          sessions={course.sessions}
          hoursPerSession={course.hours_per_session}
          price={course.price}
          discountPrice={course.discount_price}
          currentParticipants={course.currentParticipants}
        />
        
        <div className="flex-1"></div>
        
        {shouldShowButton && (
          <CourseBookingForm 
            courseTitle={course.course_title}
            tableName={course.table_name}
            isAvailable={courseAvailability}
            showButton={shouldShowButton}
            buttonText={isHouseTeams ? buttonText : "Betala med Stripe"}
            buttonVariant={buttonVariant}
            maxParticipants={course.maxParticipants}
            courseInstance={course.price && course.price > 0 ? {
              id: course.id.toString(),
              course_title: course.course_title,
              table_name: course.table_name || '',
              price: course.price,
              discount_price: course.discount_price || course.price,
              max_participants: course.max_participants || course.maxParticipants
            } : undefined}
            isPaidCourse={course.price && course.price > 0}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default CourseCard;
