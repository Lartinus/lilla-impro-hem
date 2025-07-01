
import { Alert, AlertDescription } from '@/components/ui/alert';

const SoldOut = () => {
  return (
    <Alert className="bg-red-700 border-red-700 rounded-none max-w-fit py-1">
      <AlertDescription className="text-white font-semibold text-center text-sm">
        Slutsåld!
      </AlertDescription>
    </Alert>
  );
};

export default SoldOut;
