
import { Alert, AlertDescription } from '@/components/ui/alert';

const SoldOut = () => {
  return (
    <Alert variant="destructive" className="border-red-600 bg-red-50">
      <AlertDescription className="text-red-800 font-semibold text-center">
        Slutsåld!
      </AlertDescription>
    </Alert>
  );
};

export default SoldOut;
