import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ShowsSkeleton = () => {
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
              
              {/* Page title and description */}
              <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>

              {/* Show cards grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-[#F3F3F3] p-4 space-y-4">
                    <Skeleton className="w-full h-32" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-4/5" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ShowsSkeleton;