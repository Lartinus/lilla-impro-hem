
import Header from '@/components/Header';
import CourseGrid from '@/components/CourseGrid';
import CourseCardSkeleton from '@/components/CourseCardSkeleton';
import CourseInfoSection from '@/components/CourseInfoSection';
import { useEffect, useMemo } from 'react';
import { useCourses } from '@/hooks/useStrapi';
import { formatStrapiCourse, sortCourses } from '@/utils/strapiHelpers';
import SimpleParallaxHero from "@/components/SimpleParallaxHero";

const Courses = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Use only the courses query, not the parallel one
  const { data, isLoading, error } = useCourses();

  console.log('Courses page - Data:', data);

  // Memoize formatted and sorted courses to avoid recalculating
  const courses = useMemo(() => {
    if (!data) return [];
    
    const formattedCourses = data?.data ? data.data.map(formatStrapiCourse).filter(Boolean) : [];
    const sortedCourses = sortCourses(formattedCourses);
    
    return sortedCourses;
  }, [data]);

  console.log('Formatted courses:', courses);

  // Fallback practical info if course doesn't have its own
  const practicalInfo = [
    "Kommer inom kort."
  ];

  // Show loading state with skeletons
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary">
        <Header />
        <section className="py-8 px-0.5 md:px-4 pb-8 mt-20 flex-1">
          <div className="grid md:grid-cols-2 gap-6 mb-6 mx-[12px] md:mx-0 md:max-w-5xl md:mx-auto">
            {[...Array(4)].map((_, index) => (
              <CourseCardSkeleton key={index} />
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    console.error('Error loading data:', error);
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white text-xl">Ett fel uppstod vid laddning av kurser. Testa igen!</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary relative overflow-x-hidden overflow-y-visible">
      <Header />
      <SimpleParallaxHero imageSrc="/uploads/images/kurser_LIT_2024.jpg" />
      <section className="py-8 px-0.5 md:px-4 pb-8 mt-0 flex-1 relative z-10" style={{ paddingTop: "220px" }}>
        <CourseGrid courses={courses} practicalInfo={practicalInfo} />
        
        {/* Använd CourseInfoSection komponenten */}
        <CourseInfoSection />
      </section>
    </div>
  );
};

export default Courses;
