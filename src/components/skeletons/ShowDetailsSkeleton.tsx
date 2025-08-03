import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ShowDetailsSkeleton = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Image Skeleton */}
      <div className="relative w-full h-[360px] overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>
      
      <div className="bg-[#FAFAFA]">
        <div className="relative z-10 mx-0 md:mx-auto max-w-[800px] -mt-16">
          <div className="bg-white rounded-t-lg">
            <div className="p-6 md:p-8 space-y-8">
              
              {/* Show title and basic info */}
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>

              {/* Show details */}
              <div className="space-y-6">
                <div className="bg-[#F3F3F3] p-4 space-y-3">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-36" />
                </div>

                {/* Performers section */}
                <div className="space-y-4">
                  <Skeleton className="h-6 w-24" />
                  <div className="flex flex-wrap gap-2">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-8 w-24" />
                    ))}
                  </div>
                </div>

                {/* Ticket purchase section */}
                <div className="bg-[#F3F3F3] p-6 space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-10 w-40" />
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

export default ShowDetailsSkeleton;