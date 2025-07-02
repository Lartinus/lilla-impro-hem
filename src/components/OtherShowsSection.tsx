import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import OptimizedImage from './OptimizedImage';
import SoldOut from './SoldOut';
import { useAvailableTickets } from '@/hooks/useTicketSync';

interface Show {
  id: number;
  title: string;
  date: string;
  location: string;
  slug: string;
  image: string;
  totalTickets?: number; // Add totalTickets to get proper ticket counts
}

interface OtherShowsSectionProps {
  shows: Show[];
}

const OtherShowCard = ({ show }: { show: Show }) => {
  // Only use useAvailableTickets if we have a valid totalTickets value from Strapi
  const { data: availableTickets } = useAvailableTickets(
    show.slug, 
    show.totalTickets || 0 // Use 0 as fallback to ensure sold out shows are handled correctly
  );

  console.log(`🎫 OtherShowCard for ${show.slug}:`);
  console.log(`  - totalTickets from Strapi: ${show.totalTickets}`);
  console.log(`  - availableTickets calculated: ${availableTickets}`);
  
  const formatDateTime = (dateString: string) => {
    try {
      const dateObj = new Date(dateString);
      const day = dateObj.getDate();
      const month = dateObj.toLocaleDateString('sv-SE', { month: 'long' });
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
    <Link key={show.id} to={`/shows/${show.slug}`} className="block">
      <div className="border-4 border-white bg-white rounded-none p-0 hover:shadow-lg transition-all duration-300 group flex flex-col h-full relative">
        <div className="w-full h-48 flex-shrink-0">
          <OptimizedImage
            src={show.image}
            alt={show.title}
            className="w-full h-full object-cover"
            preferredSize="medium"
          />
        </div>
        <div className="flex-1 p-6 flex flex-col">
          <h4>
            {show.title} {formatDateTime(show.date)}
          </h4>
          <div className="flex items-center my-3">
            <MapPin size={16} className="text-red-800 mr-2" />
            <p>{show.location}</p>
          </div>
          <div className="text-blue-500 group-hover:text-blue-700 transition-colors mt-auto">
            <span className="text-sm">Läs mer →</span>
          </div>
        </div>

        {/* SoldOut positioned in bottom-right corner */}
        {isSoldOut && (
          <div className="absolute bottom-3 right-3">
            <SoldOut />
          </div>
        )}
      </div>
    </Link>
  );
};

const OtherShowsSection = ({ shows }: OtherShowsSectionProps) => {
  if (shows.length === 0) return null;

  return (
    <div className="mt-8">
      <p className="text-base text-theatre-light mb-6">Fler föreställningar</p>
      <div className="grid gap-6 md:grid-cols-2 auto-rows-fr">
        {shows.map((show) => (
          <OtherShowCard key={show.id} show={show} />
        ))}
      </div>
    </div>
  );
};

export default OtherShowsSection;
