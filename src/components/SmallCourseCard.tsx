import { Card, CardContent } from '@/components/ui/card';
import CourseBookingForm from '@/components/CourseBookingForm';
import { PracticalInfo } from '@/components/PracticalInfo';
import { convertMarkdownToHtml } from '@/utils/markdownHelpers';

interface SmallCourseCardProps {
  course: any;
  practicalInfo: string[];
}

const SmallCourseCard = ({ course }: SmallCourseCardProps) => {
  // Determine remaining spots and sold-out status
  const remainingSpots = course.max_participants && course.currentParticipants !== undefined 
    ? course.max_participants - course.currentParticipants 
    : null;
  const isSoldOut = remainingSpots !== null && remainingSpots <= 0;

  // Determine behavior based on course title
  const isHouseTeams = course.course_title?.includes("House teams") || course.course_title?.includes("fortsättning");
  const isWorkshops = course.course_title?.includes("Helgworkshop") || course.course_title?.includes("specialkurs");

  // Hide button for workshops
  const shouldShowButton = course.showButton && !isWorkshops;
  const courseAvailability = isHouseTeams ? false : course.available;

  let finalButtonText = "Betala med Stripe";
  if (isHouseTeams) {
    finalButtonText = "Anmäl intresse";
  } else if (isSoldOut) {
    finalButtonText = "Väntelista";
  }

  const teacherNames = (course.teachers && course.teachers.length > 0)
    ? course.teachers.map((t: any) => t.name).join(', ')
    : (course.teacher?.name || '');

  return (
    <Card className="bg-[#E7E7E7] transition-all duration-300 flex flex-col border-none shadow-none rounded-none">
      <CardContent className="p-4 flex flex-col gap-3">
        {/* Titles */}
        <div>
          <h2 className="mb-1">{course.course_title}</h2>
          {course.subtitle && <h3 className="text-base leading-tight">{course.subtitle}</h3>}
        </div>

        {/* Short description */}
        <div className="text-sm body-text [&>p]:mb-0.5 [&>p]:mt-0"
             dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(course.description || '') }} />

        {/* Practical information */}
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

        {/* Teacher names (text only) */}
        {teacherNames && (
          <div className="text-sm -mt-2">
            <span className="font-medium">Kursledare:</span> {teacherNames}
          </div>
        )}

        {/* Booking button */}
        {shouldShowButton && (
          <CourseBookingForm
            courseTitle={course.course_title}
            tableName={course.table_name}
            isAvailable={courseAvailability}
            showButton={shouldShowButton}
            buttonText={finalButtonText}
            buttonVariant={isHouseTeams ? 'blue' : 'default'}
            maxParticipants={course.maxParticipants}
            isSoldOut={isSoldOut}
            courseInstance={course.price && course.price > 0 ? {
              id: course.id?.toString?.() || String(course.id),
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

export default SmallCourseCard;
