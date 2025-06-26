
import Header from '@/components/Header';
import CourseGrid from '@/components/CourseGrid';
import CourseInfoSection from '@/components/CourseInfoSection';
import CourseCardSkeleton from '@/components/CourseCardSkeleton';
import { useEffect, useMemo } from 'react';
import { useCoursesParallel } from '@/hooks/useStrapi';
import { formatStrapiCourse, formatCourseMainInfo, sortCourses } from '@/utils/strapiHelpers';
import SimpleParallaxHero from "@/components/SimpleParallaxHero";

const Courses = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Use the optimized parallel query
  const { data, isLoading, error } = useCoursesParallel();

  console.log('Courses page - Parallel data:', data);

  // Memoize formatted and sorted courses to avoid recalculating
  const { courses, mainInfo } = useMemo(() => {
    if (!data) return { courses: [], mainInfo: null };
    
    const formattedCourses = data.coursesData?.data ? data.coursesData.data.map(formatStrapiCourse).filter(Boolean) : [];
    const sortedCourses = sortCourses(formattedCourses);
    const formattedMainInfo = formatCourseMainInfo(data.mainInfoData);
    
    return {
      courses: sortedCourses,
      mainInfo: formattedMainInfo
    };
  }, [data]);

  console.log('Formatted courses:', courses);
  console.log('Formatted main info:', mainInfo);

  // Fallback practical info if course doesn't have its own
  const practicalInfo = [
    "Kommer inom kort."
  ];

  // Show loading state with skeletons
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi">
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
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
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white text-xl">Ett fel uppstod vid laddning av kurser. Testa igen!</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi relative overflow-x-hidden overflow-y-visible">
      <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
      <Header />
      <SimpleParallaxHero imageSrc="/lovable-uploads/e56190aa-46b0-4661-820d-915c2b5a4009.png" />
      <section className="py-8 px-0.5 md:px-4 pb-8 mt-0 flex-1 relative z-10" style={{ paddingTop: "220px" }}>
        <CourseGrid courses={courses} practicalInfo={practicalInfo} />
        <CourseInfoSection mainInfo={mainInfo} />
      </section>
    </div>
  );
};

export default Courses;
