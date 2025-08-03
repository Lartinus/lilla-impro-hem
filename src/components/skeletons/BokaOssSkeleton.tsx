import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const BokaOssSkeleton = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
            <div className="p-6 md:p-8">
              
              {/* Title */}
              <div className="mb-8">
                <Skeleton className="h-8 w-64" />
              </div>

              {/* Two column layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                
                {/* Corporate section */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-40" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-4/5" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Skeleton className="h-5 w-32" />
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-4 w-3/4" />
                    ))}
                  </div>

                  {/* Form skeleton */}
                  <div className="bg-[#F3F3F3] p-4 space-y-4">
                    <Skeleton className="h-5 w-48" />
                    <div className="space-y-3">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-10 w-32" />
                    </div>
                  </div>
                </div>

                {/* Private section */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Skeleton className="h-6 w-36" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <Skeleton className="h-4 w-4/5" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Skeleton className="h-5 w-28" />
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-4 w-3/4" />
                    ))}
                  </div>

                  {/* Form skeleton */}
                  <div className="bg-[#F3F3F3] p-4 space-y-4">
                    <Skeleton className="h-5 w-48" />
                    <div className="space-y-3">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-10 w-32" />
                    </div>
                  </div>
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

export default BokaOssSkeleton;