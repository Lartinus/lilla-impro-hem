import { Button } from '@/components/ui/button';
import { Type, Heading1, Heading2 } from 'lucide-react';

interface FormattingButtonsProps {
  onInsertHeader: (level: number) => void;
}

export function FormattingButtons({ onInsertHeader }: FormattingButtonsProps) {
  return (
    <div className="flex gap-2 mb-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onInsertHeader(2)}
        className="h-8 px-3"
      >
        <Heading1 className="w-4 h-4 mr-1" />
        Stor rubrik
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onInsertHeader(3)}
        className="h-8 px-3"
      >
        <Heading2 className="w-4 h-4 mr-1" />
        Liten rubrik
      </Button>
    </div>
  );
}