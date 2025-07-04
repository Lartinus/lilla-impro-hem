import React from 'react';

interface PracticalInfoProps {
  sessions?: number;
  hoursPerSession?: number;
  startDate?: string | null;
  maxParticipants?: number | null;
  price?: number;
  discountPrice?: number;
  additionalInfo?: string;
  practicalInfoText?: string;
}

export const PracticalInfo = ({ 
  sessions = 8, 
  hoursPerSession = 2.5, 
  startDate, 
  maxParticipants = 12, 
  price, 
  discountPrice,
  additionalInfo,
  practicalInfoText
}: PracticalInfoProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE', { 
      day: 'numeric', 
      month: 'long' 
    });
  };

  // Parse practical info text if provided, otherwise use defaults
  const getPracticalItems = () => {
    const items = [];
    
    if (practicalInfoText) {
      // Split by common delimiters and clean up
      const lines = practicalInfoText
        .split(/[,\n\r•\-]/)
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      return lines;
    }
    
    // Default items if no practical info provided
    items.push(`${sessions} tillfällen à ${hoursPerSession}h`);
    
    if (startDate) {
      items.push(`Startdatum: ${formatDate(startDate)}`);
    }
    
    if (maxParticipants) {
      items.push(`Max ${maxParticipants} deltagare`);
    }
    
    if (price && price > 0) {
      items.push(`Ordinarie pris: ${price} kr`);
    }
    
    if (discountPrice && discountPrice > 0) {
      items.push(`Rabatterat pris: ${discountPrice} kr (pensionär, student eller omtag)`);
    }
    
    if (additionalInfo) {
      items.push(additionalInfo);
    }
    
    return items;
  };

  const items = getPracticalItems();

  if (items.length === 0) return null;

  return (
    <div className="mb-6">
      <h4 className="font-semibold text-lg mb-4">Praktisk information</h4>
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