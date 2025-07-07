
import Header from '@/components/Header';
import CourseGrid from '@/components/CourseGrid';
import CourseCardSkeleton from '@/components/CourseCardSkeleton';
import CourseInfoSection from '@/components/CourseInfoSection';
import { InterestSignupSection } from '@/components/InterestSignupSection';
import { useEffect } from 'react';
import { useAdminCourses } from '@/hooks/useAdminCourses';
import SimpleParallaxHero from "@/components/SimpleParallaxHero";
import { useToast } from '@/hooks/use-toast';

const Courses = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: adminCourses, isLoading: adminLoading } = useAdminCourses();

  const courses = adminCourses || [];
  console.log('Admin courses:', courses);

  const practicalInfo = [
    "Kommer inom kort."
  ];

  // Show enhanced loading state with skeletons
  if (adminLoading) {
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


  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary relative overflow-x-hidden overflow-y-visible">
      <Header />
      <SimpleParallaxHero imageSrc="/uploads/images/kurser_LIT_2024.jpg" />
      <section className="py-8 px-0.5 md:px-4 pb-8 mt-0 flex-1 relative z-10" style={{ paddingTop: "220px" }}>
        <CourseGrid courses={courses} practicalInfo={practicalInfo} showInterestSection={true} />
        <CourseInfoSection />
      </section>
    </div>
  );
};

export default Courses;
