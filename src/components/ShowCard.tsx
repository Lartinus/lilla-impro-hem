import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export interface Performer {
  id: number;
  name: string;
  image: string;
  bio: string;
}

export interface Show {
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
  const [ticketCount, setTicketCount] = useState(1);
  const [discountTickets, setDiscountTickets] = useState(0);
  const [discountCode, setDiscountCode] = useState('');

  const handleBuyTickets = () => {
    console.log(`Köper ${ticketCount} ordinarie och ${discountTickets} rabatterade biljetter till ${show.title}`);
    if (discountCode) console.log(`Rabattkod: ${discountCode}`);
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-4 border-white shadow-lg bg-white rounded-none flex flex-col">
      <CardContent className="p-6 lg:p-8 flex flex-col flex-1">
        {/* Titel & plats */}
        <div className="rich-text mb-4">
          <h2 className="mb-2">{show.title}</h2>
          <h3 className="text-secondary font-medium mb-1">
            <a href={show.mapLink}
               target="_blank"
               rel="noopener noreferrer"
               className="hover:underline">
              {show.location}
            </a>
          </h3>
        </div>

        {/* Beskrivning */}
        <div className="text-foreground mb-6 text-base leading-[1.4]">
          {show.description.split('\n').map((p,i) => (
            <p key={i} className="mb-4 last:mb-0">{p}</p>
          ))}
        </div>

        {/* Medverkande */}
        {show.performers.length > 0 && (
          <div className="mb-6">
            <h4 className="text-foreground font-bold mb-3">Medverkande</h4>
            <div className="bg-theatre-light/10 border-3 border-red-800 p-4 rounded-none">
              <div className="space-y-6">
                {show.performers.map(person => (
                  <div key={person.id} className="flex flex-col md:flex-row items-start md:space-x-4">
                    <img 
                      src={person.image} 
                      alt={person.name}
                      className="w-32 h-32 rounded-none object-cover flex-shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-foreground mb-2">{person.name}</h5>
                      <p className="text-foreground text-sm leading-relaxed">{person.bio}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Praktisk info */}
        <div className="mb-6">
          <h4 className="text-foreground font-bold mb-3">Praktisk information</h4>
          <ul className="list-disc pl-5 space-y-2">
            {show.practicalInfo.map((item, i) => (
              <li key={i} className="text-foreground text-base">{item}</li>
            ))}
          </ul>
        </div>

        {/* Köp-biljetter */}
        <div className="mt-auto">
          <h4 className="text-foreground font-bold mb-4">Köp biljetter</h4>

          {/* Ordinära */}
          <div className="bg-gray-50 p-4 border border-gray-200 rounded-none mb-4">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Pris {show.ticketPrice} kr</span>
              <div className="flex items-center space-x-2">
                <button onClick={() => setTicketCount(Math.max(0, ticketCount-1))}
                        className="w-8 h-8 border border-gray-300 rounded-none hover:bg-gray-100">–</button>
                <span className="w-8 text-center">{ticketCount}</span>
                <button onClick={() => setTicketCount(ticketCount+1)}
                        className="w-8 h-8 border border-gray-300 rounded-none hover:bg-gray-100">+</button>
              </div>
            </div>
            <Input placeholder="Ev. rabattkod"
                   value={discountCode}
                   onChange={e => setDiscountCode(e.target.value)}
                   className="rounded-none border-gray-300" />
          </div>

          {/* Rabatterade */}
          <div className="bg-gray-50 p-4 border border-gray-200 rounded-none mb-4">
            <div className="flex justify-between">
              <span className="font-medium">Student/pensionär {show.discountPrice} kr</span>
              <div className="flex items-center space-x-2">
                <button onClick={() => setDiscountTickets(Math.max(0, discountTickets-1))}
                        className="w-8 h-8 border border-gray-300 rounded-none hover:bg-gray-100">–</button>
                <span className="w-8 text-center">{discountTickets}</span>
                <button onClick={() => setDiscountTickets(discountTickets+1)}
                        className="w-8 h-8 border border-gray-300 rounded-none hover:bg-gray-100">+</button>
              </div>
            </div>
          </div>

          <Button onClick={handleBuyTickets}
                  disabled={ticketCount+discountTickets===0}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-none text-sm">
            Fortsätt →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShowCard;
