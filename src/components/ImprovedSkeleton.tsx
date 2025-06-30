
import { Skeleton } from '@/components/ui/skeleton';

interface ImprovedSkeletonProps {
  className?: string;
  variant?: 'card' | 'text' | 'image' | 'button';
  lines?: number;
}

const ImprovedSkeleton = ({ 
  className = '', 
  variant = 'card',
  lines = 3 
}: ImprovedSkeletonProps) => {
  switch (variant) {
    case 'card':
      return (
        <div className={`space-y-4 p-6 border-4 border-white bg-white rounded-none ${className}`}>
          <Skeleton className="h-48 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      );
    
    case 'text':
      return (
        <div className={`space-y-2 ${className}`}>
          {[...Array(lines)].map((_, i) => (
            <Skeleton 
              key={i} 
              className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} 
            />
          ))}
        </div>
      );
    
    case 'image':
      return <Skeleton className={`aspect-video w-full ${className}`} />;
    
    case 'button':
      return <Skeleton className={`h-10 w-24 ${className}`} />;
    
    default:
      return <Skeleton className={className} />;
  }
};

export default ImprovedSkeleton;
