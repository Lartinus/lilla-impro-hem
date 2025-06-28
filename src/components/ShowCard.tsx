// src/components/ShowCard.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import OptimizedImage from './OptimizedImage';
import { convertMarkdownToHtml } from '@/utils/markdownHelpers';
import React, { useState } from 'react';

export interface Show {
  id: number;
  title: string;
  date?: string;
  location?: string;
  mapLink?: string;
  slug?: string;
  image?: any;
  description?: string;
  practicalInfo?: string[];
  ticketPrice?: number;
  discountPrice?: number;
  availableTickets?: number;
}

interface ShowCardProps {
  show: Show;
  variant?: 'simple' | 'detailed';
}

export default function ShowCard({ show, variant = 'simple' }: ShowCardProps) {
  const [qty, setQty] = useState(1);
  const [code, setCode] = useState('');

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-4 border-white bg-white rounded-none flex flex-col">
      <CardContent className="p-0 flex flex-col flex-1">
        {show.image && (
          <OptimizedImage
            src={show.image}
            alt={show.title}
            className="w-full h-48 object-cover"
            preferredSize={variant === 'simple' ? 'medium' : 'large'}
          />
        )}

        <div className="p-4 flex-1 flex flex-col">
          {show.slug ? (
            <Link to={`/shows/${show.slug}`} className="text-xl font-bold mb-2 hover:underline">
              {show.title}
            </Link>
          ) : (
            <h2 className="text-xl font-bold mb-2">{show.title}</h2>
          )}

          {show.location && show.mapLink && (
            <h3 className="text-theatre-secondary mb-4">
              <a href={show.mapLink} target="_blank" rel="noopener noreferrer">
                {show.location}
              </a>
            </h3>
          )}

          {show.description && (
            <div
              className="rich-text mb-6 flex-1"
              dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(show.description) }}
            />
          )}

          {show.practicalInfo?.length && (
            <div className="mb-6">
              <h4 className="font-bold mb-2">Praktisk information</h4>
              <ul className="rich-text list-disc pl-5">
                {show.practicalInfo.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {variant === 'detailed' && show.ticketPrice != null && (
            <div className="mt-auto space-y-4">
              <div className="flex items-center justify-between">
                <span>Pris {show.ticketPrice} kr</span>
                <div className="flex items-center space-x-2">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}>–</button>
                  <span>{qty}</span>
                  <button onClick={() => setQty(q => q + 1)}>+</button>
                </div>
              </div>
              <Input
                placeholder="Rabattkod"
                value={code}
                onChange={e => setCode(e.target.value)}
              />
              <Button onClick={() => console.log('Köper', qty, 'med kod', code)}>Köp</Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
