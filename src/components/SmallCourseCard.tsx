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
  const isImproboost = course.course_title?.toLowerCase?.().includes('improboost');

  // Hide button for workshops
  const shouldShowButton = course.showButton && !isWorkshops;
  const courseAvailability = isHouseTeams ? false : course.available;

// Normalize prices for legacy data stored in öre
const normalizedPrice = typeof course.price === 'number' && course.price >= 10000 ? Math.round(course.price / 100) : course.price;
const normalizedDiscount = typeof course.discount_price === 'number' && course.discount_price >= 10000 ? Math.round(course.discount_price / 100) : course.discount_price;

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
     <Card className="bg-[#E7E7E7] transition-all duration-300 flex-col course-card border-none shadow-none rounded-none">
      <CardContent className="p-4 flex-col flex-1">
        <div className="flex-1">
          <div className="mb-1 flex flex-col justify-start">
            <h2 className="mb-2">
              {course.course_title}
            </h2>
            {course.subtitle && (
              <h3>{course.subtitle}</h3>
            )}
          </div>
          
          {/* Dashed line with optional "Få platser kvar" tag in the middle */}
          <div className="pt-1 my-1">
            <div className="flex items-center justify-center relative mb-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-dashed border-black"></div>
              </div>
              {(() => {
                const remainingSpots = course.max_participants && course.currentParticipants !== undefined 
                  ? course.max_participants - course.currentParticipants 
                  : null;
                const isSoldOut = remainingSpots !== null && remainingSpots <= 0;
                const showFewSpotsWarning = remainingSpots !== null && remainingSpots <= 5 && remainingSpots > 0;
                
                return (isSoldOut || showFewSpotsWarning) ? (
                  <div className="relative bg-[#E7E7E7] px-2">
                    <div className="inline-flex items-center justify-center w-[120px] h-[22px] text-[12px] rounded-full border-2 font-rajdhani font-medium bg-primary border-primary text-white">
                      {isSoldOut ? "Fullbokad!" : "Få platser kvar"}
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
            
            <div className="min-h-[24px]">
              <div 
                className="mt-4 text-base body-text [&>p]:mb-0.5 [&>p]:mt-0 [&>h1]:mb-0 [&>h2]:mb-0 [&>h3]:mb-0 [&>h4]:mb-0 [&>h5]:mb-0 [&>h6]:mb-0 [&>*:first-child]:mt-0"
                dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(course.description || '') }}
              />
            </div>
          </div>
        </div>

        {/* Practical information */}
        <div className="mt-6">
          <PracticalInfo 
            practicalInfoText={course.practical_info}
            startDate={course.start_date}
            startTime={course.start_time}
            maxParticipants={course.max_participants}
            sessions={course.sessions}
            hoursPerSession={course.hours_per_session}
            price={normalizedPrice}
            discountPrice={normalizedDiscount}
            currentParticipants={course.currentParticipants}
            teacherNames={teacherNames}
          />
        </div>


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
            courseInstance={normalizedPrice && normalizedPrice > 0 ? {
              id: course.id?.toString?.() || String(course.id),
              course_title: course.course_title,
              table_name: course.table_name || '',
              price: normalizedPrice,
              discount_price: normalizedDiscount || normalizedPrice,
              max_participants: course.max_participants || course.maxParticipants
            } : undefined}
            isPaidCourse={!!normalizedPrice && normalizedPrice > 0}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default SmallCourseCard;
