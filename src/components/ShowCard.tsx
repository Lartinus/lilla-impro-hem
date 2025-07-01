
// src/components/ShowCard.tsx
import { Card, CardContent } from '@/components/ui/card';
import PerformersSection, { Performer } from '@/components/PerformersSection';

interface Show {
  title: string;
  location: string;
  mapLink: string;
  description: string;
  performers: Performer[];
  practicalInfo: string[];
  ticketPrice: number;
  discountPrice: number;
  availableTickets: number;
}

interface ShowCardProps {
  show: Show;
}

const ShowCard = ({ show }: ShowCardProps) => {
  return (
    <Card className="
      group hover:shadow-xl 
      transition-all duration-300 
      border-4 border-white shadow-lg bg-white 
      rounded-none flex flex-col
      w-screen
      max-w-none
      px-0
      md:w-auto md:px-0">
      <CardContent className="p-0 md:p-6 lg:p-8 flex flex-col flex-1">
        {/* Titel & Plats */}
        <div className="mb-4 px-1 md:px-0">
          <h2 className="mb-2">{show.title}</h2>
          <div className="mb-1">
            <span 
              onClick={() => window.open(show.mapLink, '_blank')}
              className="cursor-pointer show-location-override"
            >
              {show.location}
            </span>
          </div>
        </div>

        {/* Beskrivning */}
        <div className="text-content-secondary leading-relaxed mb-6 text-base px-1 md:px-0">
          {show.description.split('\n').map((para, idx) => (
            <p key={idx} className="mb-4 last:mb-0">
              {para}
            </p>
          ))}
        </div>

        {/* Medverkande */}
        <div className="px-1 md:px-0">
          <PerformersSection performers={show.performers} title="Medverkande" />
        </div>

        {/* Praktisk info */}
        <div className="mb-6 px-1 md:px-0">
          <div className="text-content-primary font-bold mb-3">Praktisk information</div>
          <div className="space-y-2">
            {show.practicalInfo.map((item, idx) => (
              <div key={idx} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent-color-primary rounded-full flex-shrink-0 mt-2" />
                <p className="text-content-secondary text-base">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShowCard;
