import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MainCard from '@/components/MainCard';

export default function ShowDetailsSkeleton() {
  return (
    <>
      <Header />
      <div className="bg-[#FAFAFA]">
        {/* Image with overlapping card skeleton */}
        <div className="relative mt-20">
          {/* Large full-width image skeleton */}
          <div className="w-full h-[280px] relative">
            <Skeleton className="w-full h-full" />
          </div>

          {/* Overlapping card skeleton */}
          <div className="relative z-10 mx-0 md:mx-auto max-w-[800px] -mt-16">
            <MainCard className="relative">            
              {/* Back link skeleton */}
              <div className="absolute -top-8 left-6 md:left-8 z-20">
                <Skeleton className="h-6 w-48" />
              </div>
              
              {/* Title and date skeleton */}
              <div className="mb-6">
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-6 w-1/2" />
              </div>

              {/* Location skeleton */}
              <div className="mb-4">
                <Skeleton className="h-6 w-2/3" />
              </div>

              {/* Ticket prices skeleton */}
              <div className="mb-6">
                <Skeleton className="h-6 w-1/3" />
              </div>

              {/* Dashed line with tag skeleton */}
              <div className="mb-6 relative flex items-center">
                <div className="border-t-2 border-dashed border-gray-300 flex-1"></div>
                <div className="absolute left-1/2 transform -translate-x-1/2 bg-gray-100 px-2">
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>

              {/* Description skeleton */}
              <div className="mb-8 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
              </div>

              {/* Ticket purchase section skeleton */}
              <div className="mb-12 space-y-4">
                <Skeleton className="h-8 w-1/2" />
                <div className="p-6 border border-gray-200 rounded-lg space-y-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-10 w-32" />
                  </div>
                </div>
              </div>

              {/* Performers section skeleton */}
              <div className="mb-8">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-6">
                  {[1, 2, 3].map((index) => (
                    <div key={index} className="flex flex-col lg:flex-row items-start space-y-4 lg:space-y-0 lg:space-x-4">
                      <Skeleton className="w-32 h-32 flex-shrink-0" />
                      <div className="flex-1 min-w-0 space-y-2">
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Back link skeleton */}
              <div className="mb-8">
                <Skeleton className="h-6 w-48" />
              </div>

              {/* Newsletter signup skeleton */}
              <div className="bg-[#D9D9D9] rounded p-6 space-y-4">
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-10 w-32" />
              </div>

            </MainCard>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
}