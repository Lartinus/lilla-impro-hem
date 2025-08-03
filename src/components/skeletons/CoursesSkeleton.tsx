import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CourseCardSkeleton from '@/components/CourseCardSkeleton';

const CoursesSkeleton = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Image Skeleton */}
      <div className="relative w-full h-[360px] overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>
      
      <div className="bg-[#FAFAFA]">
        <div className="relative z-10 mx-0 md:mx-auto max-w-[1000px] -mt-16">
          <div className="bg-white rounded-t-lg">
            <div className="p-6 md:p-8 space-y-8">
              
              {/* Om våra kurser section */}
              <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>

              {/* Aktuella kurser section */}
              <div className="space-y-6">
                <Skeleton className="h-8 w-40" />
                
                {/* Course Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CourseCardSkeleton />
                  <CourseCardSkeleton />
                </div>
              </div>

              {/* Interest signup section */}
              <div className="space-y-4">
                <Skeleton className="h-6 w-64" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <Skeleton className="h-10 w-32" />
              </div>

              {/* Info box */}
              <div className="bg-[#F3F3F3] p-6 space-y-4">
                <Skeleton className="h-6 w-56" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CoursesSkeleton;