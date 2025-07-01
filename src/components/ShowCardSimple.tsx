
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import OptimizedImage from './OptimizedImage';
import SoldOut from './SoldOut';
import { useAvailableTickets } from '@/hooks/useTicketSync';

interface SimpleShow {
  id: number;
  title: string;
  date: string;
  time?: any;
  location: string;
  slug: string;
  image?: string | null;
  availableTickets?: number;
}

interface ShowCardSimpleProps {
  show: SimpleShow;
  onImageLoad?: (src: string) => void;
}

const ShowCardSimple = ({
  show,
  onImageLoad
}: ShowCardSimpleProps) => {
  const { data: availableTickets = show.availableTickets || 100 } = useAvailableTickets(show.slug, show.availableTickets || 100);

  const formatDateTime = (dateString: string) => {
    try {
      const dateObj = new Date(dateString);
      const day = dateObj.getDate();
      const month = dateObj.toLocaleDateString('sv-SE', {
        month: 'long'
      });
      const hours = dateObj.getHours();
      const minutes = dateObj.getMinutes();
      const timeStr = `${hours.toString().padStart(2, '0')}.${minutes.toString().padStart(2, '0')}`;
      return `${day} ${month} ${timeStr}`;
    } catch {
      return dateString;
    }
  };

  const isSoldOut = availableTickets <= 0;

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-4 border-white shadow-lg bg-white rounded-none overflow-hidden relative">
      <CardContent className="p-0">
        {/* Optimized Show Image */}
        {show.image && (
          <OptimizedImage 
            src={show.image} 
            alt={show.title} 
            className="w-full h-48 md:h-56 object-cover" 
            preferredSize="medium"
            onLoad={onImageLoad}
          />
        )}

        <div className="p-4">
          <h2 className="show-card my-0 py-0">
            {show.title}
          </h2>
          
          <div className="space-y-1 my-4">
            <p className="show-card date-time">
              {formatDateTime(show.date)}
            </p>
            <p className="text-sm flex items-center">
              <MapPin size={16} className="mr-1 text-red-700" />
              {show.location}
            </p>
          </div>

          <Link 
            to={`/shows/${show.slug}`} 
            className="inline-flex items-center text-accent-color-text hover:text-accent-color-hover font-medium transition-colors text-sm"
          >
            Läs mer →
          </Link>
        </div>

        {/* SoldOut positioned in bottom-right corner */}
        {isSoldOut && (
          <div className="absolute bottom-3 right-3">
            <SoldOut />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShowCardSimple;
