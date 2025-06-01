
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
        year: 'numeric',
        month: 'long',
        day: 'numeric'
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
    <Card className="group hover:shadow-xl transition-all duration-300 border-4 border-white shadow-lg bg-white rounded-none">
      <CardContent className="p-6">
        {/* Show Image */}
        {show.image && (
          <div className="w-full h-48 mb-4">
            <img 
              src={show.image} 
              alt={show.title}
              className="w-full h-full object-cover rounded-none"
            />
          </div>
        )}

        <div className="mb-4">
          <h2 className="text-xl font-bold text-blue-500 mb-2">
            {show.title}
          </h2>
          <div className="space-y-1">
            <p className="text-theatre-secondary font-medium">
              {formatDate(show.date)}
              {formatTime(show.time) && ` • ${formatTime(show.time)}`}
            </p>
            <p className="text-theatre-secondary">
              {show.location}
            </p>
          </div>
        </div>
        
        <Link 
          to={`/shows/${show.slug}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          Läs mer →
        </Link>
      </CardContent>
    </Card>
  );
};

export default ShowCardSimple;
