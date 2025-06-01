
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

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

const ShowCardSimple = ({ show }: ShowCardSimpleProps) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('sv-SE', {
        day: 'numeric',
        month: 'long'
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeData: any) => {
    if (!timeData || timeData.value === 'undefined') return '';
    if (typeof timeData === 'string') return timeData;
    return '';
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-4 border-white shadow-lg bg-white rounded-none overflow-hidden">
      <CardContent className="p-0">
        {/* Show Image */}
        {show.image && (
          <div className="w-full h-48 md:h-56">
            <img 
              src={show.image} 
              alt={show.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-4">
          <h2 className="text-lg font-bold text-blue-500 mb-2">
            {show.title}
          </h2>
          
          <div className="space-y-1 mb-4">
            <p className="text-blue-500 font-medium">
              {formatDate(show.date)}
              {formatTime(show.time) && ` ${formatTime(show.time)}`}
            </p>
            <p className="text-red-600 text-sm flex items-center">
              <span className="mr-1">📍</span>
              {show.location}
            </p>
          </div>
          
          <Link 
            to={`/shows/${show.slug}`}
            className="inline-flex items-center text-blue-500 hover:text-blue-700 font-medium transition-colors text-sm"
          >
            Läs mer →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShowCardSimple;
