import { Skeleton } from '@/components/ui/skeleton'

export default function IndexSkeleton() {
  return (
    <div className="relative min-h-screen">
      {/* Hero section skeleton */}
      <div className="relative w-full h-[50vh] overflow-hidden">
        <Skeleton className="w-full h-full" />
        
        {/* Text overlay skeleton */}
        <div className="absolute bottom-[5%] left-1/2 transform -translate-x-1/2 px-4 w-full max-w-[90vw] sm:max-w-[500px]">
          <div className="space-y-4 mb-6">
            <Skeleton className="h-4 w-full mx-auto" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
          </div>
          
          {/* Arrow skeleton */}
          <div className="flex justify-center">
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
        </div>
      </div>

      {/* Service boxes skeleton */}
      <div className="bg-white py-16 md:py-20 rounded-t-lg md:rounded-t-none">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 min-[690px]:grid-cols-3 gap-[15px] justify-items-center max-w-[930px] mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col bg-[#E7E7E7] overflow-hidden w-full animate-pulse">
                {/* Image skeleton */}
                <div className="relative h-[200px] lg:h-[250px] overflow-hidden aspect-[4/3]">
                  <Skeleton className="w-full h-full" />
                </div>

                {/* Content skeleton */}
                <div className="flex-1 px-4 py-6 flex flex-col justify-between text-center bg-[#E7E7E7] space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6 mx-auto" />
                  </div>
                  <div className="mt-4 mx-[10px]">
                    <Skeleton className="h-12 w-full rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}