// src/components/ShowCardSimple.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import OptimizedImage from './OptimizedImage';

interface SimpleShow {
  id: number;
  title: string;
  date: string;
  time?: any;
  location: string;
  slug: string;
  image?: string | null;
}

interface ShowCardSimpleProps {
  show: SimpleShow;
}

const ShowCardSimple: React.FC<ShowCardSimpleProps> = ({ show }) => {
  const formatDateTime = (dateString: string) => {
    try {
      const dateObj = new Date(dateString);
      const day = dateObj.getDate();
      const month = dateObj.toLocaleDateString('sv-SE', { month: 'long' });
      const hours = dateObj.getHours().toString().padStart(2, '0');
      const minutes = dateObj.getMinutes().toString().padStart(2, '0');
      return `${day} ${month} ${hours}.${minutes}`;
    } catch {
      return dateString;
    }
  };

  return (
    <Card
      className="
        group 
        hover:shadow-xl 
        transition-all duration-300 
        border-4 border-white 
        shadow-lg 
        bg-white            /* HELT VIT box */
        rounded-none 
        overflow-hidden
      "
      style={{ backgroundColor: '#ffffff' }} /* säkerställ vitt om du vill */
    >
      <CardContent className="p-0">
        {show.image && (
          <OptimizedImage
            src={show.image}
            alt={show.title}
            className="w-full h-48 md:h-56 object-cover"
            preferredSize="medium"
          />
        )}

        <div className="p-4">
          {/* Rubrik – använder global CSS för h2 */}
          <h2 className="mb-2 my-0 py-0">
            {show.title}
          </h2>
          
          <div className="space-y-1 mb-4">
            {/* Datum – visar direkt en egen hex-kod */}
            <p
              className="font-medium text-sm"
              style={{ color: '#772424' }}  /* direkt hex-kod */
            >
              {formatDateTime(show.date)}
            </p>

            {/* Plats – använder befintlig tailwind-klass */}
            <p className="text-red-600 text-sm flex items-center">
              <MapPin size={16} className="mr-1" />
              {show.location}
            </p>
          </div>
          
          {/* Läs mer-länk – inline färgkod */}
          <Link
            to={`/shows/${show.slug}`}
            className="
              inline-flex items-center 
              font-medium 
              text-[##3B82F6] /* du kan sätta vilken hex-kod du vill */
              hover:text-[##60A5FA] 
              transition-colors 
              text-sm
            "
          >
            Läs mer →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShowCardSimple;
