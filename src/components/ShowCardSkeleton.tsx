
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const ShowCardSkeleton = () => {
  return (
    <Card className="border-4 border-white shadow-lg bg-white rounded-none overflow-hidden">
      <CardContent className="p-0">
        {/* Image skeleton */}
        <Skeleton className="w-full h-48 md:h-56" />
        
        <div className="p-4">
          {/* Title skeleton */}
          <Skeleton className="h-6 w-3/4 mb-2" />
          
          {/* Date skeleton */}
          <Skeleton className="h-4 w-1/2 mb-1" />
          
          {/* Location skeleton */}
          <Skeleton className="h-4 w-2/3 mb-4" />
          
          {/* Link skeleton */}
          <Skeleton className="h-4 w-20" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ShowCardSkeleton;
