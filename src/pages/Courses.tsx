
import Header from '@/components/Header';
import CourseGrid from '@/components/CourseGrid';
import CourseCardSkeleton from '@/components/CourseCardSkeleton';
import CourseInfoSection from '@/components/CourseInfoSection';
import { useEffect, useMemo, useState } from 'react';
import { useOptimizedCourses, getApiPerformanceMetrics } from '@/hooks/useOptimizedStrapi';
import { useSmartCourseSync } from '@/hooks/useSmartCourseSync';
import { formatStrapiCourse, sortCourses } from '@/utils/strapiHelpers';
import { useAdminCourses } from '@/hooks/useAdminCourses';
import SimpleParallaxHero from "@/components/SimpleParallaxHero";
import { useToast } from '@/hooks/use-toast';

const Courses = () => {
  const [retryCount, setRetryCount] = useState(0);
  const [loadingStartTime] = useState(Date.now());
  const { toast } = useToast();
  const { runSmartSync } = useSmartCourseSync();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data, isLoading, error, refetch } = useOptimizedCourses();
  const { data: adminCourses, isLoading: adminLoading } = useAdminCourses();

  // Performance monitoring
  useEffect(() => {
    if (data || error) {
      const loadingDuration = Date.now() - loadingStartTime;
      console.log(`📊 Courses page loaded in ${loadingDuration}ms`);
      
      // Log performance metrics for debugging
      const metrics = getApiPerformanceMetrics();
      if (Object.keys(metrics).length > 0) {
        console.log('📊 API Performance Metrics:', metrics);
      }
    }
  }, [data, error, loadingStartTime]);

  // Run smart background sync only when data loads successfully
  useEffect(() => {
    if (data && data.data && data.data.length > 0) {
      console.log('Courses loaded, triggering smart background sync...');
      // Run in background without blocking UI
      runSmartSync().catch(error => {
        console.error('Background smart sync failed (silent):', error);
      });
    }
  }, [data, runSmartSync]);

  // Handle retry logic with performance awareness
  const handleRetry = async () => {
    console.log('Retrying course fetch...');
    setRetryCount(prev => prev + 1);
    const retryStartTime = Date.now();
    
    try {
      await refetch();
      const retryDuration = Date.now() - retryStartTime;
      console.log(`✅ Retry successful in ${retryDuration}ms`);
      toast({
        title: "Uppdaterat",
        description: "Kurserna har laddats om.",
      });
    } catch (err) {
      const retryDuration = Date.now() - retryStartTime;
      console.error(`❌ Retry failed after ${retryDuration}ms:`, err);
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
    // Combine Strapi courses with admin courses
    const strapiCourses = data?.data ? data.data.map(formatStrapiCourse).filter(Boolean) : [];
    const adminCoursesFormatted = adminCourses || [];
    
    try {
      const allCourses = [...strapiCourses, ...adminCoursesFormatted];
      const sortedCourses = sortCourses(allCourses);
      return sortedCourses;
    } catch (err) {
      console.error('Error formatting courses:', err);
      return adminCoursesFormatted; // Fallback to admin courses if Strapi fails
    }
  }, [data, adminCourses]);

  console.log('Formatted courses:', courses);

  const practicalInfo = [
    "Kommer inom kort."
  ];

  // Show enhanced loading state with skeletons
  if (isLoading && adminLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary">
        <Header />
        <section className="py-8 px-0.5 md:px-4 pb-8 mt-20 flex-1">
          <div className="grid md:grid-cols-2 gap-6 mb-6 mx-[12px] md:mx-0 md:max-w-5xl md:mx-auto">
            {[...Array(4)].map((_, index) => (
              <CourseCardSkeleton key={index} />
            ))}
          </div>
          <div className="text-center text-white/70 text-sm mt-8">
            Laddar kurser...
          </div>
        </section>
      </div>
    );
  }

  // Enhanced error handling with retry option and performance info
  if (error) {
    console.error('Error loading courses:', error);
    const loadingDuration = Date.now() - loadingStartTime;
    
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
              <p className="text-xs opacity-50">
                Laddningstid: {Math.round(loadingDuration / 1000)}s
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
