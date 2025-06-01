
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import PerformersSection from './PerformersSection';
import { convertMarkdownToHtml } from '@/utils/markdownHelpers';

interface Performer {
  id: number;
  name: string;
  image: string;
  bio: string;
}

interface Show {
  id: number;
  title: string;
  date: string;
  location: string;
  slug: string;
  description: string;
  performers: Performer[];
  practicalInfo: string[];
  mapLink: string;
  ticketPrice: number;
  discountPrice: number;
  availableTickets: number;
}

interface ShowCardFromStrapiProps {
  show: Show;
}

const ShowCardFromStrapi = ({ show }: ShowCardFromStrapiProps) => {
  const [ticketCount, setTicketCount] = useState(1);
  const [discountTickets, setDiscountTickets] = useState(0);
  const [discountCode, setDiscountCode] = useState('');

  const handleBuyTickets = () => {
    console.log(`Köper ${ticketCount} ordinarie biljetter och ${discountTickets} rabatterade biljetter till ${show.title}`);
    if (discountCode) {
      console.log(`Rabattkod: ${discountCode}`);
    }
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-4 border-white shadow-lg bg-white rounded-none flex flex-col">
      <CardContent className="p-6 md:p-6 lg:p-8 flex flex-col flex-1">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-blue-500 mb-2">
            {show.title} {show.date}
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
        
        <div 
          className="text-gray-700 leading-relaxed mb-6 text-base" 
          style={{ lineHeight: '1.4' }}
          dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(show.description) }}
        />
        
        {show.performers && show.performers.length > 0 && (
          <PerformersSection performers={show.performers} />
        )}
        
        {show.practicalInfo && show.practicalInfo.length > 0 && (
          <div className="mb-6">
            <h4 className="text-gray-800 font-bold mb-3">Praktisk information</h4>
            <div className="space-y-2">
              {show.practicalInfo.map((item, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2 bullet-point"></div>
                  <p className="text-gray-700 text-base" style={{ lineHeight: '1.4' }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-auto">
          <h4 className="text-gray-800 font-bold mb-4">Köp biljetter</h4>
          
          {/* Regular tickets */}
          <div className="bg-gray-50 p-4 rounded-none border border-gray-200 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-800 font-medium">Pris {show.ticketPrice}kr</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setTicketCount(Math.max(0, ticketCount - 1))}
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
            
            {/* Discount code */}
            <div className="mt-3">
              <Input
                placeholder="Ev. rabattkod"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                className="rounded-none border-gray-300"
              />
            </div>
          </div>

          {/* Discount tickets */}
          <div className="bg-gray-50 p-4 rounded-none border border-gray-200 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-800 font-medium">Student/pensionär {show.discountPrice}kr</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setDiscountTickets(Math.max(0, discountTickets - 1))}
                  className="w-8 h-8 border border-gray-300 rounded-none flex items-center justify-center hover:bg-gray-100"
                >
                  -
                </button>
                <span className="w-8 text-center">{discountTickets}</span>
                <button
                  onClick={() => setDiscountTickets(discountTickets + 1)}
                  className="w-8 h-8 border border-gray-300 rounded-none flex items-center justify-center hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleBuyTickets}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-none text-sm"
            disabled={ticketCount === 0 && discountTickets === 0}
          >
            Fortsätt →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShowCardFromStrapi;
