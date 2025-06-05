
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourseGrid from '@/components/CourseGrid';
import CourseInfoSection from '@/components/CourseInfoSection';
import CourseCardSkeleton from '@/components/CourseCardSkeleton';
import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatStrapiCourse, formatCourseMainInfo, sortCourses } from '@/utils/strapiHelpers';

const Courses = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Parallel data fetching using a single useQuery
  const { data, isLoading, error } = useQuery({
    queryKey: ['courses-parallel'],
    queryFn: async () => {
      // Execute both API calls in parallel
      const [coursesResponse, mainInfoResponse] = await Promise.all([
        supabase.functions.invoke('strapi-courses'),
        supabase.functions.invoke('strapi-site-content', {
          body: { type: 'course-main-info' }
        })
      ]);

      if (coursesResponse.error) throw coursesResponse.error;
      if (mainInfoResponse.error) throw mainInfoResponse.error;

      return {
        coursesData: coursesResponse.data,
        mainInfoData: mainInfoResponse.data
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });

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

        <Footer />
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
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi">
      <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
      <Header />

      <section className="py-8 px-0.5 md:px-4 pb-8 mt-20 flex-1">
        <CourseGrid courses={courses} practicalInfo={practicalInfo} />
        <CourseInfoSection mainInfo={mainInfo} />
      </section>

      <Footer />
    </div>
  );
};

export default Courses;
