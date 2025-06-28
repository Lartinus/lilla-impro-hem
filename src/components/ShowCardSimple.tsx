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
const ShowCardSimple = ({
  show
}: ShowCardSimpleProps) => {
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
  return <Card className="group hover:shadow-xl transition-all duration-300 border-4 border-white shadow-lg bg-white rounded-none overflow-hidden">
      <CardContent className="p-0">
        {/* Optimized Show Image */}
        {show.image && <OptimizedImage src={show.image} alt={show.title} className="w-full h-48 md:h-56 object-cover" preferredSize="medium" />}

        <div className="p-4">
          <h2 className="mb-2 show-card my-0 py-0">
            {show.title}
          </h2>
          
          <div className="space-y-1 mb-4">
            <p className="text-blue-500 font-medium show-card date-time">
              {formatDateTime(show.date)}
            </p>
            <p className="text-red-600 text-sm flex items-center">
              <MapPin size={16} className="mr-1" />
              {show.location}
            </p>
          </div>
          
          <Link to={`/shows/${show.slug}`} className="inline-flex items-center text-blue-500 hover:text-blue-700 font-medium transition-colors text-sm">
            Läs mer →
          </Link>
        </div>
      </CardContent>
    </Card>;
};
export default ShowCardSimple;