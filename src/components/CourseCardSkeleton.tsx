
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const CourseCardSkeleton = () => {
  return (
    <Card className="course-cards-gray transition-all duration-300 border-none shadow-none">
      <CardContent className="p-6 md:p-6 lg:p-8">
        {/* Title skeleton */}
        <Skeleton className="h-6 w-4/5 mb-1" />
        
        {/* Subtitle skeleton */}
        <Skeleton className="h-4 w-3/4 mb-4" />
        
        {/* Description skeleton */}
        <div className="space-y-2 mb-6">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        
        {/* Teacher section skeleton */}
        <div className="mb-6">
          <Skeleton className="h-5 w-24 mb-3" />
          <div className="course-outline-red rounded-none p-4">
            <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-4">
              <Skeleton className="w-32 h-32 rounded-none flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <Skeleton className="h-5 w-32 mb-2" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                  <Skeleton className="h-3 w-5/6" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Button skeleton */}
        <Skeleton className="h-10 w-32" />
      </CardContent>
    </Card>
  );
};

export default CourseCardSkeleton;
