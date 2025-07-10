import CourseCard from '@/components/CourseCard';

interface CourseGridProps {
  courses: any[];
  practicalInfo: string[];
}

const CourseGrid = ({ courses, practicalInfo }: CourseGridProps) => {
  return (
    <div className="mx-[12px] md:mx-0 md:max-w-5xl md:mx-auto">
      {/* Inledande kort */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 mb-6 md:col-span-2">
        <h2 className="text-2xl font-bold text-white mb-4">
          Improv Comedy för dig som vill utvecklas på scen
        </h2>
        <div className="text-white/90 space-y-4">
          <p>
            Lilla Improteatern är platsen för dig som vill utvecklas som improvisatör och bli skickligare på att spela roliga scener tillsammans med andra.
          </p>
          <p>
            Improv Comedy är ett hantverk. Med flera års erfarenhet som improvisatörer och pedagoger har vi skapat ett kurssystem som tar dig från grundläggande scenarbete till långform och ensemblearbete. Våra kurser bygger på Game of the scene och ger dig konkreta verktyg, massor av träning, scentid och återkoppling.
          </p>
        </div>
      </div>

      {/* Kurskort */}
      {courses.length === 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="col-span-2 text-center text-white text-xl">
            Vi har inga kurser planerade just nu! Kom gärna tillbaka senare eller följ oss i våra kanaler för info om framtida kurser.
          </div>
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
