
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
  totalTickets?: number; // Make this required to get proper ticket counts
}

interface ShowCardSimpleProps {
  show: SimpleShow;
  onImageLoad?: (src: string) => void;
}

const ShowCardSimple = ({
  show,
  onImageLoad
}: ShowCardSimpleProps) => {
  // Only use useAvailableTickets if we have a valid totalTickets value from Strapi
  const { data: availableTickets } = useAvailableTickets(
    show.slug, 
    show.totalTickets || 0 // Use 0 as fallback to ensure sold out shows are handled correctly
  );

  console.log(`🎫 ShowCardSimple for ${show.slug}:`);
  console.log(`  - totalTickets from Strapi: ${show.totalTickets}`);
  console.log(`  - availableTickets calculated: ${availableTickets}`);

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

  // Show as sold out if:
  // 1. totalTickets is undefined/null (not configured in Strapi)
  // 2. totalTickets is 0 (explicitly set to 0 in Strapi)
  // 3. availableTickets is 0 or less (calculated as sold out)
  const isSoldOut = show.totalTickets === undefined || 
                    show.totalTickets === null || 
                    show.totalTickets === 0 || 
                    availableTickets === undefined || 
                    availableTickets <= 0;

  console.log(`  - isSoldOut: ${isSoldOut} (totalTickets: ${show.totalTickets}, available: ${availableTickets})`);

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
