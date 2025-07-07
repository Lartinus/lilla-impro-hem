import CourseCard from '@/components/CourseCard';

interface CourseGridProps {
  courses: any[];
  practicalInfo: string[];
}

const CourseGrid = ({ courses, practicalInfo }: CourseGridProps) => {
  if (courses.length === 0) {
    return (
      <div className="grid md:grid-cols-2 gap-6 mb-6 mx-[12px] md:mx-0 md:max-w-5xl md:mx-auto">
        <div className="col-span-2 text-center text-white text-xl">
          Vi har inga kurser planerade just nu! Kom gärna tillbaka senare eller följ oss i våra kanaler för info om framtida kurser.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-6 mb-6 mx-[12px] md:mx-0 md:max-w-5xl md:mx-auto">
      {courses.map((course, index) => (
        <CourseCard 
          key={course.id || index} 
          course={course}
          practicalInfo={practicalInfo}
        />
      ))}
    </div>
  );
};

export default CourseGrid;
