
import { Link } from 'react-router-dom';
import OptimizedImage from './OptimizedImage';
import SoldOut from './SoldOut';
import ShowTag from './ShowTag';
import { Button } from '@/components/ui/button';
import { useAvailableTickets } from '@/hooks/useTicketSync';

interface SimpleShow {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  slug: string;
  image: string | null;
  totalTickets: number;
  description?: string | null;
  tag?: {
    name: string;
    color: string;
  } | null;
}

interface ShowCardSimpleProps {
  show: SimpleShow;
  onImageLoad?: (src: string) => void;
}

const ShowCardSimple = ({
  show,
  onImageLoad
}: ShowCardSimpleProps) => {
  // Calculate ticket availability
  const { data: availableTickets, isLoading } = useAvailableTickets(
    show.slug, 
    show.totalTickets
  );

  console.log(`🎫 ShowCardSimple for ${show.slug}:`);
  console.log(`  - totalTickets: ${show.totalTickets}`);
  console.log(`  - availableTickets calculated: ${availableTickets}`);
  console.log(`  - isLoading: ${isLoading}`);

  const formatDateTime = (date: string, time: string) => {
    try {
      const dateObj = new Date(date);
      const day = dateObj.getDate();
      const month = dateObj.toLocaleDateString('sv-SE', {
        month: 'long'
      });
      const [hours, minutes] = time.split(':');
      const timeStr = `${hours.padStart(2, '0')}.${minutes.padStart(2, '0')}`;
      return `${day} ${month} ${timeStr}`;
    } catch {
      return `${date} ${time}`;
    }
  };

  // Only show as sold out if:
  // 1. totalTickets is explicitly set to 0 (immediate sold out)
  // 2. We have finished loading AND availableTickets is 0 or less
  // This prevents flickering while data is loading
  const isSoldOut = show.totalTickets === 0 || 
                    (!isLoading && availableTickets !== undefined && availableTickets <= 0);

  console.log(`  - isSoldOut: ${isSoldOut} (totalTickets: ${show.totalTickets}, available: ${availableTickets}, loading: ${isLoading})`);

  return (
    <div className="bg-[#E7E7E7] overflow-hidden relative">
      <div className="flex flex-col h-full">
        <div className="relative aspect-[16/8]">
          <OptimizedImage
            src={show.image}
            alt={show.title}
            className="w-full h-full object-cover"
            onLoad={onImageLoad}
          />
          {isSoldOut && <SoldOut />}
        </div>
        
        <div className="p-4 flex flex-col flex-1">
          <div className="flex-1">
            <div className="mb-3">
              <h2 className="mb-2">{show.title}</h2>
              <h3 className="mb-3">{formatDateTime(show.date, show.time)}</h3>
            </div>
            
            <div className="border-t border-dashed border-gray-300 pt-4 mb-4">
              {show.description && (
                <p className="text-gray-700 text-base font-satoshi leading-relaxed mb-4">{show.description}</p>
              )}
              
              {show.tag && (
                <div>
                  <ShowTag name={show.tag.name} color={show.tag.color} size="small" />
                </div>
              )}
            </div>
          </div>
          
          <Link to={`/forestallning/${show.slug}`}>
            <Button 
              variant="default"
              className="w-full"
            >
              Läs mer →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShowCardSimple;
