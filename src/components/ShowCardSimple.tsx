
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import OptimizedImage from './OptimizedImage';
import SoldOut from './SoldOut';
import ShowTag from './ShowTag';
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
    <div className="bg-white rounded-[10px] overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 relative">
      <div className="flex flex-col md:flex-row">
        <div className="relative md:w-2/5 aspect-[16/9] md:aspect-[4/3]">
          <OptimizedImage
            src={show.image}
            alt={show.title}
            className="w-full h-full object-cover"
            onLoad={onImageLoad}
          />
          {isSoldOut && <SoldOut />}
        </div>
        
        <div className="p-6 md:w-3/5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-1 font-satoshi">{show.title}</h2>
                <h3 className="text-gray-600 font-satoshi">{formatDateTime(show.date, show.time)}</h3>
              </div>
              {show.tag && (
                <div className="ml-3 flex-shrink-0">
                  <ShowTag name={show.tag.name} color={show.tag.color} size="small" />
                </div>
              )}
            </div>
            
            <div className="border-t border-dashed border-gray-300 pt-3 mb-3">
              <div className="flex items-center text-gray-600 mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="font-satoshi">{show.location}</span>
              </div>
              {show.description && (
                <p className="text-gray-700 text-sm font-satoshi mb-3">{show.description}</p>
              )}
            </div>
          </div>
          
          <Link 
            to={`/forestallning/${show.slug}`}
            className="text-accent-color hover:text-accent-hover font-medium font-satoshi self-start"
          >
            Läs mer →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShowCardSimple;
