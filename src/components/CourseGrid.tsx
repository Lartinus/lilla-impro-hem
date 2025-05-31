
import CourseCard from '@/components/CourseCard';

interface CourseGridProps {
  courses: any[];
  practicalInfo: string[];
}

const CourseGrid = ({ courses, practicalInfo }: CourseGridProps) => {
  return (
    <div className="grid md:grid-cols-2 gap-6 mb-6 mx-[12px] md:mx-0 md:max-w-5xl md:mx-auto">
      {courses.length > 0 ? (
        courses.map((course, index) => (
          <CourseCard 
            key={course.id || index} 
            course={course}
            practicalInfo={practicalInfo}
          />
        ))
      ) : (
        <div className="col-span-2 text-center text-white text-xl">
          Inga kurser hittades
        </div>
      )}
    </div>
  );
};

export default CourseGrid;
