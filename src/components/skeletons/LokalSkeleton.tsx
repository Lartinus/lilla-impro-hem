import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const LokalSkeleton = () => {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Image Skeleton */}
      <div className="relative w-full h-[360px] overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>
      
      <div className="bg-[#FAFAFA]">
        <div className="relative z-10 mx-0 md:mx-auto max-w-[800px] -mt-16">
          <div className="bg-[#F3F3F3] rounded-t-lg">
            <div className="p-6 md:p-8 space-y-8">
              
              {/* Lokal-info section */}
              <div className="space-y-4">
                <Skeleton className="h-8 w-64" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
                <Skeleton className="h-4 w-3/4" />
              </div>

              {/* Kontakt för lokal section */}
              <div className="space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-80" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default LokalSkeleton;