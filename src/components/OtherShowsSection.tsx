
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import OptimizedImage from './OptimizedImage';

interface Show {
  id: number;
  title: string;
  date: string;
  location: string;
  slug: string;
  image: string;
}

interface OtherShowsSectionProps {
  shows: Show[];
}

const OtherShowsSection = ({ shows }: OtherShowsSectionProps) => {
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

  if (shows.length === 0) return null;

  return (
    <div className="mt-8">
      <p className="text-base text-theatre-light mb-6">Fler föreställningar</p>
      <div className="grid gap-6 md:grid-cols-2 auto-rows-fr">
        {shows.map((show) => (
          <Link key={show.id} to={`/shows/${show.slug}`} className="block">
            <div className="border-4 border-white bg-white rounded-none p-0 hover:shadow-lg transition-all duration-300 group flex flex-col h-full">
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
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default OtherShowsSection;
