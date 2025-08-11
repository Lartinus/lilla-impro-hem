
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
  tagsDetailed?: { name: string; color: string }[];
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
        <div className="relative h-60">
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
            <div className="mb-1 flex flex-col justify-start">
              <h2 className="mb-2">{show.title}</h2>
              <h3>{formatDateTime(show.date, show.time)}</h3>
            </div>
            
            <div className="mt-4 mb-1 pt-1">
              <div className="flex items-center justify-center relative mb-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-dashed border-black"></div>
                </div>
                {(show.tagsDetailed && show.tagsDetailed.length > 0) ? (
                  <div className="relative bg-[#E7E7E7] px-2 inline-flex items-center justify-center gap-2 flex-nowrap">
                    {show.tagsDetailed.map((t, idx) => (
                      <ShowTag key={`${t.name}-${idx}`} name={t.name} color={t.color} size="small" />
                    ))}
                  </div>
                ) : show.tag ? (
                  <div className="relative bg-[#E7E7E7] px-2">
                    <ShowTag name={show.tag.name} color={show.tag.color} size="small" />
                  </div>
                ) : null}
              </div>
              
              <div className="min-h-[24px]">
                {show.description && (
                  <p className="mt-4">{show.description}</p>
                )}
              </div>
            </div>
          </div>
          
          <Link to={`/forestallningar/${show.slug}`}>
            <Button 
              variant="default"
              className="w-full"
            >
              <span>Läs mer</span>
              <span className="text-2xl font-bold">→</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShowCardSimple;
