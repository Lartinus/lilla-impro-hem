
import CourseCard from '@/components/CourseCard';

interface CourseGridProps {
  courses: any[];
  practicalInfo: string[];
}

const CourseGrid = ({ courses, practicalInfo }: CourseGridProps) => {
  // Separate regular courses from fixed info courses
  const regularCourses = courses.filter(course => 
    !course.title.includes("House teams") && 
    !course.title.includes("fortsättning") &&
    !course.title.includes("Helgworkshop") && 
    !course.title.includes("specialkurs")
  );
  
  const fixedInfoCourses = courses.filter(course => 
    course.title.includes("House teams") || 
    course.title.includes("fortsättning") ||
    course.title.includes("Helgworkshop") || 
    course.title.includes("specialkurs")
  );

  const isOddNumber = regularCourses.length % 2 === 1;
  const shouldUseAdaptiveLayout = fixedInfoCourses.length > 0 && isOddNumber;

  if (courses.length === 0) {
    return (
      <div className="grid md:grid-cols-2 gap-6 mb-6 mx-[12px] md:mx-0 md:max-w-5xl md:mx-auto">
        <div className="col-span-2 text-center text-white text-xl">
          Vi har inga kurser planerade just nu! Kom gärna tillbaka senare eller följ oss i våra kanaler för info om framtida kurser.
        </div>
      </div>
    );
  }

  // For mobile or when we don't need adaptive layout, use simple grid
  if (!shouldUseAdaptiveLayout) {
    return (
      <div className="grid md:grid-cols-2 gap-6 mb-6 mx-[12px] md:mx-0 md:max-w-5xl md:mx-auto">
        {courses.map((course, index) => (
          <CourseCard 
            key={course.id || index} 
            course={course}
            practicalInfo={practicalInfo}
          />
        ))}
      </div>
    );
  }

  // Adaptive layout for odd number of regular courses with fixed info courses
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Last regular course */}
        <CourseCard 
          key={lastRegularCourse.id || 'last-regular'} 
          course={lastRegularCourse}
          practicalInfo={practicalInfo}
        />
        
        {/* Fixed info courses */}
        {fixedInfoCourses.map((course, index) => (
          <CourseCard 
            key={course.id || `fixed-${index}`} 
            course={course}
            practicalInfo={practicalInfo}
          />
        ))}
      </div>
    </div>
  );
};

export default CourseGrid;
