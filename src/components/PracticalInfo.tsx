import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface PracticalInfoProps {
  sessions?: number;
  hoursPerSession?: number;
  startDate?: string | null;
  startTime?: string | null;
  maxParticipants?: number | null;
  price?: number;
  discountPrice?: number;
  additionalInfo?: string;
  practicalInfoText?: string;
  currentParticipants?: number;
}

export const PracticalInfo = ({ 
  sessions = 8, 
  hoursPerSession = 2.5, 
  startDate, 
  startTime,
  maxParticipants = 12, 
  price, 
  discountPrice,
  additionalInfo,
  practicalInfoText,
  currentParticipants
}: PracticalInfoProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE', { 
      day: 'numeric', 
      month: 'long' 
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // Remove seconds, keep HH:MM
  };

  const getWeekdayInSwedish = (dateString: string) => {
    const date = new Date(dateString);
    const weekdays = ['söndagar', 'måndagar', 'tisdagar', 'onsdagar', 'torsdagar', 'fredagar', 'lördagar'];
    return weekdays[date.getDay()];
  };

  // Build practical info items from individual fields for better control
  const getPracticalItems = () => {
    const items = [];
    // Always use individual fields for structured data when available
    if (sessions && sessions > 0 && hoursPerSession && hoursPerSession > 0) {
      items.push(`${sessions} tillfällen à ${hoursPerSession}h`);
    }
    
    if (startDate) {
      if (startTime) {
        const weekday = getWeekdayInSwedish(startDate);
        const formattedTime = formatTime(startTime);
        items.push(`${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${formattedTime}, startdatum ${formatDate(startDate)}`);
      } else {
        items.push(`Startdatum ${formatDate(startDate)}`);
      }
    }
    
    if (maxParticipants && maxParticipants > 0) {
      items.push(`Max ${maxParticipants} deltagare`);
    }
    
    if (price && price > 0) {
      items.push(`Ordinarie pris: ${price} kr`);
    }
    
    if (discountPrice && discountPrice > 0) {
      items.push(`Rabatterat pris: ${discountPrice} kr (pensionär eller student)`);
    }
    
    // Add any additional practical info text at the end
    if (practicalInfoText) {
      // Only add text that doesn't duplicate the structured data above
      const textItems = practicalInfoText
        .split(/\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .filter(line => {
          // Filter out items that are already covered by structured data
          return !line.includes('tillfällen à') && 
                 !line.includes('Startdatum') && 
                 !line.includes('Max') && 
                 !line.includes('Ordinarie pris:') && 
                 !line.includes('Rabatterat pris:');
        });
      
      items.push(...textItems);
    }
    
    if (additionalInfo) {
      items.push(additionalInfo);
    }
    
    return items;
  };

  const items = getPracticalItems();

  // Calculate remaining spots
  const remainingSpots = maxParticipants && currentParticipants !== undefined 
    ? maxParticipants - currentParticipants 
    : null;
  
  const showFewSpotsWarning = remainingSpots !== null && remainingSpots <= 5 && remainingSpots > 0;

  if (items.length === 0) return null;

  return (
    <div className="mb-6">
      <h2 className="mb-2">Praktisk information</h2>
      
      {/* Few spots warning - show after the date info */}
      {showFewSpotsWarning && (
        <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
          <AlertTriangle className="w-4 h-4" />
          Få platser kvar
        </div>
      )}
      
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
            <span className="text-base">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};