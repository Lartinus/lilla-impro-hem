
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

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
  if (shows.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-theatre-light mb-6">Fler föreställningar</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {shows.map((show) => (
          <Link key={show.id} to={`/shows/${show.slug}`} className="block">
            <div className="border-4 border-white bg-white rounded-none p-4 hover:shadow-lg transition-all duration-300 group">
              <div className="flex flex-col">
                <div className="flex-1 mb-3">
                  <h4 className="text-blue-500 font-bold text-base mb-1">
                    <span className="block md:hidden">{show.title}</span>
                    <span className="hidden md:block">{show.title}</span>
                  </h4>
                  <div className="block md:hidden text-blue-500 font-bold text-base mb-2">
                    {show.date}
                  </div>
                  <div className="hidden md:block text-blue-500 font-bold text-base mb-2">
                    {show.date}
                  </div>
                  <div className="flex items-center mb-2">
                    <MapPin size={14} className="text-red-800 mr-1" />
                    <p className="text-red-800 text-sm">{show.location}</p>
                  </div>
                  <div className="text-blue-500 group-hover:text-blue-700 transition-colors">
                    <span className="text-sm">Läs mer →</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <img 
                    src={show.image} 
                    alt={show.title}
                    className="w-full h-32 rounded-none object-cover object-top"
                  />
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
