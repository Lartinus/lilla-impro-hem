
import { Progress } from '@/components/ui/progress';

interface SubtleLoadingOverlayProps {
  isVisible: boolean;
  progress?: number;
  message?: string;
}

const SubtleLoadingOverlay = ({ isVisible, progress = 0, message = "Laddar..." }: SubtleLoadingOverlayProps) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-0 top-[85px] bottom-0 bg-gradient-to-br from-theatre-primary via-theatre-secondary to-theatre-tertiary z-50 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="mb-4">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
        <p className="text-sm text-white opacity-90 mb-4">{message}</p>
        {progress > 0 && (
          <Progress 
            value={progress} 
            className="w-48 mx-auto h-1"
          />
        )}
      </div>
    </div>
  );
};

export default SubtleLoadingOverlay;
