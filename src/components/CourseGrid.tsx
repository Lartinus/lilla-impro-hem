import CourseCard from '@/components/CourseCard';

interface CourseGridProps {
  courses: any[];
  practicalInfo: string[];
}

const CourseGrid = ({ courses, practicalInfo }: CourseGridProps) => {
  return (
    <div>
      {/* Kurskort */}
      {courses.length === 0 ? (
        <div className="course-cards-gray p-6 md:p-8 mb-6">
          <p>
            Vi har inga kurser planerade just nu! Kom gärna tillbaka senare eller följ oss i våra kanaler för info om framtida kurser.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {courses.map((course, index) => (
            <CourseCard 
              key={course.id || index} 
              course={course}
              practicalInfo={practicalInfo}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseGrid;
