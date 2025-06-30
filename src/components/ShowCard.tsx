
// src/components/ShowCard.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import PerformersSection, { Performer } from '@/components/PerformersSection';

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
  const [discountTickets, setDiscountTickets] = useState(0);
  const [discountCode, setDiscountCode] = useState('');

  const handleBuyTickets = () => {
    console.log(
      `Köper ${ticketCount} ordinarie och ${discountTickets} rabatterade biljetter till ${show.title}`
    );
    if (discountCode) console.log(`Rabattkod: ${discountCode}`);
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-4 border-white shadow-lg bg-white rounded-none flex flex-col">
      <CardContent className="p-6 lg:p-8 flex flex-col flex-1">
        {/* Titel & Plats */}
        <div className="mb-4">
          <h2 className="mb-2">{show.title}</h2>
          <p className="mb-1 text-sm text-content-secondary">
            <a
              href={show.mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {show.location}
            </a>
          </p>
        </div>

        {/* Beskrivning */}
        <div className="text-content-secondary leading-relaxed mb-6 text-base">
          {show.description.split('\n').map((para, idx) => (
            <p key={idx} className="mb-4 last:mb-0">
              {para}
            </p>
          ))}
        </div>

        {/* Medverkande */}
        <PerformersSection performers={show.performers} title="Medverkande" />

        {/* Praktisk info */}
        <div className="mb-6">
          <h4 className="text-content-primary font-bold mb-3">Praktisk information</h4>
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

        {/* Köp biljetter */}
        <div className="mt-auto">
          <h4 className="text-content-primary font-bold mb-4">Köp biljetter</h4>
          {/* Ordinarie */}
          <div className="bg-surface-secondary p-4 rounded-none border border-color-primary mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-content-primary font-medium">Pris 175kr</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setTicketCount(Math.max(0, ticketCount - 1))}
                  className="w-8 h-8 border border-color-primary rounded-none flex items-center justify-center hover:bg-surface-muted"
                >
                  –
                </button>
                <span className="w-8 text-center">{ticketCount}</span>
                <button
                  onClick={() => setTicketCount(ticketCount + 1)}
                  className="w-8 h-8 border border-color-primary rounded-none flex items-center justify-center hover:bg-surface-muted"
                >
                  +
                </button>
              </div>
            </div>
            <div className="mt-3">
              <Input
                placeholder="Ev. rabattkod"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                className="rounded-none border-color-primary"
              />
            </div>
          </div>

          {/* Rabatterade */}
          <div className="bg-surface-secondary p-4 rounded-none border border-color-primary mb-4">
            <div className="flex items-center justify-between">
              <span className="text-content-primary font-medium">Student/pensionär 145kr</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setDiscountTickets(Math.max(0, discountTickets - 1))}
                  className="w-8 h-8 border border-color-primary rounded-none flex items-center justify-center hover:bg-surface-muted"
                >
                  –
                </button>
                <span className="w-8 text-center">{discountTickets}</span>
                <button
                  onClick={() => setDiscountTickets(discountTickets + 1)}
                  className="w-8 h-8 border border-color-primary rounded-none flex items-center justify-center hover:bg-surface-muted"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <Button
            onClick={handleBuyTickets}
            className="bg-accent-color-primary hover:bg-accent-color-hover text-white px-4 py-2 rounded-none text-sm"
            disabled={ticketCount === 0 && discountTickets === 0}
          >
            Fortsätt →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShowCard;
