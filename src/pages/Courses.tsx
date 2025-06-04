
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourseHero from '@/components/CourseHero';
import CourseGrid from '@/components/CourseGrid';
import CourseInfoSection from '@/components/CourseInfoSection';
import { useEffect } from 'react';
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

  // Format and sort courses
  const formattedCourses = coursesData?.data ? coursesData.data.map(formatStrapiCourse).filter(Boolean) : [];
  const courses = sortCourses(formattedCourses);
  const mainInfo = formatCourseMainInfo(mainInfoData);

  console.log('Formatted courses:', formattedCourses);
  console.log('Sorted courses:', courses);
  console.log('Formatted main info:', mainInfo);

  if (coursesLoading || mainInfoLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi flex items-center justify-center">
        <div className="text-white text-xl">Laddar kurser...</div>
      </div>
    );
  }

  if (coursesError || mainInfoError) {
    console.error('Error loading data:', { coursesError, mainInfoError });
    return (
      <div className="min-h-screen bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi flex items-center justify-center">
        <div className="text-white text-xl">Ett fel uppstod vid laddning av kurser</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary text-theatre-light font-satoshi">
      <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />
      <Header />

      <section className="py-2 px-0.5 md:px-4 pb-8 mt-20 animate-fade-in">
        <CourseGrid courses={courses} practicalInfo={practicalInfo} />
        <CourseInfoSection mainInfo={mainInfo} />
      </section>

      <Footer />
    </div>
  );
};

export default Courses;
