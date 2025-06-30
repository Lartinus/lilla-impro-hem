
import Header from '@/components/Header';
import CourseGrid from '@/components/CourseGrid';
import CourseCardSkeleton from '@/components/CourseCardSkeleton';
import CourseInfoSection from '@/components/CourseInfoSection';
import { useEffect, useMemo, useState } from 'react';
import { useCourses } from '@/hooks/useStrapi';
import { useCourseSync } from '@/hooks/useCourseSync';
import { formatStrapiCourse, sortCourses } from '@/utils/strapiHelpers';
import SimpleParallaxHero from "@/components/SimpleParallaxHero";
import { useToast } from '@/hooks/use-toast';

const Courses = () => {
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();
  const { syncCourses } = useCourseSync();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data, isLoading, error, refetch } = useCourses();

  // Automatically sync courses when data loads successfully
  useEffect(() => {
    if (data && data.data && data.data.length > 0) {
      console.log('Courses loaded, triggering automatic sync...');
      // Trigger sync in background without blocking UI
      syncCourses().catch(error => {
        console.error('Background course sync failed:', error);
        // Don't show error toast for background sync failures
      });
    }
  }, [data, syncCourses]);

  // Handle retry logic
  const handleRetry = async () => {
    console.log('Retrying course fetch...');
    setRetryCount(prev => prev + 1);
    try {
      await refetch();
      toast({
        title: "Uppdaterat",
        description: "Kurserna har laddats om.",
      });
    } catch (err) {
      console.error('Retry failed:', err);
      toast({
        title: "Fel",
        description: "Kunde fortfarande inte ladda kurserna. Försök igen senare.",
        variant: "destructive",
      });
    }
  };

  console.log('Courses page - Data:', data);
  console.log('Courses page - Error:', error);
  console.log('Courses page - Loading:', isLoading);

  const courses = useMemo(() => {
    if (!data) return [];
    
    try {
      const formattedCourses = data?.data ? data.data.map(formatStrapiCourse).filter(Boolean) : [];
      const sortedCourses = sortCourses(formattedCourses);
      return sortedCourses;
    } catch (err) {
      console.error('Error formatting courses:', err);
      return [];
    }
  }, [data]);

  console.log('Formatted courses:', courses);

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

  // Enhanced error handling with retry option
  if (error) {
    console.error('Error loading courses:', error);
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary">
        <Header />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center text-white max-w-md">
            <h2 className="text-2xl font-bold mb-4">Kurser kunde inte laddas</h2>
            <p className="text-lg mb-6">Det verkar som att det är problem med att ladda kurserna just nu. Detta kan bero på tillfälliga serverfel.</p>
            <div className="space-y-4">
              <button
                onClick={handleRetry}
                className="bg-accent-color-primary hover:bg-accent-color-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Försök igen {retryCount > 0 && `(${retryCount + 1})`}
              </button>
              <p className="text-sm opacity-75">
                Om problemet kvarstår, kontakta oss via info@improteatern.se
              </p>
            </div>
          </div>
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
        <CourseInfoSection />
      </section>
    </div>
  );
};

export default Courses;
