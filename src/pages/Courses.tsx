
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourseGrid from '@/components/CourseGrid';
import CourseInfoSection from '@/components/CourseInfoSection';
import CourseCardSkeleton from '@/components/CourseCardSkeleton';
import { useEffect, useMemo } from 'react';
import { useCourses, useCourseMainInfo } from '@/hooks/useStrapi';
import { formatStrapiCourse, formatCourseMainInfo, sortCourses } from '@/utils/strapiHelpers';

const Courses = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: coursesData, isLoading: coursesLoading, error: coursesError } = useCourses();
  const { data: mainInfoData, isLoading: mainInfoLoading, error: mainInfoError } = useCourseMainInfo();

  console.log('Courses page - Raw courses data:', coursesData);
  console.log('Courses page - Raw main info data:', mainInfoData);

  // Memoize formatted and sorted courses to avoid recalculating
  const { courses, mainInfo } = useMemo(() => {
    // Handle case where data might be undefined or have unexpected structure
    let formattedCourses = [];
    
    if (coursesData?.data && Array.isArray(coursesData.data)) {
      formattedCourses = coursesData.data
        .map(formatStrapiCourse)
        .filter(Boolean); // Remove any null/undefined results
    } else if (coursesData && Array.isArray(coursesData)) {
      // Fallback if data is directly an array
      formattedCourses = coursesData
        .map(formatStrapiCourse)
        .filter(Boolean);
    }
    
    const sortedCourses = sortCourses(formattedCourses);
    const formattedMainInfo = formatCourseMainInfo(mainInfoData);
    
    return {
      courses: sortedCourses,
      mainInfo: formattedMainInfo
    };
  }, [coursesData, mainInfoData]);

  console.log('Formatted courses:', courses);
  console.log('Formatted main info:', mainInfo);

  // Fallback practical info if course doesn't have its own
  const practicalInfo = [
    "Kommer inom kort."
  ];

  // Show loading state with skeletons - only show if actually loading
  if (coursesLoading || mainInfoLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi">
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
        <Header />

        <section className="py-8 px-0.5 md:px-4 pb-8 mt-20 animate-fade-in">
          <div className="grid md:grid-cols-2 gap-6 mb-6 mx-[12px] md:mx-0 md:max-w-5xl md:mx-auto">
            {[...Array(4)].map((_, index) => (
              <CourseCardSkeleton key={index} />
            ))}
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  // Don't show error state immediately - give a chance for data to load
  if (coursesError && mainInfoError && !coursesLoading && !mainInfoLoading) {
    console.error('Error loading data:', { coursesError, mainInfoError });
    return (
      <div className="min-h-screen bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi flex items-center justify-center">
        <div className="text-white text-xl">Ett fel uppstod vid laddning av kurser. Testa igen!</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi">
      <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
      <Header />

      <section className="py-8 px-0.5 md:px-4 pb-8 mt-20 animate-fade-in">
        <CourseGrid courses={courses} practicalInfo={practicalInfo} />
        <CourseInfoSection mainInfo={mainInfo} />
      </section>

      <Footer />
    </div>
  );
};

export default Courses;
