
import React, { useEffect } from 'react';
import Header from '@/components/Header';
import CourseHero from '@/components/CourseHero';
import CourseGrid from '@/components/CourseGrid';
import CourseInfoSection from '@/components/CourseInfoSection';
import SimpleParallaxHero from '@/components/SimpleParallaxHero';
import { useBatchedPageContent } from '@/hooks/useBatchedQueries';
import { useCoursesParallel } from '@/hooks/useStrapi';

const Courses = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Använd paralleliserad courses-query som redan är optimerad
  const { data: coursesData, isLoading: coursesLoading, error: coursesError } = useCoursesParallel();
  
  // Alternativ batching för extra content om behövs
  const { data: batchedContent, isLoading: batchedLoading } = useBatchedPageContent(['course-main-info']);
  const mainInfoData = batchedContent?.['course-main-info'] || coursesData?.mainInfoData;

  const isLoading = coursesLoading || batchedLoading;

  if (coursesError) {
    console.error('Courses error:', coursesError);
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi">
        <Header />
        <section className="px-0.5 md:px-4 mt-16 py-6 flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <h2 className="text-xl font-bold mb-4 text-theatre-light">
              Något gick fel
            </h2>
            <p className="text-theatre-light/80 mb-4">
              Vi kunde inte ladda kurserna just nu. Försök igen om en stund.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-accent-color-primary hover:bg-accent-color-hover text-white px-4 py-2 rounded-none"
            >
              Försök igen
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi relative overflow-x-hidden overflow-y-visible">
      <Header />
      <CourseHero />
      <CourseGrid coursesData={coursesData?.coursesData} isLoading={isLoading} />
      <CourseInfoSection mainInfoData={mainInfoData} isLoading={isLoading} />
      <SimpleParallaxHero imageSrc="/uploads/images/kurser_LIT_2024.jpg" />
    </div>
  );
};

export default Courses;
