
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface Performer {
  id: number;
  name: string;
  image: string;
  bio: string;
}

interface Show {
  title: string;
  location: string;
  mapLink: string;
  description: string;
  performers: Performer[];
  practicalInfo: string[];
}

interface ShowCardProps {
  show: Show;
}

const ShowCard = ({ show }: ShowCardProps) => {
  const [ticketCount, setTicketCount] = useState(1);

  const handleBuyTickets = () => {
    // Här skulle man integrera med biljettförsäljning
    console.log(`Köper ${ticketCount} biljetter till ${show.title}`);
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-4 border-white shadow-lg bg-white rounded-none flex flex-col">
      <CardContent className="p-6 md:p-6 lg:p-8 flex flex-col flex-1">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-blue-500 mb-2">
            {show.title}
          </h2>
          <h3 className="text-theatre-secondary font-medium mb-1">
            <a 
              href={show.mapLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {show.location}
            </a>
          </h3>
        </div>
        
        <div className="text-gray-700 leading-relaxed mb-6 text-base" style={{ lineHeight: '1.5' }}>
          {show.description.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>
        
        {show.performers && show.performers.length > 0 && (
          <div className="mb-6">
            <h4 className="text-gray-800 font-bold mb-3">Medverkande</h4>
            <div className="bg-theatre-light/10 rounded-none border-3 border-red-800 p-4">
              <div className="space-y-6">
                {show.performers.map((performer) => (
                  <div key={performer.id} className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-4">
                    <img 
                      src={performer.image} 
                      alt={performer.name}
                      className="w-32 h-32 rounded-none object-cover object-top flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-gray-800 mb-2">
                        {performer.name}
                      </h5>
                      <p className="text-gray-700 leading-relaxed text-sm break-words">
                        {performer.bio}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <div className="mb-6">
          <h4 className="text-gray-800 font-bold mb-3">Praktisk information</h4>
          <div className="space-y-2">
            {show.practicalInfo.map((item, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                <p className="text-gray-700 text-base" style={{ lineHeight: '1.5' }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-auto">
          <div className="flex items-center space-x-4 mb-4">
            <label htmlFor="tickets" className="text-gray-800 font-medium">
              Antal biljetter:
            </label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                className="w-8 h-8 border border-gray-300 rounded-none flex items-center justify-center hover:bg-gray-100"
              >
                -
              </button>
              <span className="w-8 text-center">{ticketCount}</span>
              <button
                onClick={() => setTicketCount(ticketCount + 1)}
                className="w-8 h-8 border border-gray-300 rounded-none flex items-center justify-center hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>
          
          <Button 
            onClick={handleBuyTickets}
            className="w-full"
          >
            Köp
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShowCard;
