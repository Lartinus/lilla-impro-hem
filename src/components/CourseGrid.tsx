import CourseCard from '@/components/CourseCard';
import { InterestSignupSection } from '@/components/InterestSignupSection';

interface CourseGridProps {
  courses: any[];
  practicalInfo: string[];
  showInterestSection?: boolean;
}

const CourseGrid = ({ courses, practicalInfo, showInterestSection = false }: CourseGridProps) => {
  // Separate regular courses from fixed info courses
  const regularCourses = courses.filter(course => 
    !course.course_title.includes("House teams") && 
    !course.course_title.includes("fortsättning") &&
    !course.course_title.includes("Helgworkshop") && 
    !course.course_title.includes("specialkurs")
  );
  
  const fixedInfoCourses = courses.filter(course => 
    course.course_title.includes("House teams") || 
    course.course_title.includes("fortsättning") ||
    course.course_title.includes("Helgworkshop") || 
    course.course_title.includes("specialkurs")
  );

  if (courses.length === 0) {
    return (
      <div className="grid md:grid-cols-2 gap-6 mb-6 mx-[12px] md:mx-0 md:max-w-5xl md:mx-auto">
        <div className="col-span-2 text-center text-white text-xl">
          Vi har inga kurser planerade just nu! Kom gärna tillbaka senare eller följ oss i våra kanaler för info om framtida kurser.
        </div>
      </div>
    );
  }

  // Check if we have an even number of regular courses
  const isEvenNumber = regularCourses.length % 2 === 0;
  
  // If we have an even number of courses, just use simple grid
  if (isEvenNumber || !showInterestSection) {
    return (
      <div className="mb-6">
        <div className="grid md:grid-cols-2 gap-6 mb-6 mx-[12px] md:mx-0 md:max-w-5xl md:mx-auto">
          {courses.map((course, index) => (
            <CourseCard 
              key={course.id || index} 
              course={course}
              practicalInfo={practicalInfo}
            />
          ))}
        </div>
        {showInterestSection && <InterestSignupSection />}
      </div>
    );
  }

  // For odd number of courses with interest section, create adaptive layout
  const lastRegularCourse = regularCourses[regularCourses.length - 1];
  const regularCoursesExceptLast = regularCourses.slice(0, -1);

  return (
    <div className="mb-6 mx-[12px] md:mx-0 md:max-w-5xl md:mx-auto">
      {/* Regular courses in pairs (except the last one if odd) */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {regularCoursesExceptLast.map((course, index) => (
          <CourseCard 
            key={course.id || index} 
            course={course}
            practicalInfo={practicalInfo}
          />
        ))}
      </div>
      
      {/* Last row with adaptive layout for desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Last regular course */}
        <CourseCard 
          key={lastRegularCourse.id || 'last-regular'} 
          course={lastRegularCourse}
          practicalInfo={practicalInfo}
        />
        
        {/* Right column for fixed info courses and/or interest section */}
        <div className="flex flex-col gap-6">
          {/* Fixed info courses stacked vertically */}
          {fixedInfoCourses.map((course, index) => (
            <CourseCard 
              key={course.id || `fixed-${index}`} 
              course={course}
              practicalInfo={practicalInfo}
            />
          ))}
          
          {/* Interest section cards in vertical stack */}
          {showInterestSection && (
            <div className="space-y-6">
              <InterestSignupSection />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseGrid;
